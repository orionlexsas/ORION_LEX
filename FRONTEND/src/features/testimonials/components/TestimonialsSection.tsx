import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import type { TestimonialsContent } from '@orion-lex/shared';
import { Container } from '@/components/ui/Container';
import { cn } from '@/lib/cn';
import { MIN_CARDS, startArcCarousel, type ArcCarousel } from '../lib/arc-carousel';

interface TestimonialsSectionProps {
  id: string;
  content: TestimonialsContent;
  className?: string;
}

type Testimonial = TestimonialsContent['items'][number];

/** Iniciales del círculo de cada tarjeta ("María R." → "MR"). */
const initials = (name: string) => {
  const words = name.replace(/\./g, '').split(/\s+/).filter(Boolean);
  return (
    (words[0]?.[0] ?? '') + (words.length > 1 ? (words.at(-1)?.[0] ?? '') : '')
  ).toUpperCase();
};

/**
 * Testimonios casi al final de la portada (maqueta del usuario): fondo crema con comillas gigantes,
 * encabezado con frase manuscrita a la derecha y las tarjetas en un carrusel en arco que entra
 * solo y avanza sin fin (ver lib/arc-carousel); se puede arrastrar y tiene flechas con un botón
 * de pausa en medio. La tarjeta del centro resalta: más grande, franja
 * naranja y sombra mayor. Las tarjetas animadas son decorativas (aria-hidden): el contenido real
 * va en una lista solo para lectores de pantalla. Sin reseñas en el JSON, la sección no aparece.
 */
export function TestimonialsSection({ id, content, className }: TestimonialsSectionProps) {
  const { t } = useTranslation();
  const titleId = `${id}-title`;
  const { items } = content;
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const carousel = useRef<ArcCarousel | null>(null);
  const [paused, setPaused] = useState(false);

  // El set completo se repite hasta tener tarjetas suficientes para el bucle (las repetidas
  // nunca quedan juntas porque se repite el set entero, no cada tarjeta).
  const copies = items.length ? Math.ceil(MIN_CARDS / items.length) : 0;
  const cards = Array.from({ length: copies }, () => items).flat();

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const instance = startArcCarousel(
      stage,
      cardRefs.current.filter((card): card is HTMLDivElement => card !== null),
    );
    carousel.current = instance;
    return () => {
      instance.dispose();
      carousel.current = null;
    };
  }, [cards.length]);

  const togglePause = () => {
    carousel.current?.setPaused(!paused);
    setPaused(!paused);
  };
  const control =
    'grid size-12 cursor-pointer place-items-center rounded-full shadow-md transition-transform hover:scale-105 active:scale-95';

  if (items.length === 0) return null;

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
        <p className="mt-3 max-w-3xl text-lg text-muted">{content.description}</p>

        {/* Para lectores de pantalla y buscadores: cada reseña una sola vez */}
        <ul className="sr-only">
          {items.map((item) => (
            <li key={item.name}>
              <blockquote>{item.text}</blockquote>
              <p>
                {item.name}, {item.service}. {content.clientLabel}
              </p>
            </li>
          ))}
        </ul>
      </Container>

      {/*
        Escenario del carrusel: a todo el ancho; el JS coloca cada tarjeta con transform. Se puede
        arrastrar (touch-pan-y: en celular, deslizar en vertical sigue bajando la página).
      */}
      <div
        ref={stageRef}
        aria-hidden="true"
        className="relative mt-6 h-[26.5rem] cursor-grab touch-pan-y select-none active:cursor-grabbing sm:h-[31rem] lg:mt-8"
      >
        {cards.map((item, i) => (
          <div
            key={`${item.name}-${i}`}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            style={{ opacity: 0 }}
            className="group absolute top-2 left-0 -ml-[8.25rem] h-[23rem] w-[16.5rem] will-change-transform sm:-ml-[10rem] sm:h-[25rem] sm:w-[20rem] lg:-ml-[11rem] lg:w-[22rem]"
          >
            <TestimonialCard
              item={item}
              number={(i % items.length) + 1}
              clientLabel={content.clientLabel}
            />
          </div>
        ))}
      </div>

      <Container>
        {/* Flechas para pasar y, en medio, pausar o reanudar */}
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => carousel.current?.previous()}
            aria-label={t('carousel.previous')}
            className={cn(control, 'bg-foreground text-background')}
          >
            <ChevronLeft aria-hidden="true" className="size-6" />
          </button>
          <button
            type="button"
            onClick={togglePause}
            aria-label={paused ? t('carousel.play') : t('carousel.pause')}
            aria-pressed={paused}
            className={cn(control, 'size-11 border border-border bg-background text-foreground')}
          >
            {paused ? (
              <Play aria-hidden="true" className="size-5 translate-x-px" />
            ) : (
              <Pause aria-hidden="true" className="size-5" />
            )}
          </button>
          <button
            type="button"
            onClick={() => carousel.current?.next()}
            aria-label={t('carousel.next')}
            className={cn(control, 'bg-accent text-on-accent')}
          >
            <ChevronRight aria-hidden="true" className="size-6" />
          </button>
        </div>
        {content.note && (
          <p className="mt-5 text-center text-xs text-muted sm:text-left">{content.note}</p>
        )}
      </Container>
    </section>
  );
}

interface TestimonialCardProps {
  item: Testimonial;
  number: number;
  clientLabel: string;
}

/** Tarjeta de la maqueta: comillas y número suaves, nombre, asunto, reseña e iniciales. */
function TestimonialCard({ item, number, clientLabel }: TestimonialCardProps) {
  return (
    <figure
      className={cn(
        'relative flex h-full flex-col overflow-hidden rounded-md border border-border bg-background p-6 shadow-sm transition-[box-shadow,border-color] duration-500 sm:p-8',
        // La del centro resalta (data-center lo pone el carrusel).
        'group-data-[center=true]:border-l-[6px] group-data-[center=true]:border-l-accent group-data-[center=true]:shadow-[0_24px_60px_-20px_rgb(0_0_0/0.3)]',
      )}
    >
      <span
        aria-hidden="true"
        className="absolute top-1 left-5 font-serif text-[5.5rem] leading-none text-accent/15 sm:left-7 sm:text-[6.5rem]"
      >
        “
      </span>
      <span
        aria-hidden="true"
        className="absolute top-4 right-5 font-serif text-[3.8rem] leading-none font-semibold text-accent/10 sm:right-7 sm:text-[4.8rem]"
      >
        {String(number).padStart(2, '0')}
      </span>

      <p className="relative mt-10 font-serif text-[1.8rem] leading-none font-semibold tracking-tight sm:mt-12 sm:text-[2.3rem]">
        {item.name}
      </p>
      <span aria-hidden="true" className="mt-3 block h-0.5 w-9 bg-accent" />
      <p className="mt-3 text-[0.72rem] font-semibold tracking-[0.2em] text-accent-text uppercase sm:text-[0.78rem]">
        {item.service}
      </p>
      <blockquote className="mt-3 line-clamp-6 flex-1 text-[0.98rem] leading-snug text-foreground/80 sm:text-[1.1rem]">
        “{item.text}”
      </blockquote>
      <figcaption className="mt-4 flex items-center gap-3">
        <span
          aria-hidden="true"
          className="grid size-11 shrink-0 place-items-center rounded-full bg-band-accent font-serif sm:size-12"
        >
          {initials(item.name)}
        </span>
        <span className="h-8 w-px bg-border" aria-hidden="true" />
        <span className="text-[0.85rem] text-muted sm:text-[0.95rem]">{clientLabel}</span>
      </figcaption>
    </figure>
  );
}
