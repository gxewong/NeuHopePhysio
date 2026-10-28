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

  SHEET_NAME: 'Appointment requests',
};

/* ========================= END OF CONFIG ========================= */

const HEADERS = [
  'Request ID', 'Received', 'Status', 'Full name', 'Phone', 'Email', 'Preferred contact',
  'Appointment type', 'Service', 'Date', 'Start time', 'End time', 'Message', 'Calendar event ID', 'Token',
];
const COL = Object.fromEntries(HEADERS.map((h, i) => [h, i + 1]));

/** Run this once from the Apps Script editor to create the sheet and grant permissions. */
function setup() {
  const sheet = getSheet_();
  const cal = getCalendar_();
  Logger.log('Setup complete. Sheet: "%s". Calendar: "%s". Notifications go to: %s',
    sheet.getName(), cal.getName(), notifyEmail_());
}

/* ----------------------- Website form → here ----------------------- */

function doPost(e) {
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    // Spam trap from the website — silently ignore
    if (d.website) return json_({ ok: true });

    const required = ['fullName', 'phone', 'email', 'appointmentType', 'service', 'date', 'time'];
    const missing = required.filter((k) => !String(d[k] || '').trim());
    if (missing.length) return json_({ ok: false, error: 'Missing: ' + missing.join(', ') });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d.date) || !/^\d{2}:\d{2}$/.test(d.time)) {
      return json_({ ok: false, error: 'Invalid date or time' });
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
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
    return json_({ ok: false, error: 'Server error' });
  }
}

/* ------------------- Accept / Decline links → here ------------------- */

function doGet(e) {
  const p = (e && e.parameter) || {};
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
