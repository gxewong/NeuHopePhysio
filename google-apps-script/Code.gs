/**
 * NeuHope Physiotherapy 曦望物理治疗 — appointment requests
 * ------------------------------------------------------------------
 * What this script does:
 *   1. Receives appointment requests from the website form.
 *   2. Saves each request as a row in this Google Sheet.
 *   3. Adds a yellow "PENDING" event to the clinic's Google Calendar.
 *   4. Emails the clinic with Accept / Decline buttons.
 *   5. Accept  → the event turns green and the patient is emailed a confirmation.
 *      Decline → the event is removed and the patient is emailed that the
 *                clinic will contact them to arrange another time.
 *
 * Protection built in:
 *   • Every request is checked again here (opening hours, closed dates, past
 *     dates, email/phone format), even if someone bypasses the website.
 *   • Rate limits stop one person — or a spam bot — flooding the calendar and inbox.
 *   • If something goes wrong, the clinic gets an alert email.
 *   • Closed dates (public holidays, leave) are read from the "Closed dates"
 *     tab of the spreadsheet, and the website blocks those dates too.
 *
 * Setup instructions are in the project README:
 *   "Connect appointment requests to Google Calendar".
 *
 * Only the CONFIG section below should normally be changed.
 */

/* ============================ CONFIG ============================ */

const CONFIG = {
  CLINIC_NAME: 'NeuHope Physiotherapy 曦望物理治疗',
  CLINIC_ADDRESS: "101, Jln Adda 3/1, Adda Heights, 81100 Johor Bahru, Johor Darul Ta'zim",
  CLINIC_PHONE: '+60 128080432',

  /** Who receives the "new request" emails. Leave '' to use the Google account that runs this script. */
  NOTIFY_EMAIL: '',

  /** Which calendar to use. 'primary' = the main calendar of the account running this script. */
  CALENDAR_ID: 'primary',

  TIMEZONE: 'Asia/Kuala_Lumpur',

  /** Appointment lengths in minutes — must match the website's appointment types. */
  DURATIONS: { 'initial': 90, 'follow-up': 60 },

  /**
   * Bookable hours — must match `booking.hours` in the website's src/data/site.ts.
   * Day 0 = Sunday … 6 = Saturday. null = closed. Appointments must finish by closing time.
   */
  HOURS: {
    0: null,
    1: ['09:00', '18:00'],
    2: ['09:00', '18:00'],
    3: ['09:00', '18:00'],
    4: ['09:00', '18:00'],
    5: ['09:00', '18:00'],
    6: ['09:00', '15:00'],
  },
  /** Start times must fall on this step, e.g. 30 → 9:00, 9:30, 10:00 … */
  SLOT_STEP_MINUTES: 30,
  /** How far ahead patients may request (in days). */
  MAX_DAYS_AHEAD: 180,

  /** Rate limits (per rolling hour). */
  MAX_REQUESTS_PER_PERSON_PER_HOUR: 3, // same email or same phone number
  MAX_REQUESTS_TOTAL_PER_HOUR: 20, // everyone combined — protects the daily email limit

  SHEET_NAME: 'Appointment requests',
  CLOSED_SHEET_NAME: 'Closed dates',
};

/* ========================= END OF CONFIG ========================= */

const HEADERS = [
  'Request ID', 'Received', 'Status', 'Full name', 'Phone', 'Email', 'Preferred contact',
  'Appointment type', 'Service', 'Date', 'Start time', 'End time', 'Message', 'Calendar event ID', 'Token',
];
const COL = Object.fromEntries(HEADERS.map((h, i) => [h, i + 1]));

/** Run this once from the Apps Script editor to create the sheets and grant permissions. */
function setup() {
  const sheet = getSheet_();
  const closed = getClosedSheet_();
  const cal = getCalendar_();
  Logger.log('Setup complete. Sheets: "%s" and "%s". Calendar: "%s". Notifications go to: %s',
    sheet.getName(), closed.getName(), cal.getName(), notifyEmail_());
}

/* ----------------------- Website form → here ----------------------- */

