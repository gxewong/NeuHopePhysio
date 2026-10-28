import { useEffect, useRef, useState } from 'react';
import { CalendarCheck, Menu, X } from 'lucide-react';
import Logo from './Logo';
import { navLinks } from '../data/site';
import { currentPage, toContact, toPage, toSection } from '../route';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>(currentPage === 'contact' ? 'contact' : 'home');
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Header elevation on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Active-section highlighting
  useEffect(() => {
    const sections = navLinks
      .map((l) => document.getElementById(l.id))
      .filter((el): el is HTMLElement => !!el);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // Mobile menu: close on Escape / resize, lock body scroll, move focus in
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onResize = () => window.innerWidth >= 1280 && setOpen(false);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    document.body.style.overflow = 'hidden';
    menuRef.current?.querySelector<HTMLElement>('a')?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
      document.body.style.overflow = '';
    };
  }, [open]);

  const linkClass = (id: string) =>
    `relative whitespace-nowrap rounded-md px-2.5 py-2 text-[0.94rem] font-medium transition-colors hover:text-brand-green ${
      active === id ? 'text-brand-green' : 'text-brand-ink/75'
    }`;

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled ? 'border-brand-green/10 bg-white shadow-soft' : 'border-transparent bg-white'
      }`}
    >
      <nav className="container-site flex h-[4.75rem] items-center justify-between gap-4" aria-label="Main">
        <a href={toPage('home', 'home')} aria-label="NeuHope Physiotherapy 曦望物理治疗 — back to top" onClick={() => setOpen(false)}>
          <Logo />
        </a>

        <ul className="hidden items-center gap-0.5 xl:flex">
          {navLinks.map((l) => (
            <li key={l.id}>
              <a href={l.page ? toPage(l.page, l.id) : toSection(l.id)} className={linkClass(l.id)} aria-current={active === l.id ? 'location' : undefined}>
                {l.label}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-2.5 -bottom-0.5 h-[3px] rounded-full bg-brand-yellow transition-transform duration-200 ${
                    active === l.id ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a href={toContact()} className="btn-primary hidden whitespace-nowrap !min-h-[44px] !px-5 !py-2.5 sm:inline-flex">
            <CalendarCheck className="h-4 w-4" aria-hidden="true" />
            Book an Appointment
          </a>
          <button
            ref={toggleRef}
            type="button"
            className="grid h-11 w-11 place-items-center rounded-xl border border-brand-green/15 text-brand-green transition-colors hover:bg-brand-sage xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        ref={menuRef}
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-[4.75rem] overflow-y-auto border-t border-brand-green/10 bg-white xl:hidden"
      >
        <ul className="container-site flex flex-col py-4">
          {navLinks.map((l) => (
            <li key={l.id}>
              <a
                href={l.page ? toPage(l.page, l.id) : toSection(l.id)}
                onClick={() => setOpen(false)}
                aria-current={active === l.id ? 'location' : undefined}
                className={`flex items-center justify-between border-b border-brand-green/10 py-4 font-heading text-xl font-bold ${
                  active === l.id ? 'text-brand-green' : 'text-brand-ink/80'
                }`}
              >
                {l.label}
                {active === l.id && <span className="h-2 w-2 rounded-full bg-brand-yellow" aria-hidden="true" />}
              </a>
            </li>
          ))}
        </ul>
        <div className="container-site pb-10">
          <a href={toContact()} onClick={() => setOpen(false)} className="btn-primary w-full">
            <CalendarCheck className="h-4 w-4" aria-hidden="true" />
            Book an Appointment
          </a>
        </div>
      </div>
    </header>
  );
}
