import { useRef, useState, type KeyboardEvent } from 'react';
import { Minus, Plus } from 'lucide-react';
import { faqs } from '../data/site';
import SectionHeading from './SectionHeading';
import { toContact } from '../route';

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  // WAI-ARIA accordion keyboard support: ↑/↓/Home/End move between headers
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const last = faqs.length - 1;
    const map: Record<string, number> = { ArrowDown: i === last ? 0 : i + 1, ArrowUp: i === 0 ? last : i - 1, Home: 0, End: last };
    if (e.key in map) {
      e.preventDefault();
      buttons.current[map[e.key]]?.focus();
    }
  };

  return (
    <section id="faqs" aria-labelledby="faq-title" className="section bg-white">
      <div className="container-site grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div>
          <SectionHeading line={false} eyebrow="FAQs" title="Frequently Asked Questions" id="faq-title" align="left">
            <p>
              Helpful general information about physiotherapy at Neuhope. For advice about your own situation, please contact us.
            </p>
          </SectionHeading>
          <a href={toContact()} className="btn-secondary mt-8">
            Ask Us a Question
          </a>
        </div>

        <div className="divide-y divide-brand-green/10 rounded-card border border-brand-green/10 bg-white shadow-soft">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q}>
                <h3 className="text-base">
                  <button
                    ref={(el) => (buttons.current[i] = el)}
                    type="button"
                    id={`faq-btn-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    onKeyDown={(e) => onKeyDown(e, i)}
                    className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left font-heading text-[1.05rem] font-bold text-brand-green transition-colors hover:bg-brand-grey sm:px-7"
                  >
                    {f.q}
                    <span
                      aria-hidden="true"
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors ${
                        isOpen ? 'bg-brand-yellow text-brand-forest' : 'bg-brand-sage text-brand-green'
                      }`}
                    >
                      {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </span>
                  </button>
                </h3>
                <div
                  id={`faq-panel-${i}`}
                  role="region"
                  aria-labelledby={`faq-btn-${i}`}
                  hidden={!isOpen}
                  className="px-6 pb-6 sm:px-7"
                >
                  <p className="max-w-prose text-brand-ink/80">{f.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
