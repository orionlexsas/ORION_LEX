import { useLayoutEffect, useRef, useState, type PointerEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { TestimonialsContent } from '@orion-lex/shared';
import { Container } from '@/components/ui/Container';
import { cn } from '@/lib/cn';

interface TestimonialsSectionProps {
  id: string;
  content: TestimonialsContent;
  className?: string;
}

/** Lo que hay que deslizar el dedo (px) para pasar de tarjeta. */
const SWIPE = 40;

/** Iniciales del círculo de cada tarjeta ("María R." → "MR"). */
const initials = (name: string) => {
  const words = name.replace(/\./g, '').split(/\s+/).filter(Boolean);
  return (
    (words[0]?.[0] ?? '') + (words.length > 1 ? (words.at(-1)?.[0] ?? '') : '')
  ).toUpperCase();
};

/**
 * Testimonios casi al final de la portada (maqueta del usuario): fondo crema con comillas gigantes,
 * encabezado con frase manuscrita a la derecha y un carrusel donde la tarjeta del centro es más
 * grande y lleva una franja naranja; las de los lados se ven más pequeñas. Flechas (negra a la
 * izquierda, naranja a la derecha), puntos, deslizar con el dedo y una nota al pie.
 * Sin reseñas en el JSON, la sección no aparece.
 */
export function TestimonialsSection({ id, content, className }: TestimonialsSectionProps) {
  const { t } = useTranslation();
  const titleId = `${id}-title`;
  const count = content.items.length;
  const [active, setActive] = useState(() => Math.min(1, Math.max(count - 1, 0)));
  const [offset, setOffset] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const swipeStart = useRef<number | null>(null);

  const goTo = (index: number) => setActive((index + count) % count);

  // Desplaza la fila para que la tarjeta activa quede centrada (también al cambiar el tamaño).
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;
    const center = () => {
      const card = track.children[active] as HTMLElement | undefined;
      if (card) setOffset(card.offsetLeft + card.offsetWidth / 2 - viewport.clientWidth / 2);
    };
    center();
    const observer = new ResizeObserver(center);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [active]);

  if (count === 0) return null;

  const onPointerDown = (event: PointerEvent) => {
    swipeStart.current = event.clientX;
  };
  const onPointerUp = (event: PointerEvent) => {
    if (swipeStart.current === null) return;
    const dx = event.clientX - swipeStart.current;
    swipeStart.current = null;
    if (Math.abs(dx) > SWIPE) goTo(active + (dx < 0 ? 1 : -1));
  };

  const arrow =
    'grid size-11 shrink-0 cursor-pointer place-items-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95';
  // Desde 640 px van a los lados de las tarjetas; en celular, en la fila de los puntos.
  const sideArrow = 'absolute top-1/2 z-10 -translate-y-1/2 max-sm:hidden sm:size-14';
  const prevClass = 'bg-foreground text-background';
  const nextClass = 'bg-accent text-on-accent';

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={cn(
        'relative isolate scroll-mt-20 overflow-hidden border-t border-accent/70 bg-band section-spacing',
        className,
      )}
    >
      {/* Comillas gigantes de fondo, arriba a la derecha */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -right-6 -z-10 font-serif text-[22rem] leading-none text-accent/[0.06] select-none sm:-top-24 sm:text-[30rem] lg:right-10"
      >
        ”
      </span>

      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="eyebrow">{content.eyebrow}</p>
            <h2
              id={titleId}
              className="mt-3 font-serif text-[2.3rem] leading-[1.02] font-semibold tracking-tight sm:text-5xl lg:text-[3.7rem]"
            >
              {content.title}
            </h2>
          </div>
          {content.script && (
            <p aria-hidden="true" className="w-fit shrink-0 text-foreground/90 lg:mt-12">
              <span className="block -rotate-6 font-script text-[2rem] leading-none sm:text-[2.4rem] xl:text-[2.8rem]">
                {content.script}
              </span>
              <svg viewBox="0 0 240 18" className="mt-1 ml-16 w-48 text-accent sm:w-60">
                <path
                  d="M3 15C60 8 125 4 185 5c20 0 36 2 52 5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </p>
          )}
        </div>
        <p className="mt-4 max-w-3xl text-lg text-muted">{content.description}</p>

        {/* Carrusel */}
        <div
          role="region"
          aria-roledescription="carrusel"
          aria-label={content.title}
          className="relative mt-8 lg:mt-10"
        >
          <div
            ref={viewportRef}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={() => (swipeStart.current = null)}
            className="-mx-5 touch-pan-y overflow-hidden px-5 py-6 select-none sm:mx-0 sm:px-0"
          >
            <ul
              ref={trackRef}
              style={{ transform: `translateX(${-offset}px)` }}
              className="flex items-center gap-4 transition-transform duration-700 ease-out-soft motion-reduce:transition-none sm:gap-5"
            >
              {content.items.map((item, i) => {
                const current = i === active;
                return (
                  <li
                    key={item.name}
                    aria-hidden={!current}
                    onClick={() => !current && goTo(i)}
                    className={cn(
                      'w-[84%] shrink-0 transition-[scale,opacity] duration-700 ease-out-soft motion-reduce:transition-none sm:w-[60%] lg:w-[31%]',
                      current
                        ? 'scale-100'
                        : 'cursor-pointer opacity-80 hover:opacity-100 sm:scale-[0.9]',
                    )}
                  >
                    <figure
                      className={cn(
                        'relative overflow-hidden rounded-md border border-border bg-background p-7 sm:p-9',
                        current
                          ? 'border-l-[6px] border-l-accent shadow-[0_20px_50px_-20px_rgb(0_0_0/0.25)]'
                          : 'shadow-sm',
                      )}
                    >
                      {/* Comillas y número grandes, muy suaves */}
                      <span
                        aria-hidden="true"
                        className="absolute top-2 left-6 font-serif text-[6.5rem] leading-none text-accent/15 sm:left-8"
                      >
                        “
                      </span>
                      <span
                        aria-hidden="true"
                        className="absolute top-5 right-6 font-serif text-[4.5rem] leading-none font-semibold text-accent/10 sm:right-8 sm:text-[5.5rem]"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>

                      <p className="relative mt-12 font-serif text-[2rem] leading-none font-semibold tracking-tight sm:text-[2.6rem]">
                        {item.name}
                      </p>
                      <span aria-hidden="true" className="mt-3 block h-0.5 w-9 bg-accent" />
                      <p className="mt-3 text-[0.78rem] font-semibold tracking-[0.2em] text-accent-text uppercase">
                        {item.service}
                      </p>
                      <blockquote
                        className={cn(
                          'mt-4 leading-snug text-foreground/80',
                          current
                            ? 'text-[1.15rem] sm:text-[1.35rem]'
                            : 'text-[1.05rem] sm:text-[1.2rem]',
                        )}
                      >
                        “{item.text}”
                      </blockquote>
                      <figcaption className="mt-7 flex items-center gap-4">
                        <span
                          aria-hidden="true"
                          className="grid size-14 shrink-0 place-items-center rounded-full bg-band-accent font-serif text-lg"
                        >
                          {initials(item.name)}
                        </span>
                        <span className="h-9 w-px bg-border" aria-hidden="true" />
                        <span className="text-[0.95rem] text-muted">{content.clientLabel}</span>
                      </figcaption>
                    </figure>
                  </li>
                );
              })}
            </ul>
          </div>

          {count > 1 && (
            <>
              <button
                type="button"
                onClick={() => goTo(active - 1)}
                aria-label={t('carousel.previous')}
                className={cn(arrow, sideArrow, prevClass, '-left-6')}
              >
                <ChevronLeft aria-hidden="true" className="size-6" />
              </button>
              <button
                type="button"
                onClick={() => goTo(active + 1)}
                aria-label={t('carousel.next')}
                className={cn(arrow, sideArrow, nextClass, '-right-6')}
              >
                <ChevronRight aria-hidden="true" className="size-6" />
              </button>
            </>
          )}
        </div>

        {/* Puntos e indicación */}
        <div className="mt-2 flex items-center justify-center gap-3">
          {count > 1 && (
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              aria-label={t('carousel.previous')}
              className={cn(arrow, prevClass, 'mr-2 sm:hidden')}
            >
              <ChevronLeft aria-hidden="true" className="size-5" />
            </button>
          )}
          {content.items.map((item, i) => (
            <button
              key={item.name}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`${i + 1} / ${count}`}
              aria-current={i === active}
              className="grid size-6 cursor-pointer place-items-center"
            >
              <span
                className={cn(
                  'block size-2.5 rounded-full transition-colors',
                  i === active ? 'bg-accent' : 'bg-foreground/20',
                )}
              />
            </button>
          ))}
          {count > 1 && (
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              aria-label={t('carousel.next')}
              className={cn(arrow, nextClass, 'ml-2 sm:hidden')}
            >
              <ChevronRight aria-hidden="true" className="size-5" />
            </button>
          )}
        </div>
        <p className="mt-2 text-center text-sm text-muted">{content.hint}</p>
        {content.note && (
          <p className="mt-6 text-center text-xs text-muted sm:text-left">{content.note}</p>
        )}
      </Container>
    </section>
  );
}
