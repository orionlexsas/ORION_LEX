import { Link } from 'react-router';
import { ArrowRight, ChevronRight } from 'lucide-react';
import type { ServicesContent } from '@orion-lex/shared';
import { CarouselNav } from '@/components/ui/CarouselNav';
import { ContentIcon } from '@/components/ui/ContentIcon';
import { Container } from '@/components/ui/Container';
import { carouselItem, carouselTrack, useCarousel } from '@/hooks/use-carousel';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/cn';
import { practiceAreaHref } from '../lib/routes';

interface ServicesSectionProps {
  id: string;
  content: ServicesContent;
  className?: string;
}

type Area = ServicesContent['items'][number];
type Variant = 'featured' | 'wide' | 'normal' | 'row';

/**
 * Lugar de cada tarjeta en el mosaico de computador (maqueta del usuario, 12 columnas y 3 filas):
 * la destacada ocupa dos filas a la izquierda; a su derecha dos tarjetas y una ancha debajo; en
 * la última fila, tres tarjetas iguales.
 */
const AREAS: { place: string; variant: Variant }[] = [
  { place: 'lg:col-span-5 lg:row-span-2', variant: 'featured' },
  { place: 'lg:col-span-4', variant: 'normal' },
  { place: 'lg:col-span-3', variant: 'normal' },
  { place: 'lg:col-span-7', variant: 'wide' },
  { place: 'lg:col-span-4', variant: 'row' },
  { place: 'lg:col-span-4', variant: 'row' },
  { place: 'lg:col-span-4', variant: 'row' },
];

/**
 * "Nuestros servicios" (maqueta del usuario): encabezado con la última palabra del título en
 * naranja y una cita a la derecha sobre una imagen fundida con el fondo; debajo, un mosaico de
 * tarjetas claras con la foto de cada área fundida hacia la derecha, su ícono en un círculo, el
 * nombre, una frase y "Ver más". Cabe en una pantalla de portátil. En celular, las tarjetas se
 * deslizan de lado (la destacada primero).
 */
export function ServicesSection({ id, content, className }: ServicesSectionProps) {
  const titleId = `${id}-title`;
  // La destacada siempre va primero, aunque en el JSON esté en otra posición.
  const items = [...content.items].sort((a, b) => Number(b.featured) - Number(a.featured));
  const { ref: carouselRef, nav: carouselNav } = useCarousel();
  const words = content.title.trim().split(/\s+/);
  const accentWord = words.length > 1 ? words.pop() : undefined;

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={cn(
        'relative isolate scroll-mt-20 overflow-hidden bg-[color-mix(in_oklab,var(--color-band)_45%,var(--color-background))] py-10 sm:py-12 lg:py-8',
        className,
      )}
    >
      {/* Imagen decorativa arriba a la derecha, fundida con el fondo */}
      {content.decor && (
        <img
          src={content.decor.src}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="pointer-events-none absolute top-0 right-0 -z-10 hidden h-[17rem] w-[34rem] object-cover object-[70%_30%] opacity-80 [mask-image:radial-gradient(ellipse_70%_90%_at_80%_20%,black_30%,transparent_75%)] lg:block"
        />
      )}

      <Container>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="flex items-center gap-3 text-[0.75rem] font-semibold tracking-[0.22em] text-accent-text uppercase">
              {content.eyebrow}
              <span aria-hidden="true" className="h-px w-10 bg-accent/70" />
            </p>
            <h2
              id={titleId}
              className="mt-2 font-serif text-[2.5rem] leading-[1.02] font-semibold tracking-tight sm:text-5xl lg:mt-1 lg:text-[3.1rem]"
            >
              {words.join(' ')}{' '}
              {accentWord && <span className="text-accent-text">{accentWord}</span>}
            </h2>
            <p className="mt-2 text-lg text-foreground/80">{content.description}</p>
          </div>
          {content.quote && (
            <blockquote className="max-w-[17rem] border-l border-accent/50 pl-6 font-serif text-[1.05rem] leading-snug text-foreground/80 italic max-lg:hidden lg:mr-40 lg:mb-1">
              “{content.quote}”
              <span aria-hidden="true" className="mt-3 block h-px w-10 bg-accent/70" />
            </blockquote>
          )}
        </div>

        <ul
          ref={carouselRef}
          className={cn(
            'mt-6 grid gap-4 sm:grid-cols-2 lg:mt-4 lg:grid-cols-12 lg:grid-rows-[repeat(3,minmax(0,auto))] lg:gap-3',
            carouselTrack,
          )}
        >
          {items.map((item, i) => {
            const layout = AREAS[i] ?? { place: 'lg:col-span-4', variant: 'normal' as const };
            return (
              <li
                key={item.slug}
                className={cn(carouselItem, layout.place, i === 0 && 'sm:col-span-2')}
              >
                <AreaCard item={item} variant={layout.variant} content={content} />
              </li>
            );
          })}
        </ul>
        <CarouselNav {...carouselNav} />
      </Container>
    </section>
  );
}

