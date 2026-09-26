import type { ApproachContent } from '@orion-lex/shared';
import { CtaLink } from '@/components/cta/CtaLink';
import { Container } from '@/components/ui/Container';
import { useInView } from '@/hooks/use-in-view';
import { cn } from '@/lib/cn';
import { ApproachStep } from './ApproachStep';
import { ProcessConnector } from './ProcessConnector';

interface ApproachSectionProps {
  id: string;
  content: ApproachContent;
  className?: string;
}

/**
 * "Cómo trabajamos": encabezado con la frase manuscrita a la derecha, de la que sale la línea
 * naranja que une las tres etapas (escritorio). Tres tarjetas en fila desde 1024 px, dos y una en
 * tablet, una por fila en móvil. Las tarjetas aparecen escalonadas al entrar en pantalla
 * (sin animación si el usuario pidió reducir el movimiento: ver globals.css).
 */
export function ApproachSection({ id, content, className }: ApproachSectionProps) {
  const titleId = `${id}-title`;
  const [listRef, inView] = useInView<HTMLOListElement>(0.15);

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
            <p
              aria-hidden="true"
              className="w-fit shrink-0 -rotate-6 font-script text-[1.9rem] leading-none text-foreground/90 sm:text-[2.2rem] lg:mr-4 lg:-mb-6 xl:text-[2.5rem]"
            >
              {content.script}
            </p>
          )}
        </div>

        <ProcessConnector />

        <ol
          ref={listRef}
          className="mt-10 grid gap-6 sm:grid-cols-2 lg:mt-0 lg:grid-cols-3 lg:gap-6 sm:max-lg:*:last:col-span-2 sm:max-lg:*:last:mx-auto sm:max-lg:*:last:w-[calc(50%-0.75rem)]"
        >
          {content.steps.map((step, i) => (
            <ApproachStep key={step.title} step={step} number={i + 1} visible={inView} />
          ))}
        </ol>

        {content.cta && (
          <div className="mt-12 flex justify-center">
            <CtaLink link={content.cta} location="approach" variant="ink" />
          </div>
        )}
      </Container>
    </section>
  );
}
