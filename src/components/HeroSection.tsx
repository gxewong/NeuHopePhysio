import { ArrowRight, CalendarCheck, Compass, HandHeart, Sprout } from 'lucide-react';
import heroImg from '../assets/images/hero.webp';
import SmartImage from './SmartImage';
import { toContact } from '../route';

const points = [
  { icon: HandHeart, label: 'Personalised Care' },
  { icon: Compass, label: 'Guided Rehabilitation' },
  { icon: Sprout, label: 'Support at Every Step' },
];

export default function HeroSection() {
  return (
    <section id="home" aria-labelledby="hero-title" className="relative overflow-hidden bg-white">
      {/* soft organic backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-24 hidden h-[44rem] w-[44rem] rounded-full bg-brand-sage lg:block"
      />
      <div className="container-site relative grid items-center gap-12 pb-20 pt-10 md:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-28 lg:pt-20">
        <div className="max-w-xl">
          <p className="eyebrow before:hidden">Personalised Physiotherapy &amp; Rehabilitation</p>
          <h1 id="hero-title" className="mt-5 text-[2.6rem] font-extrabold leading-[1.05] sm:text-6xl lg:text-[4.1rem]">
            Move Better.
            <br />
            Feel Stronger.
            <br />
            <span className="relative inline-block">
              Live With Hope.
              <svg
                aria-hidden="true"
                viewBox="0 0 300 18"
                preserveAspectRatio="none"
                className="absolute -bottom-2 left-0 h-3.5 w-full text-brand-yellow/55"
              >
                <path d="M3 13C70 4 170 2 297 9" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
              </svg>
            </span>
          </h1>
          <p className="lead mt-7">
            At Neuhope Physiotherapy Centre, we help you work towards better movement, manage pain, and regain confidence
            through personalised physiotherapy and rehabilitation.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a href={toContact()} className="btn-primary">
              <CalendarCheck className="h-[18px] w-[18px]" aria-hidden="true" />
              Book an Appointment
            </a>
            <a href="#services" className="btn-secondary group">
              Explore Our Services
              <ArrowRight className="h-[18px] w-[18px] transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </a>
          </div>

          <ul className="mt-10 grid gap-4 border-t border-brand-green/10 pt-8 sm:grid-cols-3">
            {points.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3 text-[0.95rem] font-semibold text-brand-forest">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-yellow/25 text-brand-green">
                  <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-md sm:max-w-lg lg:max-w-none">
          <div aria-hidden="true" className="absolute -bottom-5 -left-5 h-40 w-40 rounded-[2.5rem] bg-brand-yellow/90 sm:h-48 sm:w-48" />
          <div aria-hidden="true" className="absolute -right-4 -top-4 h-24 w-24 rounded-full border-[10px] border-brand-sage lg:hidden" />
          <SmartImage
            src={heroImg}
            width={900}
            height={1000}
            loading="eager"
            alt="A physiotherapist standing beside a patient who is practising walking between parallel support bars in a bright rehabilitation room."
            className="relative aspect-[9/10] w-full rounded-[2rem] object-cover shadow-lift"
          />
        </div>
      </div>
    </section>
  );
}
