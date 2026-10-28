import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ImageIcon, X } from 'lucide-react';
import { gallery } from '../data/site';
import SectionHeading from './SectionHeading';

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

export default function GallerySection() {
  const [open, setOpen] = useState<number | null>(null);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);

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
      <section id="gallery" aria-labelledby="gallery-title" className="section bg-brand-sage">
        <div className="container-site">
          <SectionHeading line={false} eyebrow="Gallery" title="Inside NeuHope" id="gallery-title">
            <p>Take a look around our clinic before your first visit.</p>
          </SectionHeading>

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
                    <div className="grid aspect-[4/3] w-full place-items-center rounded-card border-2 border-dashed border-brand-green/20 bg-white/60">
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

      {open !== null && <Lightbox index={open} onClose={close} onMove={move} />}
    </>
  );
}
