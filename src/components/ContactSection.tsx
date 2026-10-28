import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Info,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { clinic, ENQUIRY_ENDPOINT, mapHref, services, telHref, whatsappHref } from '../data/site';
import ClinicValue from './ClinicValue';

/* ── Form model ─────────────────────────────────────────── */

interface FormValues {
  fullName: string;
  phone: string;
  email: string;
  contactMethod: string;
  service: string;
  date: string;
  message: string;
  consent: boolean;
}
type Errors = Partial<Record<keyof FormValues, string>>;
type Status = 'idle' | 'submitting' | 'success' | 'error' | 'not-connected';

const initial: FormValues = {
  fullName: '',
  phone: '',
  email: '',
  contactMethod: '',
  service: '',
  date: '',
  message: '',
  consent: false,
};

const MESSAGE_MAX = 500;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_CHARS_RE = /^\+?[\d\s\-()]+$/;

function validate(v: FormValues): Errors {
  const e: Errors = {};
  if (v.fullName.trim().length < 2) e.fullName = 'Please enter your full name.';

  const digits = v.phone.replace(/\D/g, '');
  if (!v.phone.trim()) e.phone = 'Please enter a phone number so we can reach you.';
  else if (!PHONE_CHARS_RE.test(v.phone.trim()) || digits.length < 8 || digits.length > 15)
    e.phone = 'Please enter a valid phone number, e.g. +60 12-345 6789.';

  if (v.email.trim() && !EMAIL_RE.test(v.email.trim())) e.email = 'Please enter a valid email address, e.g. name@example.com.';
  if (!v.contactMethod) e.contactMethod = 'Please choose how you would like us to contact you.';
  else if (v.contactMethod === 'Email' && !v.email.trim()) e.email = 'Please add your email address, or choose another contact method.';

  if (!v.service) e.service = 'Please choose a service, or select "Not sure — I would like advice".';
  if (v.date && v.date < todayISO()) e.date = 'Please choose today or a future date.';
  if (v.message.length > MESSAGE_MAX) e.message = `Please keep your message under ${MESSAGE_MAX} characters.`;
  if (!v.consent) e.consent = 'Please confirm you agree so we can respond to your enquiry.';
  return e;
}

function todayISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

/* ── Small presentational helpers ───────────────────────── */

function FieldError({ id, msg }: { id: string; msg?: string }) {
  if (!msg) return null;
  return (
    <p id={id} className="field-error">
      <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
      {msg}
    </p>
  );
}

function ContactRow({ icon: Icon, label, children }: { icon: typeof Phone; label: string; children: ReactNode }) {
  return (
    <li className="flex items-start gap-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10 text-brand-yellow">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/60">{label}</p>
        <div className="mt-0.5 break-words text-white">{children}</div>
      </div>
    </li>
  );
}

/* ── Component ──────────────────────────────────────────── */

