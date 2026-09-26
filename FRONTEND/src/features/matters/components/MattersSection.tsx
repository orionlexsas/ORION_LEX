import type { LandingContent, MattersContent } from '@orion-lex/shared';
import { Container } from '@/components/ui/Container';
import { cn } from '@/lib/cn';
import { MatterCard } from './MatterCard';

interface MattersSectionProps {
  id: string;
  content: MattersContent;
  landings: LandingContent[];
  /** h1 cuando la sección encabeza la página (/servicios). */
  headingLevel?: 'h1' | 'h2';
  className?: string;
}

/**
 * "Asuntos que atendemos con frecuencia": encabezado con frase manuscrita a la derecha y seis
 * tarjetas que llevan a cada landing page. Dos columnas desde tablet (3 filas de 2) y una en móvil.
 * El orden y las tarjetas salen de matters.json → `order` (cada slug es un archivo de landings/).
 */
export function MattersSection({
  id,
  content,
  landings,
  headingLevel: Heading = 'h2',
  className,
}: MattersSectionProps) {
  const titleId = `${id}-title`;
  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={cn('scroll-mt-20 section-spacing', className)}
    >
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <div className="max-w-3xl xl:max-w-none">
            <p className="eyebrow">{content.eyebrow}</p>
            <Heading
              id={titleId}
              className="mt-3 font-serif text-[2.1rem] leading-[1.08] font-semibold tracking-tight sm:text-5xl lg:text-[3.2rem] xl:text-[3.15rem]"
            >
              {content.title}
            </Heading>
            <p className="mt-3 text-lg text-foreground/75 lg:text-xl">{content.description}</p>
          </div>

          {content.script && (
            // Frase decorativa tipo firma: debajo de la introducción en móvil, a la derecha en escritorio.
            <p aria-hidden="true" className="w-fit shrink-0 text-foreground/90 lg:mb-1">
              <span className="block max-w-[17rem] -rotate-6 font-script text-[1.9rem] leading-[1.05] sm:max-w-[20rem] sm:text-[2.2rem] xl:max-w-[17rem] xl:text-[2.3rem]">
                {content.script}
              </span>
              <svg viewBox="0 0 260 20" className="mt-1 ml-8 w-52 text-accent sm:w-60">
                <path
                  d="M3 16C70 8 150 4 257 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </p>
          )}
        </div>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-12 lg:gap-6">
          {landings.map((landing, i) => (
            <li key={landing.slug}>
              <MatterCard landing={landing} ctaLabel={content.cardCta} priority={i < 2} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
