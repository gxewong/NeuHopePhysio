import logoImg from '../assets/images/logo.jpg';

interface LogoProps {
  /** "light" = for light backgrounds, "dark" = for dark backgrounds */
  tone?: 'light' | 'dark';
  className?: string;
}

/** The clinic's dove logo (src/assets/images/logo.jpg).
 *  Replace that file to update the logo everywhere on the site. */
export function LogoMark({ tone = 'light', className = 'h-10 w-10' }: LogoProps) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 overflow-hidden rounded-[11px] ${tone === 'dark' ? 'ring-1 ring-white/20' : ''} ${className}`}
    >
      <img src={logoImg} alt="" width={40} height={40} className="h-full w-full scale-[1.2] object-cover" />
    </span>
  );
}

export default function Logo({ tone = 'light', className = '' }: LogoProps) {
  const word = tone === 'light' ? 'text-brand-green' : 'text-white';
  const sub = tone === 'light' ? 'text-brand-ink/60' : 'text-white/70';
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark tone={tone} />
      <span className="flex flex-col whitespace-nowrap leading-none">
        <span className={`flex items-baseline gap-1.5 font-heading text-[1.35rem] font-extrabold tracking-tight ${word}`}>
          Neuhope
          <span lang="zh-Hans" className="text-[1rem] font-bold tracking-normal">曦望物理治疗</span>
        </span>
        <span className={`mt-1 text-[0.6rem] font-semibold tracking-[0.2em] ${sub}`}>PHYSIOTHERAPY CENTRE</span>
      </span>
    </span>
  );
}
