import type { LandingContent, MattersContent } from '@orion-lex/shared';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
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
 * "Asuntos que atendemos con frecuencia": tarjetas que llevan a cada landing page.
 * Una columna en móvil y dos en tablet y escritorio (3 filas de 2 con los 6 servicios).
 */
export function MattersSection({
  id,
  content,
  landings,
  headingLevel = 'h2',
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
        <SectionHeading
          id={titleId}
          as={headingLevel}
          eyebrow={content.eyebrow}
          title={content.title}
          description={content.description}
        />
        <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:mt-12 lg:gap-5">
          {landings.map((landing) => (
            <li key={landing.slug} className="grid">
              <MatterCard landing={landing} ctaLabel={content.cardCta} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
