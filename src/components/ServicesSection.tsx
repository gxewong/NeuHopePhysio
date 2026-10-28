import { ArrowRight, MessageCircleQuestion } from 'lucide-react';
import { services } from '../data/site';
import SectionHeading from './SectionHeading';

/**
 * "Enquire about this service" pre-selects the service in the enquiry form
 * (via a custom event) and scrolls to it — a real destination rather than a dead link.
 */
function selectService(id: string) {
  window.dispatchEvent(new CustomEvent('neuhope:select-service', { detail: id }));
}

export default function ServicesSection() {
  return (
    <section id="services" aria-labelledby="services-title" className="section bg-brand-grey">
      <div className="container-site">
        <SectionHeading line={false} eyebrow="Our Services" title="How We Can Help You Move Better" id="services-title">
          <p>Explore our physiotherapy and rehabilitation services, tailored to different movement challenges and recovery goals.</p>
        </SectionHeading>

        <ul className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map(({ id, title, description, icon: Icon }) => (
            <li key={id}>
              <article className="card group flex h-full flex-col p-7 transition-all duration-300 hover:-translate-y-1 hover:border-brand-green/25 hover:shadow-lift focus-within:-translate-y-1 focus-within:shadow-lift">
                <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-brand-green text-white transition-colors group-hover:bg-brand-forest">
                  <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
                  <span aria-hidden="true" className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-[3px] border-white bg-brand-yellow" />
                </span>
                <h3 className="mt-6 text-xl font-bold">{title}</h3>
                <p className="mt-3 flex-1 text-[0.98rem] leading-relaxed text-brand-ink/75">{description}</p>
                <a
                  href="#contact"
                  onClick={() => selectService(id)}
                  className="mt-6 inline-flex items-center gap-1.5 self-start font-heading text-[0.95rem] font-bold text-brand-green underline-offset-4 hover:underline"
                >
                  Enquire about this service
                  <span className="sr-only">: {title}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </a>
              </article>
            </li>
          ))}
        </ul>

        <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-brand-ink/60">
          Services listed are indicative. Please contact the clinic to confirm which services are currently available.
        </p>

        <div className="mt-14 flex flex-col items-start gap-6 rounded-[1.5rem] border border-brand-green/10 bg-white p-7 shadow-soft sm:p-9 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-5">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-brand-green shadow-soft ring-1 ring-brand-green/10">
              <MessageCircleQuestion className="h-7 w-7" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-2xl font-bold">Not Sure Which Service You Need?</h3>
              <p className="mt-1.5 text-brand-ink/75">
                We can help you understand the available options and identify an appropriate next step.
              </p>
            </div>
          </div>
          <a href="#contact" className="btn-primary shrink-0">
            Contact Us
          </a>
        </div>
      </div>
    </section>
  );
}
