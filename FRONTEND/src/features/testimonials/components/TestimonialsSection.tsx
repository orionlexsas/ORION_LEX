import { Quote, Star } from 'lucide-react';
import type { TestimonialsContent } from '@orion-lex/shared';
import { CarouselNav } from '@/components/ui/CarouselNav';
import { Container } from '@/components/ui/Container';
import { carouselItem, carouselTrack, useCarousel } from '@/hooks/use-carousel';
import { useInView } from '@/hooks/use-in-view';
import { cn } from '@/lib/cn';

interface TestimonialsSectionProps {
  id: string;
  content: TestimonialsContent;
  className?: string;
}

/** Iniciales para el círculo de cada reseña ("Luz Dary P." → "LP"). */
const initials = (name: string) => {
  const words = name.replace(/\./g, '').split(/\s+/).filter(Boolean);
  return (
    (words[0]?.[0] ?? '') + (words.length > 1 ? (words.at(-1)?.[0] ?? '') : '')
  ).toUpperCase();
};

/**
 * "Lo que dicen nuestros clientes", casi al final de la portada: sobre negro de marca (como la
 * vitrina de Servicios), entre la franja naranja suave de Cobertura y el blanco de Contacto.
 * Tarjetas con estrellas, la reseña y quién la escribe; 3 columnas en computador y carrusel en
 * celular. Sin reseñas en el JSON, la sección no aparece.
 */
export function TestimonialsSection({ id, content, className }: TestimonialsSectionProps) {
  const titleId = `${id}-title`;
  const [listRef, inView] = useInView<HTMLDivElement>(0.15);
  const { ref: carouselRef, nav: carouselNav } = useCarousel();
  if (content.items.length === 0) return null;

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={cn(
        'on-dark relative isolate scroll-mt-20 overflow-hidden bg-ink section-spacing',
        className,
      )}
    >
      {/* Luz naranja muy suave arriba a la derecha y comillas gigantes de fondo */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_100%_0%,color-mix(in_oklab,var(--color-accent)_16%,transparent),transparent_45%)]"
      />
      <Quote
        aria-hidden="true"
        strokeWidth={1}
        className="absolute top-6 right-4 -z-10 size-40 -scale-x-100 text-foreground/5 sm:size-56 lg:right-12"
      />

      <Container>
        <div className="max-w-2xl">
          <p className="eyebrow">{content.eyebrow}</p>
          <h2
            id={titleId}
            className="mt-3 font-serif text-[2.2rem] leading-[1.05] font-semibold tracking-tight sm:text-5xl lg:text-[3.3rem]"
          >
            {content.title}
          </h2>
          <p className="mt-4 text-lg text-foreground/75">{content.description}</p>
          {content.script && (
            <p aria-hidden="true" className="mt-5 w-fit text-foreground/90">
              <span className="block -rotate-3 font-script text-[1.8rem] leading-none sm:text-[2.2rem]">
                {content.script}
              </span>
              <svg viewBox="0 0 240 18" className="mt-1 ml-10 w-44 text-accent sm:w-56">
                <path
                  d="M3 14C55 8 120 4 180 5c20 0 38 2 55 5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </p>
          )}
        </div>

        <div ref={listRef}>
          <ul
            ref={carouselRef}
            className={cn(
              'mt-10 grid gap-5 max-sm:mt-7 md:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-6',
              carouselTrack,
            )}
          >
            {content.items.map((item, i) => (
              <li
                key={item.name}
                style={{ transitionDelay: `${(i % 3) * 90}ms` }}
                className={cn(
                  carouselItem,
                  'transition-[opacity,translate] duration-700 ease-out-soft motion-reduce:transition-none',
                  inView ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
                )}
              >
                <figure className="flex h-full flex-col rounded-xl border border-foreground/10 bg-foreground/[0.04] p-6 backdrop-blur-sm transition-colors duration-300 hover:border-accent/50 sm:p-7">
                  <div className="flex items-center justify-between">
                    <span
                      role="img"
                      aria-label={`${item.rating} / 5`}
                      className="flex gap-1 text-accent"
                    >
                      {Array.from({ length: 5 }, (_, s) => (
                        <Star
                          key={s}
                          aria-hidden="true"
                          className={cn('size-4', s < item.rating ? 'fill-current' : 'opacity-30')}
                        />
                      ))}
                    </span>
                    <Quote aria-hidden="true" className="size-7 text-accent/70" />
                  </div>
                  <blockquote className="mt-5 flex-1 text-[1.02rem] leading-relaxed text-foreground/85">
                    “{item.text}”
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-3 border-t border-foreground/10 pt-5">
                    <span
                      aria-hidden="true"
                      className="grid size-11 shrink-0 place-items-center rounded-full bg-accent font-serif text-[0.95rem] font-semibold text-on-accent"
                    >
                      {initials(item.name)}
                    </span>
                    <span>
                      <span className="block font-semibold">{item.name}</span>
                      <span className="block text-sm text-foreground/60">{item.detail}</span>
                    </span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
          <CarouselNav {...carouselNav} />
        </div>
      </Container>
    </section>
  );
}