function doPost(e) {
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    // Spam trap from the website — silently ignore
    if (d.website) return json_({ ok: true });

    const problem = validate_(d);
    if (problem) return json_(Object.assign({ ok: false }, problem));

    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      const limited = checkRateLimit_(d);
      if (limited) return json_(Object.assign({ ok: false }, limited));

      const minutes = CONFIG.DURATIONS[d.appointmentType] || 60;
      const start = Utilities.parseDate(d.date + ' ' + d.time, CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm');
      const end = new Date(start.getTime() + minutes * 60 * 1000);
      const typeLabel = clean_(d.appointmentTypeLabel || d.appointmentType);
      const id = 'R' + Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyMMddHHmmss') + Math.floor(Math.random() * 90 + 10);
      const token = Utilities.getUuid().replace(/-/g, '');

      const event = getCalendar_().createEvent(
        'PENDING – ' + clean_(d.fullName) + ' (' + typeLabel + ')',
        start, end,
        { description: describe_(d, typeLabel, id), location: CONFIG.CLINIC_ADDRESS },
      );
      event.setColor(CalendarApp.EventColor.YELLOW);

      getSheet_().appendRow([
        id, new Date(), 'Pending', clean_(d.fullName), "'" + clean_(d.phone), clean_(d.email), clean_(d.contactMethod),
        typeLabel, clean_(d.service), "'" + d.date, "'" + d.time, "'" + fmt_(end, 'HH:mm'), clean_(d.message), event.getId(), token,
      ]);

      notifyClinic_(d, typeLabel, start, end, id, token);
    } finally {
      lock.releaseLock();
    }
    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    alertClinic_('Saving an appointment request failed', err, e);
    return json_({ ok: false, error: 'server', message: 'Something went wrong on our side.' });
  }
}

/* ------------------- Checks (repeat the website's rules) ------------------- */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Returns null if the request is fine, or { error, field?, message } if not. */
function validate_(d) {
  const bad = (field, message) => ({ error: 'invalid', field: field, message: message });
  const str = (k) => String(d[k] == null ? '' : d[k]).trim();

  if (str('fullName').length < 2 || str('fullName').length > 120) return bad('fullName', 'Please enter your full name.');
  const digits = str('phone').replace(/\D/g, '');
  if (!/^\+?[\d\s\-()]+$/.test(str('phone')) || digits.length < 8 || digits.length > 15) {
    return bad('phone', 'Please enter a valid phone number.');
  }
  if (!EMAIL_RE.test(str('email')) || str('email').length > 200) return bad('email', 'Please enter a valid email address.');
  if (!CONFIG.DURATIONS[str('appointmentType')]) return bad('appointmentType', 'Please choose the type of appointment.');
  if (!str('service') || str('service').length > 120) return bad('service', 'Please choose a service.');
  if (str('message').length > 1000) return bad('message', 'Please keep your message shorter.');

  const date = str('date');
  const time = str('time');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return bad('date', 'Please choose a valid date.');
  if (!/^\d{2}:\d{2}$/.test(time)) return bad('time', 'Please choose a valid start time.');

  const today = fmt_(new Date(), 'yyyy-MM-dd');
  if (date < today) return bad('date', 'Please choose today or a future date.');
  const latest = fmt_(new Date(Date.now() + CONFIG.MAX_DAYS_AHEAD * 86400000), 'yyyy-MM-dd');
  if (date > latest) return bad('date', 'Please choose a date within the next ' + Math.round(CONFIG.MAX_DAYS_AHEAD / 30) + ' months.');

  const closed = getClosedDates_();
  if (closed[date] !== undefined) {
    return { error: 'closed', field: 'date', message: 'The clinic is closed on this day' + (closed[date] ? ' (' + closed[date] + ')' : '') + '. Please choose another date.' };
  }

  const start = Utilities.parseDate(date + ' 12:00', CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm');
  const day = Number(fmt_(start, 'u')) % 7; // 'u' = 1 (Mon) … 7 (Sun) → 0 = Sunday
  const hours = CONFIG.HOURS[day];
  if (!hours) return { error: 'closed', field: 'date', message: 'The clinic is closed on this day. Please choose another date.' };

  const mins = (hhmm) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));
  const t = mins(time);
  const length = CONFIG.DURATIONS[str('appointmentType')];
  if ((t - mins(hours[0])) % CONFIG.SLOT_STEP_MINUTES !== 0 || t < mins(hours[0]) || t + length > mins(hours[1])) {
    return bad('time', 'This time is outside opening hours for the chosen day and appointment type.');
  }
  if (date === today && t <= mins(fmt_(new Date(), 'HH:mm'))) return bad('time', 'Please choose a time later today or another day.');
  return null;
}

