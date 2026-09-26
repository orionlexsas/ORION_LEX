import type { LandingContent } from '@orion-lex/shared';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { cn } from '@/lib/cn';

type Process = NonNullable<LandingContent['process']>;

/** "¿Cómo trabajamos?": pasos numerados, en fila en escritorio y en columna en móvil. */
export function ProcessSteps({ process }: { process: Process }) {
  const columns = process.steps.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3';
  return (
    <section aria-labelledby="landing-process" className="section-spacing">
      <Container>
        <SectionHeading id="landing-process" title={process.title} />
        <ol className={cn('mt-12 grid gap-10 sm:grid-cols-2 lg:gap-8', columns)}>
          {process.steps.map((step, i) => (
            <li key={step.title} className="relative">
              <div className="flex items-center gap-4">
                <span
                  aria-hidden="true"
                  className="grid size-12 shrink-0 place-items-center rounded-full border-2 border-accent font-serif text-xl font-semibold"
                >
                  {i + 1}
                </span>
                {/* Línea hacia el siguiente paso (solo en la fila de escritorio) */}
                {i < process.steps.length - 1 && (
                  <span aria-hidden="true" className="hidden h-px flex-1 bg-border lg:block" />
                )}
              </div>
              <h3 className="mt-5 font-serif text-xl font-semibold">
                <span className="sr-only">{i + 1}. </span>
                {step.title}
              </h3>
              <p className="mt-2 leading-relaxed text-muted">{step.description}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
