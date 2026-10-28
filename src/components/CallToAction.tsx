import { ArrowRight, CalendarCheck } from 'lucide-react';
import { toContact, toPage } from '../route';

export default function CallToAction() {
  return (
    <section aria-labelledby="cta-title" className="bg-white py-20 md:py-24">
      <div className="container-site">
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-brand-forest px-6 py-14 text-center sm:px-12 md:py-20">
          {/* decorative movement curves */}
          <svg aria-hidden="true" viewBox="0 0 1200 400" preserveAspectRatio="none" className="absolute inset-0 -z-10 h-full w-full">
            <path d="M-50 420C240 400 420 330 620 340S960 380 1250 200" fill="none" stroke="#255957" strokeWidth="70" strokeLinecap="round" />
            <path d="M-50 440C280 420 460 372 640 378S980 400 1250 300" fill="none" stroke="#F4C542" strokeOpacity=".9" strokeWidth="4" strokeLinecap="round" />
          </svg>
          <div aria-hidden="true" className="absolute -right-10 -top-10 -z-10 h-48 w-48 rounded-full bg-brand-green" />

          <p className="eyebrow justify-center !text-brand-yellow before:hidden">Start Today</p>
          <h2 id="cta-title" className="mx-auto mt-4 max-w-2xl text-3xl font-extrabold !text-white sm:text-4xl lg:text-5xl">
            Ready to Take the Next Step?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/80">
            Whether you are starting your recovery journey or looking for support with movement, Neuhope is here to help you
            explore your options.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href={toContact()} className="btn-accent w-full sm:w-auto">
              <CalendarCheck className="h-[18px] w-[18px]" aria-hidden="true" />
              Book an Appointment
            </a>
            <a href={toPage('contact', 'contact-details')} className="btn-ghost-light group w-full sm:w-auto">
              Contact Our Team
              <ArrowRight className="h-[18px] w-[18px] transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
