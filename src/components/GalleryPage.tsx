import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, ImageIcon, X } from 'lucide-react';
import { clinic, gallery } from '../data/site';
import CallToAction from './CallToAction';

const PLACEHOLDER_COUNT = 6;

function Lightbox({ index, onClose, onMove }: { index: number; onClose: () => void; onMove: (step: number) => void }) {
  const img = gallery[index]!;
  const closeRef = useRef<HTMLButtonElement>(null);
  const many = gallery.length > 1;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (many && e.key === 'ArrowRight') onMove(1);
      if (many && e.key === 'ArrowLeft') onMove(-1);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, onMove, many]);

  const btn =
    'grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:bg-white/20';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${index + 1} of ${gallery.length}: ${img.alt}`}
      className="fixed inset-0 z-[60] flex flex-col bg-brand-forest/95 p-4 sm:p-8"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex items-center justify-between text-white/80">
        <p className="text-sm tabular-nums">
          {index + 1} / {gallery.length}
        </p>
        <button ref={closeRef} type="button" onClick={onClose} className={btn} aria-label="Close photo">
          <X className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      <figure className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 py-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <img src={img.src} alt={img.alt} className="max-h-full min-h-0 max-w-full rounded-2xl object-contain shadow-lift" />
        {img.caption && <figcaption className="text-center text-white/85">{img.caption}</figcaption>}
      </figure>

      {many && (
        <div className="flex justify-center gap-4">
          <button type="button" onClick={() => onMove(-1)} className={btn} aria-label="Previous photo">
            <ChevronLeft className="h-6 w-6" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => onMove(1)} className={btn} aria-label="Next photo">
            <ChevronRight className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function GalleryPage() {
  const [open, setOpen] = useState<number | null>(null);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    document.title = `Gallery | ${clinic.name}`;
  }, []);

  const close = useCallback(() => {
    setOpen((i) => {
      if (i !== null) setTimeout(() => triggers.current[i]?.focus(), 0);
      return null;
    });
  }, []);
  const move = useCallback((step: number) => {
    setOpen((i) => (i === null ? i : (i + step + gallery.length) % gallery.length));
  }, []);

  const hasPhotos = gallery.length > 0;

  return (
    <>
      <section id="gallery" aria-labelledby="gallery-title" className="section bg-white">
        <div className="container-site">
          <a href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-green underline-offset-4 hover:underline">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to home
          </a>

          <div className="mx-auto mt-8 max-w-2xl text-center">
            <p className="eyebrow before:hidden">Gallery</p>
            <h1 id="gallery-title" className="section-title mt-4">
              Inside NeuHope
            </h1>
            <p className="lead mt-5">Take a look around our clinic before your first visit.</p>
          </div>

          <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {hasPhotos
              ? gallery.map((img, i) => (
                  <li key={img.src}>
                    <figure>
                      <button
                        ref={(el) => (triggers.current[i] = el)}
                        type="button"
                        onClick={() => setOpen(i)}
                        className="group block w-full overflow-hidden rounded-card shadow-soft"
                        aria-label={`Enlarge photo: ${img.alt}`}
                      >
                        <img
                          src={img.src}
                          alt={img.alt}
                          loading="lazy"
                          width={800}
                          height={600}
                          className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </button>
                      {img.caption && <figcaption className="mt-3 text-sm text-brand-ink/70">{img.caption}</figcaption>}
                    </figure>
                  </li>
                ))
              : Array.from({ length: PLACEHOLDER_COUNT }, (_, i) => (
                  <li key={i}>
                    <div className="grid aspect-[4/3] w-full place-items-center rounded-card border-2 border-dashed border-brand-green/20 bg-brand-grey">
                      <div className="text-center">
                        <ImageIcon className="mx-auto h-8 w-8 text-brand-green/40" aria-hidden="true" />
                        <p className="placeholder-text mt-3 inline-block">[Insert clinic photo]</p>
                      </div>
                    </div>
                  </li>
                ))}
          </ul>
        </div>
      </section>

      <CallToAction />

      {open !== null && <Lightbox index={open} onClose={close} onMove={move} />}
    </>
  );
}