interface AreaCardProps {
  item: Area;
  variant: Variant;
  content: ServicesContent;
}

/** Tarjeta clara: foto fundida hacia la derecha, ícono en un círculo, nombre, frase y "Ver más". */
function AreaCard({ item, variant, content }: AreaCardProps) {
  const featured = variant === 'featured';
  return (
    <Link
      to={practiceAreaHref(item.slug)}
      onClick={() => track('service_card_click', { service: item.slug })}
      className={cn(
        'group relative flex h-full min-h-[13rem] flex-col lg:min-h-[9.2rem] overflow-hidden rounded-lg border border-accent/25 bg-background shadow-[0_14px_36px_-26px_rgb(0_0_0/0.45)] transition-[border-color,box-shadow,translate] duration-300 ease-out-soft hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-[0_20px_44px_-24px_rgb(0_0_0/0.5)]',
        featured && 'lg:min-h-0',
      )}
    >
      {/* Foto del área, fundida hacia el texto */}
      <img
        src={item.image.src}
        alt=""
        loading="lazy"
        decoding="async"
        className={cn(
          'absolute inset-y-0 right-0 h-full object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.04]',
          featured ? 'w-[68%]' : variant === 'wide' ? 'w-[55%]' : 'w-[62%]',
          '[mask-image:linear-gradient(to_left,black_40%,transparent_96%)]',
        )}
      />

      <div
        className={cn(
          'relative flex flex-1 flex-col p-5',
          featured ? 'lg:p-6' : 'lg:px-5 lg:py-4',
          (variant === 'wide' || variant === 'row') && 'lg:flex-row lg:items-start lg:gap-4',
        )}
      >
        {featured && content.featuredEyebrow && (
          <p className="mb-2.5 text-[0.68rem] font-semibold tracking-[0.2em] text-foreground/70 uppercase">
            {content.featuredEyebrow}
          </p>
        )}
        <span
          className={cn(
            'grid shrink-0 place-items-center rounded-full border-[1.5px] border-accent/80 bg-background/70 text-accent-text',
            featured ? 'size-12' : 'size-11',
          )}
        >
          <ContentIcon
            name={item.icon}
            className={featured ? 'size-6' : 'size-5'}
            strokeWidth={1.5}
          />
        </span>
        <div
          className={cn(
            'flex flex-1 flex-col',
            variant === 'wide' || variant === 'row' ? 'mt-3 lg:mt-0' : 'mt-2.5',
          )}
        >
          <h3
            className={cn(
              'max-w-[14ch] font-serif leading-[1.05] font-semibold tracking-tight [text-shadow:0_1px_8px_var(--color-background)]',
              featured ? 'text-[2.2rem] lg:text-[2.4rem]' : 'text-[1.45rem] lg:text-[1.45rem]',
            )}
          >
            {item.title}
          </h3>
          <p
            className={cn(
              'mt-2 max-w-[22rem] leading-snug text-foreground/75 [text-shadow:0_1px_6px_var(--color-background)]',
              featured ? 'text-[1rem]' : 'max-w-[15rem] text-[0.88rem] lg:mt-1.5',
            )}
          >
            {item.description}
          </p>
          <span className="mt-auto flex items-center gap-2.5 pt-3 text-[0.9rem] font-medium lg:pt-2.5">
            <span className="grid size-8 place-items-center rounded-full border border-accent/80 text-accent-text transition-colors group-hover:bg-accent group-hover:text-on-accent">
              <ChevronRight aria-hidden="true" className="size-4" />
            </span>
            {content.readMoreLabel}
            <ArrowRight
              aria-hidden="true"
              className="size-4 text-accent-text transition-transform duration-300 group-hover:translate-x-1"
            />
          </span>
        </div>
      </div>

      {featured && content.featuredNote && (
        <div className="relative flex flex-col gap-1 border-t border-accent/25 bg-band-accent/95 px-5 py-3 sm:flex-row sm:items-center sm:gap-4 lg:px-6">
          <p className="shrink-0 text-[0.66rem] sm:max-w-[9rem] leading-snug font-semibold tracking-[0.18em] text-foreground/80 uppercase">
            {content.featuredNote.title}
          </p>
          <span aria-hidden="true" className="hidden h-8 w-px bg-accent/50 sm:block" />
          <p className="text-[0.88rem] leading-snug text-foreground/80">
            {content.featuredNote.text}
          </p>
        </div>
      )}
    </Link>
  );
}
