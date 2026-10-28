import { ArrowRight, Check } from 'lucide-react';
import aboutImg from '../assets/images/about.webp';
import SmartImage from './SmartImage';
import SectionHeading from './SectionHeading';

const principles = [
  'Listen to understand your needs.',
  'Develop a plan around your goals.',
  'Guide you through appropriate exercises and treatment.',
  'Review your progress and adapt when needed.',
];

export default function AboutSection() {
  return (
    <section id="about" aria-labelledby="about-title" className="section relative overflow-hidden bg-brand-sage">
      <div className="container-site grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <div className="relative order-2 lg:order-1">
          <SmartImage
            src={aboutImg}
            width={960}
            height={760}
            loading="lazy"
            alt="A physiotherapist assessing a patient's knee movement while the patient lies on a treatment table."
            className="aspect-[24/19] w-full rounded-[1.75rem] object-cover shadow-lift"
          />
          <div className="absolute -right-3 -top-3 hidden rounded-2xl bg-brand-forest px-5 py-4 text-white shadow-lift sm:block">
            <p className="font-heading text-sm font-bold">Every journey is different</p>
            <p className="text-xs text-white/70">So every plan should be too.</p>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <SectionHeading line={false} eyebrow="About Neuhope" title="A Better Path Towards Movement and Recovery" id="about-title" align="left">
            <p>
              At Neuhope, we believe that every person's journey towards better movement is different. Our approach focuses on
              understanding your needs, identifying your goals, and supporting you through a personalised rehabilitation journey.
            </p>
            <p className="mt-4 text-base">
              Whether you are managing discomfort, recovering from an injury, or working to improve your mobility, we aim to
              provide a supportive environment where you can take meaningful steps towards moving with greater confidence.
            </p>
          </SectionHeading>

          <h3 className="mt-9 text-lg font-bold">How we care for you</h3>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {principles.map((p) => (
              <li key={p} className="flex items-start gap-3 rounded-xl bg-white/70 p-3.5 text-[0.95rem] leading-snug">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-green text-brand-yellow">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                </span>
                {p}
              </li>
            ))}
          </ul>

          <a href="#approach" className="btn-primary group mt-9">
            See How Our Approach Works
            <ArrowRight className="h-[18px] w-[18px] transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