export default function ContactSection({ asPage = false }: { asPage?: boolean }) {
  const Heading = asPage ? 'h1' : 'h2';
  const Sub = asPage ? 'h2' : 'h3';
  const [values, setValues] = useState<FormValues>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({});
  const [status, setStatus] = useState<Status>('idle');
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  // Pre-select a service when arriving from "Enquire about this service" (/contact?service=…)
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('service');
    const svc = services.find((s) => s.id === id);
    if (svc) setValues((v) => ({ ...v, service: svc.title }));
  }, []);

  useEffect(() => {
    if (asPage) document.title = `Contact & Appointments | ${clinic.name}`;
  }, [asPage]);

  useEffect(() => {
    if (status !== 'idle' && status !== 'submitting') statusRef.current?.focus();
  }, [status]);

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const next = {
      ...values,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    } as FormValues;
    setValues(next);
    if (status === 'not-connected' || status === 'error') setStatus('idle');
    // Re-validate live only after a field has been touched, so errors don't appear while typing for the first time
    if (touched[name as keyof FormValues]) setErrors(validate(next));
  };

  const onBlur = (e: { target: { name: string } }) => {
    const name = e.target.name as keyof FormValues;
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors(validate(values));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    setTouched(Object.fromEntries(Object.keys(initial).map((k) => [k, true])));
    const firstInvalid = Object.keys(found)[0];
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    if (!ENQUIRY_ENDPOINT) {
      // No backend connected — be honest and do NOT show a success state.
      setStatus('not-connected');
      return;
    }

    setStatus('submitting');
    try {
      const res = await fetch(ENQUIRY_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...values, submittedAt: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error(`Request failed with ${res.status}`);
      setStatus('success');
      setValues(initial);
      setTouched({});
      setErrors({});
    } catch {
      setStatus('error');
    }
  };

  const err = (k: keyof FormValues) => (touched[k] ? errors[k] : undefined);
  const a11y = (k: keyof FormValues, hint?: string) => ({
    'aria-invalid': err(k) ? true : undefined,
    'aria-describedby': [err(k) ? `${k}-error` : '', hint ?? ''].filter(Boolean).join(' ') || undefined,
  });

  const map = mapHref(clinic);
  const hasDirectContact = !!(clinic.phone || clinic.whatsapp || clinic.email);

  return (
    <section id="contact" aria-labelledby="contact-title" className="section bg-brand-grey">
      <div className="container-site">
        <div className="mx-auto max-w-2xl text-center">
          <Heading id="contact-title" className="section-title">
            Contact &amp; Appointments
          </Heading>
          <p className="lead mt-5">
            Have questions about our services or want to arrange a visit?
            <br />
            Get in touch with Neuhope Physiotherapy Centre.
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          {/* ── Contact details ── */}
          <aside id="contact-details" aria-labelledby="contact-details-title" className="relative overflow-hidden rounded-[1.5rem] bg-brand-green p-7 text-white sm:p-9">
            <div aria-hidden="true" className="absolute -bottom-16 -right-16 h-56 w-56 rounded-full border-[28px] border-white/5" />
            <Sub id="contact-details-title" className="text-2xl font-bold !text-white">
              Contact Information
            </Sub>
            <p className="mt-2 text-white/75">Reach the clinic directly using any of the details below.</p>

            <ul className="relative mt-8 space-y-6">
              <ContactRow icon={MapPin} label="Address">
                <ClinicValue value={clinic.address} placeholder="Insert clinic address" />
                {map && (
                  <a href={map} target="_blank" rel="noopener noreferrer" className="mt-1 block text-sm font-semibold text-brand-yellow underline underline-offset-4">
                    View on Google Maps<span className="sr-only"> (opens in a new tab)</span>
                  </a>
                )}
              </ContactRow>
              <ContactRow icon={Phone} label="Phone">
                <ClinicValue value={clinic.phone} placeholder="Insert clinic phone number">
                  {clinic.phone && (
                    <a href={telHref(clinic.phone)} className="font-semibold underline-offset-4 hover:underline">
                      {clinic.phone}
                    </a>
                  )}
                </ClinicValue>
              </ContactRow>
              <ContactRow icon={MessageCircle} label="WhatsApp">
                <ClinicValue value={clinic.whatsapp} placeholder="Insert official WhatsApp number">
                  {clinic.whatsapp && <span>+{clinic.whatsapp}</span>}
                </ClinicValue>
              </ContactRow>
              <ContactRow icon={Mail} label="Email">
                <ClinicValue value={clinic.email} placeholder="Insert clinic email address">
                  {clinic.email && (
                    <a href={`mailto:${clinic.email}`} className="font-semibold underline-offset-4 hover:underline">
                      {clinic.email}
                    </a>
                  )}
                </ClinicValue>
              </ContactRow>
              <ContactRow icon={Clock} label="Operating hours">
                {clinic.hours ? (
                  <ul>
                    {clinic.hours.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                ) : (
                  <ClinicValue value={null} placeholder="Insert clinic operating hours" />
                )}
              </ContactRow>
            </ul>

            {clinic.whatsapp && (
              <a href={whatsappHref(clinic.whatsapp)} target="_blank" rel="noopener noreferrer" className="btn-accent relative mt-9 w-full">
                <MessageCircle className="h-[18px] w-[18px]" aria-hidden="true" />
                Chat on WhatsApp<span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
          </aside>

          {/* ── Enquiry form ── */}
          <div id="enquiry" className="card p-7 sm:p-9">
            <Sub className="text-2xl font-bold">Appointment Enquiry</Sub>
            <p className="mt-2 text-brand-ink/70">
              Fields marked <span aria-hidden="true" className="font-bold text-brand-green">*</span>
              <span className="sr-only">with an asterisk</span> are required.
            </p>

            {!ENQUIRY_ENDPOINT && (
              <div className="mt-5 flex gap-3 rounded-xl border border-brand-yellow bg-brand-yellow/15 p-4 text-sm text-brand-forest">
                <Info className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                <p>
                  <strong>Demonstration form:</strong> this form is not yet connected to the clinic, so enquiries cannot be
                  sent from here. Please contact the clinic directly using the details provided.
                </p>
              </div>
            )}

            <form ref={formRef} onSubmit={onSubmit} noValidate className="mt-7 grid gap-5 sm:grid-cols-2" aria-describedby="privacy-note">
              <div className="sm:col-span-2">
                <label htmlFor="fullName" className="field-label">
                  Full Name <span aria-hidden="true">*</span>
                </label>
                <input id="fullName" name="fullName" type="text" autoComplete="name" required value={values.fullName} onChange={onChange} onBlur={onBlur} className="field" {...a11y('fullName')} />
                <FieldError id="fullName-error" msg={err('fullName')} />
              </div>

              <div>
                <label htmlFor="phone" className="field-label">
                  Phone Number <span aria-hidden="true">*</span>
                </label>
                <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required placeholder="+60 12-345 6789" value={values.phone} onChange={onChange} onBlur={onBlur} className="field" {...a11y('phone')} />
                <FieldError id="phone-error" msg={err('phone')} />
              </div>

              <div>
                <label htmlFor="email" className="field-label">
                  Email Address <span className="font-normal text-brand-ink/50">(optional)</span>
                </label>
                <input id="email" name="email" type="email" inputMode="email" autoComplete="email" placeholder="name@example.com" value={values.email} onChange={onChange} onBlur={onBlur} className="field" {...a11y('email')} />
                <FieldError id="email-error" msg={err('email')} />
              </div>

              <div>
                <label htmlFor="contactMethod" className="field-label">
                  Preferred Contact Method <span aria-hidden="true">*</span>
                </label>
                <select id="contactMethod" name="contactMethod" required value={values.contactMethod} onChange={onChange} onBlur={onBlur} className="field" {...a11y('contactMethod')}>
                  <option value="">Select an option</option>
                  <option>Phone call</option>
                  <option>WhatsApp</option>
                  <option>Email</option>
                </select>
                <FieldError id="contactMethod-error" msg={err('contactMethod')} />
              </div>

              <div>
                <label htmlFor="service" className="field-label">
                  Service of Interest <span aria-hidden="true">*</span>
                </label>
                <select id="service" name="service" required value={values.service} onChange={onChange} onBlur={onBlur} className="field" {...a11y('service')}>
                  <option value="">Select a service</option>
                  {services.map((s) => (
                    <option key={s.id}>{s.title}</option>
                  ))}
                  <option>Not sure — I would like advice</option>
                </select>
                <FieldError id="service-error" msg={err('service')} />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="date" className="field-label">
                  Preferred Appointment Date <span className="font-normal text-brand-ink/50">(optional)</span>
                </label>
                <input id="date" name="date" type="date" min={todayISO()} value={values.date} onChange={onChange} onBlur={onBlur} className="field sm:max-w-xs" {...a11y('date', 'date-hint')} />
                <p id="date-hint" className="mt-1.5 text-sm text-brand-ink/60">
                  Subject to availability — the clinic will confirm a suitable time with you.
                </p>
                <FieldError id="date-error" msg={err('date')} />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="message" className="field-label">
                  Message or Additional Information <span className="font-normal text-brand-ink/50">(optional)</span>
                </label>
                <textarea id="message" name="message" rows={4} maxLength={MESSAGE_MAX} value={values.message} onChange={onChange} onBlur={onBlur} className="field resize-y" {...a11y('message', 'message-hint')} />
                <div id="message-hint" className="mt-1.5 flex justify-between gap-4 text-sm text-brand-ink/60">
                  <span>Please share only general information — avoid detailed medical history or records.</span>
                  <span aria-live="polite" className="shrink-0 tabular-nums">
                    {values.message.length}/{MESSAGE_MAX}
                  </span>
                </div>
                <FieldError id="message-error" msg={err('message')} />
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-start gap-3">
                  <input id="consent" name="consent" type="checkbox" required checked={values.consent} onChange={onChange} onBlur={onBlur} className="mt-1 h-5 w-5 shrink-0 cursor-pointer rounded accent-brand-green" {...a11y('consent')} />
                  <label htmlFor="consent" className="cursor-pointer text-[0.95rem] leading-snug">
                    I agree that Neuhope Physiotherapy Centre may use the information I have provided to respond to my enquiry.{' '}
                    <span aria-hidden="true" className="font-bold text-brand-green">*</span>
                  </label>
                </div>
                <FieldError id="consent-error" msg={err('consent')} />
              </div>

              <div className="sm:col-span-2">
                <button type="submit" className="btn-primary w-full disabled:cursor-wait disabled:opacity-70 sm:w-auto" disabled={status === 'submitting'}>
                  {status === 'submitting' ? (
                    <>
                      <Loader2 className="h-[18px] w-[18px] animate-spin" aria-hidden="true" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send className="h-[18px] w-[18px]" aria-hidden="true" />
                      Submit Enquiry
                    </>
                  )}
                </button>
              </div>

              {/* Submission status */}
              <div className="sm:col-span-2" aria-live="polite">
                {status === 'success' && (
                  <div ref={statusRef} tabIndex={-1} role="status" className="flex gap-3 rounded-xl border border-brand-green/30 bg-brand-sage p-4 text-brand-forest">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-green" aria-hidden="true" />
                    <p>
                      <strong>Thank you — your enquiry has been sent.</strong> The clinic will be in touch using your preferred
                      contact method.
                    </p>
                  </div>
                )}
                {status === 'error' && (
                  <div ref={statusRef} tabIndex={-1} role="alert" className="flex gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-red-900">
                    <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
                    <p>
                      <strong>Sorry, your enquiry could not be sent.</strong> Please try again in a moment, or contact the clinic
                      directly using the details on this page.
                    </p>
                  </div>
                )}
                {status === 'not-connected' && (
                  <div ref={statusRef} tabIndex={-1} role="alert" className="flex gap-3 rounded-xl border border-brand-yellow bg-brand-yellow/15 p-4 text-brand-forest">
                    <Info className="h-5 w-5 shrink-0" aria-hidden="true" />
                    <p>
                      <strong>Your details look good, but this enquiry has not been sent.</strong> The online form is not yet
                      connected to the clinic.{' '}
                      {hasDirectContact
                        ? 'Please call, WhatsApp or email the clinic using the contact information provided.'
                        : 'Please contact the clinic directly — contact details will be published here soon.'}
                    </p>
                  </div>
                )}
              </div>
            </form>

            <p id="privacy-note" className="mt-6 flex gap-2.5 border-t border-brand-green/10 pt-6 text-sm leading-relaxed text-brand-ink/65">
              <ShieldCheck className="mt-0.5 h-[18px] w-[18px] shrink-0 text-brand-green" aria-hidden="true" />
              <span>
                <strong className="text-brand-forest">Privacy notice:</strong> the information you provide is used only to respond
                to your enquiry and arrange appointments, and is handled in accordance with the clinic's privacy policy. Please do
                not include confidential medical records in this form.
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
