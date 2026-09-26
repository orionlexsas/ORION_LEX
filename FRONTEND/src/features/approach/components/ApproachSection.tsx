import type { ApproachContent } from '@orion-lex/shared';
import { CtaLink } from '@/components/cta/CtaLink';
import { ContentIcon } from '@/components/ui/ContentIcon';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { cn } from '@/lib/cn';

interface ApproachSectionProps {
  id: string;
  content: ApproachContent;
  className?: string;
}

/** "Cómo trabajamos": los pasos de la atención, numerados. */
export function ApproachSection({ id, content, className }: ApproachSectionProps) {
  const titleId = `${id}-title`;

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={cn('scroll-mt-20 section-spacing', className)}
    >
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            id={titleId}
            eyebrow={content.eyebrow}
            title={content.title}
            description={content.description}
          />
          <CtaLink
            link={content.cta}
            location="approach"
            variant="ink"
            className="self-start lg:self-auto"
          />
        </div>

        <ol className="mt-12 grid gap-5 md:grid-cols-3">
          {content.steps.map((step, i) => (
            <li key={step.title} className="rounded-lg border border-border bg-background p-7">
              <div className="flex items-center justify-between">
                <ContentIcon name={step.icon} className="size-9 text-accent" strokeWidth={1.4} />
                <span
                  aria-hidden="true"
                  className="font-serif text-4xl font-semibold text-foreground/15"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <h3 className="mt-6 font-serif text-2xl font-semibold">
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
