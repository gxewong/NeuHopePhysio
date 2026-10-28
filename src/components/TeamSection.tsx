import { useState } from 'react';
import { Languages } from 'lucide-react';
import { team, type TeamMember } from '../data/site';
import SectionHeading from './SectionHeading';
import ClinicValue from './ClinicValue';

function initials(name: string) {
  return name
    .replace(/^(dr|mr|ms|mrs|miss)\.?\s+/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}

function Photo({ member }: { member: TeamMember }) {
  const [failed, setFailed] = useState(false);
  if (!member.photo || failed) {
    return (
      <div aria-hidden="true" className="grid aspect-square w-full place-items-center bg-brand-sage font-heading text-5xl font-extrabold text-brand-green">
        {initials(member.name)}
      </div>
    );
  }
  return (
    <img
      src={member.photo}
      alt={`Portrait of ${member.name}`}
      loading="lazy"
      width={600}
      height={600}
      onError={() => setFailed(true)}
      className="aspect-square w-full object-cover"
    />
  );
}

export default function TeamSection() {
  if (team.length === 0) return null;

  return (
    <section id="team" aria-labelledby="team-title" className="section bg-white">
      <div className="container-site">
        <SectionHeading line={false} eyebrow="Our Team" title="Meet the People Behind Your Care" id="team-title">
          <p>Our team is here to listen, guide and support you at every step of your recovery.</p>
        </SectionHeading>

        <ul
          className={`mx-auto mt-14 grid gap-8 sm:grid-cols-2 ${
            team.length >= 3 ? 'lg:grid-cols-3' : 'max-w-3xl'
          }`}
        >
          {team.map((m) => (
            <li key={m.name}>
              <article className="card flex h-full flex-col overflow-hidden">
                <Photo member={m} />
                <div className="flex flex-1 flex-col p-7">
                  <h3 className="text-2xl font-extrabold leading-tight">{m.name}</h3>
                  <p className="mt-2 font-semibold text-brand-green">
                    <ClinicValue value={m.role} placeholder="Insert role" />
                  </p>
                  {m.qualifications !== undefined && (
                    <p className="mt-1.5 text-sm leading-relaxed text-brand-ink/60">
                      <ClinicValue value={m.qualifications} placeholder="Insert qualifications" />
                    </p>
                  )}
                  {m.bio !== undefined && (
                    <p className="mt-5 border-t border-brand-green/10 pt-5 text-[0.98rem] leading-relaxed text-brand-ink/75">
                      <ClinicValue value={m.bio} placeholder="Insert a short bio" />
                    </p>
                  )}
                  {m.languages !== undefined && (
                    <p className="mt-auto flex items-center gap-2 pt-6 text-sm text-brand-ink/70">
                      <Languages className="h-4 w-4 shrink-0 text-brand-green" aria-hidden="true" />
                      <span className="sr-only">Languages spoken: </span>
                      <ClinicValue value={m.languages?.join(' · ') || null} placeholder="Insert languages" />
                    </p>
                  )}
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
