import { HeartHandshake, ClipboardList, PersonStanding, TrendingUp } from 'lucide-react';

const items = [
  { icon: HeartHandshake, title: 'Patient-Centred Care', text: 'Your concerns and goals guide every conversation.' },
  { icon: ClipboardList, title: 'Individualised Treatment', text: 'Plans shaped around your needs and abilities.' },
  { icon: PersonStanding, title: 'Functional Movement', text: 'A focus on the movements of everyday life.' },
  { icon: TrendingUp, title: 'Ongoing Progress', text: 'Reviewed and adapted as you move forward.' },
];

export default function TrustHighlights() {
  return (
    <section aria-label="Our care values" className="border-y border-brand-green/10 bg-brand-grey">
      <ul className="container-site grid gap-x-8 gap-y-7 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:py-12">
        {items.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-brand-green shadow-soft">
              <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-base font-bold">{title}</h3>
              <p className="mt-0.5 text-[0.93rem] leading-snug text-brand-ink/70">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
