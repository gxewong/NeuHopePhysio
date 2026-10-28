import { Mail, MapPin, Phone } from 'lucide-react';
import Logo from './Logo';
import SocialIcon from './SocialIcon';
import { toContact, toPage, toSection } from '../route';
import ClinicValue from './ClinicValue';
import { clinic, navLinks, services, telHref } from '../data/site';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-brand-forest text-white/75" aria-labelledby="footer-title">
      <h2 id="footer-title" className="sr-only">
        Site footer
      </h2>
      <div className="container-site grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_1.1fr_1.1fr]">
        <div>
          <a href={toPage('home', 'home')} aria-label="NeuHope Physiotherapy 曦望物理治疗 — back to top">
            <Logo tone="dark" />
          </a>
          <p className="mt-5 max-w-xs leading-relaxed">
            Helping you move towards better function, greater confidence, and a more active life.
          </p>
          <div className="mt-6 h-1 w-12 rounded-full bg-brand-yellow" aria-hidden="true" />
          {clinic.social.length > 0 && (
            <ul className="mt-6 flex flex-col items-start gap-3">
              {clinic.social.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-3 text-sm font-semibold text-white transition-colors hover:text-brand-yellow"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 transition-colors group-hover:bg-brand-yellow group-hover:text-brand-forest">
                      <SocialIcon platform={s.platform} className="h-[18px] w-[18px]" />
                    </span>
                    <span>
                      <span className="sr-only">{s.platform === 'facebook' ? 'Facebook: ' : 'Instagram: '}</span>
                      {s.label}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <nav aria-label="Footer quick links">
          <h3 className="font-heading text-sm font-bold uppercase tracking-wider !text-brand-yellow">Quick Links</h3>
          <ul className="mt-5 space-y-2.5">
            {navLinks.map((l) => (
              <li key={l.id}>
                <a href={l.page ? toPage(l.page, l.id) : toSection(l.id)} className="transition-colors hover:text-white">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Footer services">
          <h3 className="font-heading text-sm font-bold uppercase tracking-wider !text-brand-yellow">Services</h3>
          <ul className="mt-5 space-y-2.5">
            {services.map((s) => (
              <li key={s.id}>
                <a href={toSection('services')} className="transition-colors hover:text-white">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="font-heading text-sm font-bold uppercase tracking-wider !text-brand-yellow">Get in Touch</h3>
          <ul className="mt-5 space-y-4 text-sm">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-[18px] w-[18px] shrink-0 text-brand-yellow" aria-hidden="true" />
              <ClinicValue value={clinic.address} placeholder="Insert clinic address" />
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-[18px] w-[18px] shrink-0 text-brand-yellow" aria-hidden="true" />
              <ClinicValue value={clinic.phone} placeholder="Insert clinic phone number">
                {clinic.phone && <a href={telHref(clinic.phone)} className="hover:text-white">{clinic.phone}</a>}
              </ClinicValue>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 h-[18px] w-[18px] shrink-0 text-brand-yellow" aria-hidden="true" />
              <ClinicValue value={clinic.email} placeholder="Insert clinic email address">
                {clinic.email && <a href={`mailto:${clinic.email}`} className="hover:text-white">{clinic.email}</a>}
              </ClinicValue>
            </li>
          </ul>
          <a href={toContact()} className="btn-accent mt-7 !min-h-[44px] !px-5 !py-2.5 text-sm">
            Book an Appointment
          </a>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-site flex flex-col gap-3 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} NeuHope Physiotherapy 曦望物理治疗. All rights reserved.</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li>
              {clinic.privacyPolicyUrl ? (
                <a href={clinic.privacyPolicyUrl} className="hover:text-white">Privacy Policy</a>
              ) : (
                <span>Privacy Policy — available on request</span>
              )}
            </li>
            {clinic.termsUrl && (
              <li>
                <a href={clinic.termsUrl} className="hover:text-white">Terms &amp; Conditions</a>
              </li>
            )}
          </ul>
        </div>
      </div>
    </footer>
  );
}
