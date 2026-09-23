import { ArrowRight } from 'lucide-react';
import type { LocationsContent } from '@orion-lex/shared';
import { CtaLink } from '@/components/cta/CtaLink';
import { Container } from '@/components/ui/Container';
import { ContentIcon } from '@/components/ui/ContentIcon';
import { cn } from '@/lib/cn';
import { LocationsMap } from './LocationsMap';

interface LocationsSectionProps {
  id: string;
  content: LocationsContent;
}

/** Sección "Dónde te atendemos": texto a la izquierda y mapa animado a la derecha. */
export function LocationsSection({ id, content }: LocationsSectionProps) {
  const titleId = `${id}-title`;

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className="scroll-mt-24 overflow-hidden section-spacing"
    >
      <Container className="grid items-center gap-14 lg:grid-cols-[0.85fr_1fr] lg:gap-10">
        <div>
          <p className="flex items-center gap-4 text-sm font-medium tracking-[0.2em] text-gold uppercase">
            {content.eyebrow}
            <span aria-hidden="true" className="h-px w-16 bg-gold" />
          </p>
          <h2
            id={titleId}
            className="mt-5 font-serif text-6xl leading-[1.02] font-bold tracking-tight lg:text-[5.4rem]"
          >
            {content.titleLines.map((line, i) => (
              <span key={i} className="block">
                {line.map((part, j) => (
                  <span key={part.text} className={cn(part.highlight && 'text-gold')}>
                    {j > 0 && ' '}
                    {part.text}
                  </span>
                ))}
              </span>
            ))}
          </h2>
          <p className="mt-6 max-w-[32rem] text-lg leading-snug text-foreground/85 lg:text-[1.55rem]">
            {content.description}
          </p>

          <ul className="mt-8 space-y-5">
            {content.features.map((feature) => (
              <li key={feature.text} className="flex items-center gap-6">
                <span className="grid size-16 shrink-0 place-items-center rounded-full border-[1.5px] border-gold text-gold lg:size-20">
                  <ContentIcon name={feature.icon} className="size-8 lg:size-9" strokeWidth={1.3} />
                </span>
                <span aria-hidden="true" className="h-12 w-px bg-gold/50" />
                <span className="max-w-[12rem] text-lg leading-snug lg:text-xl">
                  {feature.text}
                </span>
              </li>
            ))}
          </ul>

          <CtaLink
            link={content.cta}
            size="lg"
            className="mt-9 px-10 lg:ml-[5.5rem]"
            trailingIcon={<ArrowRight className="size-5" aria-hidden="true" />}
          />
        </div>

        <LocationsMap map={content.map} cities={content.cities} />
      </Container>
    </section>
  );
}
