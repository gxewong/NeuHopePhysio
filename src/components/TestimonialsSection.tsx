import { Quote } from 'lucide-react';
import { testimonials } from '../data/site';
import SectionHeading from './SectionHeading';

export default function TestimonialsSection() {
  const hasReal = testimonials.length > 0;
  const items = hasReal ? testimonials : Array.from({ length: 3 }, () => null);

  return (
    <section aria-labelledby="testimonials-title" className="section bg-brand-grey">
      <div className="container-site">
        <SectionHeading line={false} eyebrow="Patient Stories" title="Experiences That Inspire Progress" id="testimonials-title">
          {!hasReal && <p>Approved patient experiences will be shared here.</p>}
        </SectionHeading>

        <ul className="mt-14 grid gap-6 md:grid-cols-3">
          {items.map((t, i) => (
            <li key={i}>
              <figure
                className={`flex h-full flex-col rounded-card p-7 ${
                  t ? 'card' : 'border-2 border-dashed border-brand-green/20 bg-white/60'
                }`}
              >
                <Quote className="h-8 w-8 text-brand-yellow" aria-hidden="true" />
                {t ? (
                  <>
                    <blockquote className="mt-4 flex-1 text-[1.02rem] leading-relaxed">“{t.quote}”</blockquote>
                    <figcaption className="mt-6 font-heading font-bold text-brand-green">{t.attribution}</figcaption>
                  </>
                ) : (
                  <>
                    <p className="mt-4 flex-1 font-mono text-sm leading-relaxed text-brand-ink/60">
                      [Insert an approved patient testimonial here.]
                    </p>
                    <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-brand-ink/40">Placeholder</p>
                  </>
                )}
              </figure>
            </li>
          ))}
        </ul>

        {hasReal && (
          <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-brand-ink/60">
            Individual experiences vary. Every person's rehabilitation journey and results are different.
          </p>
        )}
      </div>
    </section>
  );
}
