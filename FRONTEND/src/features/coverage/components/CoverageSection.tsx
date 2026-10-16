import type { CoverageContent } from '@orion-lex/shared';
import { CtaLink } from '@/components/cta/CtaLink';
import { ContentIcon } from '@/components/ui/ContentIcon';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { cn } from '@/lib/cn';

interface CoverageSectionProps {
  id: string;
  content: CoverageContent;
  className?: string;
}

/**
 * Cobertura nacional: atención virtual en toda Colombia y para personas en el exterior. Sobre la
 * foto de una oficina luminosa (maqueta del usuario): el texto a la izquierda con un halo claro
 * detrás y, a la derecha, el mapa dentro de un marco fino que el mapa desborda un poco.
 */
export function CoverageSection({ id, content, className }: CoverageSectionProps) {
  const titleId = `${id}-title`;
  const { background } = content;
  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={cn('relative isolate scroll-mt-20 overflow-hidden section-spacing', className)}
    >
      {background && (
        <>
          <picture>
            {background.srcMobile && (
              <source media="(max-width: 767px)" srcSet={background.srcMobile} />
            )}
            <img
              src={background.src}
              alt={background.alt}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 -z-20 size-full object-cover"
            />
          </picture>
          {/* Halo claro detrás del texto; en celular, velo parejo para leer sobre la foto */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-background/70 lg:bg-transparent lg:bg-[radial-gradient(ellipse_48%_95%_at_22%_50%,color-mix(in_oklab,var(--color-background)_88%,transparent)_0%,color-mix(in_oklab,var(--color-background)_62%,transparent)_48%,color-mix(in_oklab,var(--color-background)_18%,transparent)_75%,transparent_92%)] dark:bg-background/80 lg:dark:bg-background/70"
          />
        </>
      )}

      <Container className="grid items-center gap-10 max-sm:gap-6 lg:grid-cols-[1fr_1.05fr] lg:gap-12">
        <div>
          <SectionHeading
            id={titleId}
            eyebrow={content.eyebrow}
            title={content.title}
            description={content.text}
          />
          <ul className="mt-7 space-y-3.5 max-sm:mt-5">
            {content.points.map((point) => (
              <li key={point.title} className="flex items-center gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-full border-[1.5px] border-accent/80 bg-background/60 text-accent-text">
                  <ContentIcon name={point.icon} className="size-5" strokeWidth={1.5} />
                </span>
                <span aria-hidden="true" className="h-9 w-px bg-accent/40" />
                <span>
                  <span className="block font-semibold">{point.title}</span>
                  <span className="block text-sm leading-snug text-foreground/75">
                    {point.text}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <CtaLink
            link={content.cta}
            location="coverage"
            variant="ink"
            className="mt-7 max-sm:mt-6"
          />
        </div>

        {/* Mapa dentro de un marco fino; el mapa lo desborda un poco */}
        <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
          <span
            aria-hidden="true"
            className="absolute inset-x-[6%] inset-y-[8%] rounded-sm border border-accent/45 bg-background/25 backdrop-blur-[2px]"
          />
          <img
            src={content.image.src}
            alt={content.image.alt}
            loading="lazy"
            decoding="async"
            width={1131}
            height={919}
            className="relative w-full drop-shadow-[0_18px_30px_rgb(0_0_0/0.2)]"
          />
        </div>
      </Container>
    </section>
  );
}
