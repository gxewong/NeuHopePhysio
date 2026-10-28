import SectionHeading from './SectionHeading';

const steps = [
  {
    title: 'Understand',
    text: 'We begin by discussing your concerns, movement difficulties, medical history where relevant, and personal goals.',
  },
  {
    title: 'Assess',
    text: 'Your physiotherapist carries out an appropriate assessment to better understand your movement and rehabilitation needs.',
  },
  {
    title: 'Plan',
    text: 'Together, you work towards an individualised treatment and exercise plan based on the assessment and your goals.',
  },
  {
    title: 'Progress',
    text: 'Your progress is reviewed, and your plan can be adjusted as your needs and abilities change.',
  },
];

export default function OurApproach() {
  return (
    <section id="approach" aria-labelledby="approach-title" className="section bg-brand-sage">
      <div className="container-site">
        <SectionHeading line={false} eyebrow="Our Approach" title="Your Journey Towards Better Movement" id="approach-title">
          <p>A clear, supportive process — one step at a time.</p>
        </SectionHeading>

        <ol className="relative mt-16 grid gap-10 lg:grid-cols-4 lg:gap-8">
          {/* connecting line: vertical on mobile, horizontal on desktop */}
          <span aria-hidden="true" className="absolute bottom-8 left-7 top-8 w-0.5 bg-brand-green/20 lg:hidden" />
          <span aria-hidden="true" className="absolute left-[12.5%] right-[12.5%] top-7 hidden h-0.5 bg-brand-green/20 lg:block" />

          {steps.map((s, i) => {
            const yellow = i % 2 === 1;
            return (
              <li key={s.title} className="relative flex gap-6 lg:flex-col lg:items-center lg:gap-0 lg:text-center">
                <span
                  className={`relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-full font-heading text-lg font-extrabold ring-8 ring-brand-sage ${
                    yellow ? 'bg-brand-yellow text-brand-forest' : 'bg-brand-green text-white'
                  }`}
                >
                  <span className="sr-only">Step </span>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="pt-2 lg:mt-6 lg:rounded-card lg:bg-white lg:p-6 lg:pt-6 lg:shadow-soft">
                  <h3 className="text-xl font-bold">{s.title}</h3>
                  <p className="mt-2 text-[0.98rem] leading-relaxed text-brand-ink/75">{s.text}</p>
                </div>
              </li>
            );
          })}
        </ol>

        <p className="mx-auto mt-12 max-w-xl text-center text-sm text-brand-ink/60">
          The exact process may vary depending on your needs and the services provided.
        </p>
      </div>
    </section>
  );
}