/** Counts requests per email, per phone and overall in the last hour. Call inside the lock. */
function checkRateLimit_(d) {
  const cache = CacheService.getScriptCache();
  const hourKey = fmt_(new Date(), 'yyyyMMddHH');
  const keys = {
    email: 'rl:e:' + hourKey + ':' + String(d.email).trim().toLowerCase(),
    phone: 'rl:p:' + hourKey + ':' + String(d.phone).replace(/\D/g, ''),
    all: 'rl:all:' + hourKey,
  };
  const counts = cache.getAll(Object.values(keys));
  const n = (k) => Number(counts[k] || 0);

  if (n(keys.email) >= CONFIG.MAX_REQUESTS_PER_PERSON_PER_HOUR || n(keys.phone) >= CONFIG.MAX_REQUESTS_PER_PERSON_PER_HOUR) {
    return { error: 'rate_limited', message: 'You have already sent several requests recently. Please call or WhatsApp the clinic instead.' };
  }
  if (n(keys.all) >= CONFIG.MAX_REQUESTS_TOTAL_PER_HOUR) {
    alertClinic_('Appointment form paused for this hour',
      'More than ' + CONFIG.MAX_REQUESTS_TOTAL_PER_HOUR + ' requests arrived in one hour, so new requests are being turned away until the next hour. ' +
      'If these are real patients, raise MAX_REQUESTS_TOTAL_PER_HOUR in the script. If it looks like spam, nothing else needs doing.', null);
    return { error: 'rate_limited', message: 'We are receiving a lot of requests right now. Please call or WhatsApp the clinic instead.' };
  }

  const ttl = 3600;
  cache.putAll({
    [keys.email]: String(n(keys.email) + 1),
    [keys.phone]: String(n(keys.phone) + 1),
    [keys.all]: String(n(keys.all) + 1),
  }, ttl);
  return null;
}

/* ------------------------- Closed dates ------------------------- */

function getClosedSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.CLOSED_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.CLOSED_SHEET_NAME);
    sheet.appendRow(['Date', 'Reason (optional, shown to patients)']);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, 2).setFontWeight('bold').setBackground('#E6F0EF');
    sheet.setColumnWidth(1, 140);
    sheet.setColumnWidth(2, 320);
    sheet.getRange('A2:A').setNumberFormat('yyyy-mm-dd');
  }
  return sheet;
}

/** { 'yyyy-MM-dd': 'reason' } for every date listed in the "Closed dates" tab */
function getClosedDates_() {
  const sheet = getClosedSheet_();
  const last = sheet.getLastRow();
  const out = {};
  if (last < 2) return out;
  sheet.getRange(2, 1, last - 1, 2).getValues().forEach((r) => {
    if (!r[0]) return;
    const key = r[0] instanceof Date ? fmt_(r[0], 'yyyy-MM-dd') : String(r[0]).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(key)) out[key] = String(r[1] || '').trim();
  });
  return out;
}

/* ------------------------- Error alerts ------------------------- */

/** Emails the clinic when something fails. At most one alert per 30 minutes per subject. */
function alertClinic_(subject, err, e) {
  try {
    const cache = CacheService.getScriptCache();
    const key = 'alert:' + subject;
    if (cache.get(key)) return;
    cache.put(key, '1', 1800);
    const detail = err instanceof Error ? (err.stack || err.message) : String(err);
    MailApp.sendEmail({
      to: notifyEmail_(),
      subject: '⚠️ ' + subject + ' – website appointment form',
      htmlBody:
        '<div style="font-family:Arial,sans-serif;max-width:560px;color:#233534;line-height:1.6">' +
        '<p><b>' + esc_(subject) + '.</b></p>' +
        '<pre style="white-space:pre-wrap;background:#f4f7f7;padding:12px;border-radius:8px">' + esc_(detail) + '</pre>' +
        (e ? '<p>A patient may have tried to send a request and seen an error. Their details (if any) were:</p><pre style="white-space:pre-wrap;background:#f4f7f7;padding:12px;border-radius:8px">' +
          esc_(safePreview_(e)) + '</pre>' : '') +
        '<p>See <b>Executions</b> in the Apps Script editor for more detail. The README section "If something goes wrong" lists common fixes.</p></div>',
      name: CONFIG.CLINIC_NAME,
    });
  } catch (ignored) {
    console.error('Could not send alert', ignored);
  }
}

