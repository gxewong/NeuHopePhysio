import type { ReactNode } from 'react';

/** Renders a verified clinic detail, or a clearly marked placeholder when not yet supplied. */
export default function ClinicValue({ value, placeholder, children }: { value: string | null; placeholder: string; children?: ReactNode }) {
  if (!value) return <span className="placeholder-text">[{placeholder}]</span>;
  return <>{children ?? value}</>;
}
