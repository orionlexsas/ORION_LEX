import type { ServicesContent } from '@orion-lex/shared';
import { Container } from '@/components/ui/Container';
import { cn } from '@/lib/cn';
import { PracticeAreaCard } from './PracticeAreaCard';

interface ServicesSectionProps {
  id: string;
  content: ServicesContent;
  className?: string;
}

/**
 * "Servicios jurídicos": desde 1280 px la tarjeta destacada (Asesoría jurídica) a la izquierda y
 * las demás áreas en tres columnas y dos filas a la derecha. Tablet: la destacada a todo el ancho
 * (foto al lado del texto) y el resto en dos o tres columnas. Móvil: una por fila, la destacada primero.
 */
export function ServicesSection({ id, content, className }: ServicesSectionProps) {
  const titleId = `${id}-title`;
  // La destacada siempre va primero, aunque en el JSON esté en otra posición.
  const items = [...content.items].sort((a, b) => Number(b.featured) - Number(a.featured));

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={cn('scroll-mt-20 section-spacing', className)}
    >
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <div className="max-w-3xl">
            <p className="eyebrow">{content.eyebrow}</p>
            <h2
              id={titleId}
              className="mt-3 font-serif text-[2.4rem] leading-[1.05] font-semibold tracking-tight sm:text-5xl lg:text-[3.6rem] xl:text-[4rem]"
            >
              {content.title}
            </h2>
            <p className="mt-3 text-lg text-foreground/80 lg:text-xl">{content.description}</p>
          </div>

          {content.script && (
            <p aria-hidden="true" className="w-fit shrink-0 text-foreground/90 lg:mb-2">
              <span className="block -rotate-6 font-script text-[1.9rem] leading-none sm:text-[2.2rem] xl:text-[2.5rem]">
                {content.script}
              </span>
              <svg viewBox="0 0 220 18" className="mt-1 ml-10 w-44 text-accent sm:w-52">
                <path
                  d="M3 15C60 7 130 3 217 5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </p>
          )}
        </div>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3 xl:grid-cols-[1.7fr_1fr_1fr_1fr] xl:grid-rows-2">
          {items.map((item) => (
            <li
              key={item.slug}
              className={cn(item.featured && 'sm:col-span-full xl:col-span-1 xl:row-span-2')}
            >
              <PracticeAreaCard
                item={item}
                detailsLabel={content.detailsLabel}
                ctaLabel={content.ctaLabel}
              />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