function safePreview_(e) {
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    return ['fullName', 'phone', 'email', 'appointmentTypeLabel', 'service', 'date', 'time']
      .map((k) => k + ': ' + clean_(d[k])).join('\n');
  } catch (x) {
    return '(could not read request)';
  }
}

/* ------------------- Accept / Decline links → here ------------------- */

function doGet(e) {
  const p = (e && e.parameter) || {};

  // Website asks which dates are closed (public holidays, leave)
  if (p.action === 'closed-dates') {
    try {
      const today = fmt_(new Date(), 'yyyy-MM-dd');
      const all = getClosedDates_();
      const upcoming = {};
      Object.keys(all).filter((k) => k >= today).forEach((k) => { upcoming[k] = all[k]; });
      return json_({ ok: true, closedDates: upcoming });
    } catch (err) {
      alertClinic_('Reading closed dates failed', err, null);
      return json_({ ok: false, error: 'server' });
    }
  }

  try {
    return handleDecision_(p);
  } catch (err) {
    console.error(err);
    alertClinic_('Accepting or declining a request failed', err, null);
    return page_('Something went wrong', '<p>The request could not be updated. Please try again in a minute. If it keeps happening, check <b>Executions</b> in the Apps Script editor.</p>');
  }
}

function handleDecision_(p) {
  if (!p.id || !p.token || ['accept', 'decline'].indexOf(p.action) === -1) {
    return page_('NeuHope appointments', '<p>This link is not valid.</p>');
  }

  const sheet = getSheet_();
  const row = findRow_(sheet, p.id);
  if (!row) return page_('Request not found', '<p>This request could not be found in the sheet.</p>');

  const get = (h) => sheet.getRange(row, COL[h]).getValue();
  if (String(get('Token')) !== String(p.token)) return page_('Link not valid', '<p>This link is not valid.</p>');

  const status = String(get('Status'));
  const name = get('Full name');
  const when = describeWhen_(get('Date'), get('Start time'), get('End time'));

  if (status !== 'Pending') {
    return page_('Already handled', '<p>This request for <b>' + esc_(name) + '</b> (' + esc_(when) + ') is already marked <b>' + esc_(status) + '</b>.</p>');
  }

  // Step 1: show a confirmation button (stops email link-scanners from accepting by accident)
  if (p.confirm !== '1') {
    const verb = p.action === 'accept' ? 'Accept' : 'Decline';
    const url = ScriptApp.getService().getUrl() + '?action=' + p.action + '&id=' + encodeURIComponent(p.id) +
      '&token=' + encodeURIComponent(p.token) + '&confirm=1';
    return page_(verb + ' appointment?',
      '<p><b>' + esc_(name) + '</b><br>' + esc_(get('Appointment type')) + ' · ' + esc_(get('Service')) + '<br>' + esc_(when) + '</p>' +
      '<p><a class="btn ' + (p.action === 'accept' ? 'ok' : 'no') + '" href="' + url + '" target="_top">' + verb + ' this appointment</a></p>');
  }

  // Step 2: do it
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const event = safeEvent_(get('Calendar event ID'));
    const patientEmail = String(get('Email'));
    const typeLabel = String(get('Appointment type'));

    if (p.action === 'accept') {
      if (event) {
        event.setTitle(name + ' – ' + typeLabel);
        event.setColor(CalendarApp.EventColor.GREEN);
      }
      sheet.getRange(row, COL['Status']).setValue('Confirmed');
      emailPatientConfirmed_(patientEmail, name, typeLabel, String(get('Service')), get('Date'), get('Start time'), get('End time'));
      return page_('Appointment confirmed', '<p>✅ <b>' + esc_(name) + '</b> is booked for ' + esc_(when) + '.</p><p>A confirmation email has been sent to ' + esc_(patientEmail) + '.</p>');
    }

    if (event) event.deleteEvent();
    sheet.getRange(row, COL['Status']).setValue('Declined');
    emailPatientDeclined_(patientEmail, name, when);
    return page_('Request declined', '<p>The request from <b>' + esc_(name) + '</b> has been declined and removed from the calendar.</p><p>The patient has been emailed that the clinic will contact them to arrange another time.</p>');
  } finally {
    lock.releaseLock();
  }
}

/* ------------------------------ Emails ------------------------------ */

