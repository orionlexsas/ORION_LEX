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

/** Cobertura nacional: atención virtual en toda Colombia y para personas en el exterior. */
export function CoverageSection({ id, content, className }: CoverageSectionProps) {
  const titleId = `${id}-title`;
  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={cn('scroll-mt-20 overflow-hidden section-spacing', className)}
    >
      <Container className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div>
          <SectionHeading
            id={titleId}
            eyebrow={content.eyebrow}
            title={content.title}
            description={content.text}
          />
          <ul className="mt-10 grid gap-6 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {content.points.map((point) => (
              <li key={point.title}>
                <ContentIcon name={point.icon} className="size-7 text-accent" strokeWidth={1.5} />
                <p className="mt-3 font-semibold">{point.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{point.text}</p>
              </li>
            ))}
          </ul>
          <CtaLink link={content.cta} location="coverage" variant="ink" className="mt-10" />
        </div>
        <img
          src={content.image.src}
          alt={content.image.alt}
          loading="lazy"
          decoding="async"
          width={800}
          height={800}
          className="mx-auto w-full max-w-sm opacity-80 dark:opacity-60 lg:max-w-md"
        />
      </Container>
    </section>
  );
}
