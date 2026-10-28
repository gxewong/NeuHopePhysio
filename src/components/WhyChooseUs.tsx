import { Compass, Home, MessagesSquare, UserRoundCheck } from 'lucide-react';
import bandImg from '../assets/images/band.webp';
import SmartImage from './SmartImage';
import SectionHeading from './SectionHeading';

const features = [
  {
    icon: UserRoundCheck,
    title: 'Personalised Treatment',
    text: "Treatment and exercise plans should reflect each patient's needs, goals, abilities and progress.",
  },
  {
    icon: Compass,
    title: 'Clear Guidance',
    text: 'Understand what you are working towards and how your rehabilitation plan supports your goals.',
  },
  {
    icon: Home,
    title: 'Practical, Functional Movement',
    text: 'Focus on movement and exercises that relate to daily activities and the things that matter to you.',
  },
  {
    icon: MessagesSquare,
    title: 'Supportive Environment',
    text: 'A welcoming space where you can ask questions, discuss concerns and work towards your goals with guidance.',
  },
];

export default function WhyChooseUs() {
  return (
    <section aria-labelledby="why-title" className="section bg-white">
      <div className="container-site grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <SectionHeading line={false} eyebrow="Why Neuhope" title="Care That Moves With You" id="why-title" align="left">
            <p>
              Your goals, comfort, and progress matter. Our approach focuses on helping you understand your rehabilitation
              journey and take it one step at a time.
            </p>
          </SectionHeading>
          <div className="relative isolate mt-10 hidden lg:block">
            <SmartImage
              src={bandImg}
              width={800}
              height={640}
              loading="lazy"
              alt="A physiotherapist guiding a patient's arm through a resistance-band exercise."
              className="aspect-[5/4] w-full rounded-[1.75rem] object-cover"
            />
            <div aria-hidden="true" className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-[1.75rem] border-2 border-brand-yellow" />
          </div>
        </div>

        <ul className="grid content-center gap-5 sm:grid-cols-2">
          {features.map(({ icon: Icon, title, text }, i) => (
            <li
              key={title}
              className={`rounded-card border p-7 transition-colors ${
                i === 0 || i === 3
                  ? 'border-transparent bg-brand-green text-white'
                  : 'border-brand-green/10 bg-brand-grey'
              } ${i % 2 === 1 ? 'sm:translate-y-8' : ''}`}
            >
              <span
                className={`grid h-12 w-12 place-items-center rounded-2xl ${
                  i === 0 || i === 3 ? 'bg-white/10 text-brand-yellow' : 'bg-white text-brand-green shadow-soft'
                }`}
              >
                <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <h3 className={`mt-6 text-xl font-bold ${i === 0 || i === 3 ? '!text-white' : ''}`}>{title}</h3>
              <p className={`mt-2.5 text-[0.98rem] leading-relaxed ${i === 0 || i === 3 ? 'text-white/80' : 'text-brand-ink/75'}`}>
                {text}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