function notifyClinic_(d, typeLabel, start, end, id, token) {
  const base = ScriptApp.getService().getUrl();
  const link = (action) => base + '?action=' + action + '&id=' + encodeURIComponent(id) + '&token=' + token;
  const when = fmt_(start, 'EEE d MMM yyyy, h:mm a') + ' – ' + fmt_(end, 'h:mm a');

  const html =
    '<div style="font-family:Arial,sans-serif;max-width:560px;color:#233534">' +
    '<h2 style="color:#255957;margin:0 0 12px">New appointment request</h2>' +
    '<table style="border-collapse:collapse;width:100%;font-size:15px">' +
    row_('Name', d.fullName) + row_('Phone', d.phone) + row_('Email', d.email) +
    row_('Preferred contact', d.contactMethod) + row_('Appointment', typeLabel) + row_('Service', d.service) +
    row_('Requested time', when) + (d.message ? row_('Message', d.message) : '') +
    '</table>' +
    '<p style="margin:20px 0 8px">Check your calendar for clashes (the request is shown as a yellow <b>PENDING</b> event), then:</p>' +
    '<p><a href="' + link('accept') + '" style="background:#255957;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:bold;display:inline-block;margin-right:8px">Accept</a>' +
    '<a href="' + link('decline') + '" style="background:#fff;color:#255957;border:2px solid #255957;padding:10px 22px;border-radius:999px;text-decoration:none;font-weight:bold;display:inline-block">Decline</a></p>' +
    '<p style="font-size:12px;color:#6b7b77">Request ID ' + esc_(id) + '. To suggest another time, decline and contact the patient directly.</p></div>';

  MailApp.sendEmail({
    to: notifyEmail_(),
    replyTo: clean_(d.email),
    subject: 'New appointment request: ' + clean_(d.fullName) + ' – ' + fmt_(start, 'EEE d MMM, h:mm a'),
    htmlBody: html,
    name: CONFIG.CLINIC_NAME,
  });
}

