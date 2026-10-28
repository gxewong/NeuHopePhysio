import type { ReactNode } from 'react';

interface Props {
  eyebrow: string;
  title: string;
  id?: string;
  children?: ReactNode;
  align?: 'left' | 'center';
  tone?: 'light' | 'dark';
  /** Show the short yellow line before the eyebrow label */
  line?: boolean;
}

export default function SectionHeading({ eyebrow, title, id, children, align = 'center', tone = 'light', line = true }: Props) {
  const center = align === 'center';
  return (
    <div className={`${center ? 'mx-auto text-center' : ''} max-w-2xl`}>
      <p className={`eyebrow ${line ? '' : 'before:hidden'} ${tone === 'dark' ? '!text-brand-yellow' : ''}`}>{eyebrow}</p>
      <h2 id={id} className={`section-title mt-4 ${tone === 'dark' ? '!text-white' : ''}`}>
        {title}
      </h2>
      {children && <div className={`lead mt-5 ${tone === 'dark' ? '!text-white/80' : ''}`}>{children}</div>}
    </div>
  );
}