function emailPatientConfirmed_(to, name, typeLabel, service, date, startTime, endTime) {
  const start = Utilities.parseDate(dateStr_(date) + ' ' + timeStr_(startTime), CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm');
  const end = Utilities.parseDate(dateStr_(date) + ' ' + timeStr_(endTime), CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm');
  const gcal = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    '&text=' + encodeURIComponent(typeLabel + ' – ' + CONFIG.CLINIC_NAME) +
    '&dates=' + Utilities.formatDate(start, 'UTC', "yyyyMMdd'T'HHmmss'Z'") + '/' + Utilities.formatDate(end, 'UTC', "yyyyMMdd'T'HHmmss'Z'") +
    '&location=' + encodeURIComponent(CONFIG.CLINIC_ADDRESS);

  const html =
    '<div style="font-family:Arial,sans-serif;max-width:560px;color:#233534;font-size:15px;line-height:1.6">' +
    '<h2 style="color:#255957">Your appointment is confirmed</h2>' +
    '<p>Dear ' + esc_(name) + ',</p>' +
    '<p>Thank you for choosing ' + esc_(CONFIG.CLINIC_NAME) + '. Your appointment is confirmed:</p>' +
    '<table style="border-collapse:collapse;width:100%">' +
    row_('Appointment', typeLabel) + row_('Service', service) +
    row_('Date & time', fmt_(start, 'EEEE, d MMMM yyyy') + ', ' + fmt_(start, 'h:mm a') + ' – ' + fmt_(end, 'h:mm a')) +
    row_('Address', CONFIG.CLINIC_ADDRESS) + '</table>' +
    '<p><a href="' + gcal + '" style="color:#255957;font-weight:bold">Add to Google Calendar</a></p>' +
    '<p>Please bring any relevant medical reports, imaging results and a list of current medications. ' +
    'If you need to change or cancel, please call us on ' + esc_(CONFIG.CLINIC_PHONE) + ' or reply to this email.</p>' +
    '<p>We look forward to seeing you.<br>' + esc_(CONFIG.CLINIC_NAME) + '</p></div>';

  MailApp.sendEmail({
    to: to,
    replyTo: notifyEmail_(),
    subject: 'Appointment confirmed – ' + fmt_(start, 'EEE d MMM, h:mm a') + ' – ' + CONFIG.CLINIC_NAME,
    htmlBody: html,
    name: CONFIG.CLINIC_NAME,
  });
}

function emailPatientDeclined_(to, name, when) {
  const html =
    '<div style="font-family:Arial,sans-serif;max-width:560px;color:#233534;font-size:15px;line-height:1.6">' +
    '<p>Dear ' + esc_(name) + ',</p>' +
    '<p>Thank you for your appointment request with ' + esc_(CONFIG.CLINIC_NAME) + '. Unfortunately the time you requested (' +
    esc_(when) + ') is not available.</p>' +
    '<p>We will contact you shortly to arrange another suitable time. You are also welcome to call us on ' +
    esc_(CONFIG.CLINIC_PHONE) + ' or reply to this email.</p>' +
    '<p>Kind regards,<br>' + esc_(CONFIG.CLINIC_NAME) + '</p></div>';

  MailApp.sendEmail({
    to: to,
    replyTo: notifyEmail_(),
    subject: 'About your appointment request – ' + CONFIG.CLINIC_NAME,
    htmlBody: html,
    name: CONFIG.CLINIC_NAME,
  });
}

/* ----------------------------- Helpers ----------------------------- */

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(CONFIG.SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#E6F0EF');
    sheet.hideColumns(COL['Calendar event ID'], 2); // event ID + token are for the script only
  }
  return sheet;
}

function getCalendar_() {
  const cal = CONFIG.CALENDAR_ID === 'primary'
    ? CalendarApp.getDefaultCalendar()
    : CalendarApp.getCalendarById(CONFIG.CALENDAR_ID);
  if (!cal) throw new Error('Calendar not found: ' + CONFIG.CALENDAR_ID);
  return cal;
}

function notifyEmail_() {
  return CONFIG.NOTIFY_EMAIL || Session.getEffectiveUser().getEmail();
}

function findRow_(sheet, id) {
  const ids = sheet.getRange(2, COL['Request ID'], Math.max(sheet.getLastRow() - 1, 1), 1).getValues();
  for (let i = 0; i < ids.length; i++) if (String(ids[i][0]) === String(id)) return i + 2;
  return 0;
}

function safeEvent_(eventId) {
  try { return eventId ? getCalendar_().getEventById(String(eventId)) : null; } catch (e) { return null; }
}

function describe_(d, typeLabel, id) {
  return [
    'Status: PENDING — see the email for Accept / Decline.',
    '', 'Name: ' + clean_(d.fullName), 'Phone: ' + clean_(d.phone), 'Email: ' + clean_(d.email),
    'Preferred contact: ' + clean_(d.contactMethod), 'Appointment: ' + typeLabel, 'Service: ' + clean_(d.service),
    d.message ? 'Message: ' + clean_(d.message) : '', '', 'Request ID: ' + id,
  ].join('\n');
}

/** Sheet cells may come back as Date objects — normalise to strings */
function dateStr_(v) { return v instanceof Date ? Utilities.formatDate(v, CONFIG.TIMEZONE, 'yyyy-MM-dd') : String(v); }
function timeStr_(v) { return v instanceof Date ? Utilities.formatDate(v, CONFIG.TIMEZONE, 'HH:mm') : String(v); }

function describeWhen_(date, startTime, endTime) {
  const start = Utilities.parseDate(dateStr_(date) + ' ' + timeStr_(startTime), CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm');
  const end = Utilities.parseDate(dateStr_(date) + ' ' + timeStr_(endTime), CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm');
  return fmt_(start, 'EEE d MMM yyyy, h:mm a') + ' – ' + fmt_(end, 'h:mm a');
}

function fmt_(date, pattern) { return Utilities.formatDate(date, CONFIG.TIMEZONE, pattern); }
function clean_(v) { return String(v == null ? '' : v).trim().slice(0, 1000); }
function esc_(v) {
  return String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function row_(label, value) {
  return '<tr><td style="padding:6px 12px 6px 0;color:#6b7b77;vertical-align:top;white-space:nowrap">' + esc_(label) +
    '</td><td style="padding:6px 0;font-weight:bold">' + esc_(value).replace(/\n/g, '<br>') + '</td></tr>';
}
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
function page_(title, body) {
  return HtmlService.createHtmlOutput(
    '<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<style>body{font-family:Arial,sans-serif;max-width:520px;margin:48px auto;padding:0 20px;color:#233534;line-height:1.6}' +
    'h1{color:#255957;font-size:24px}.btn{display:inline-block;padding:12px 24px;border-radius:999px;font-weight:bold;text-decoration:none}' +
    '.ok{background:#255957;color:#fff}.no{border:2px solid #255957;color:#255957}</style>' +
    '<h1>' + esc_(title) + '</h1>' + body,
  ).setTitle(title);
}
