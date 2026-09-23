import { ArrowRight, Scale } from 'lucide-react';
import type { ApproachContent } from '@orion-lex/shared';
import { CtaLink } from '@/components/cta/CtaLink';
import { Container } from '@/components/ui/Container';
import { useThemedImage } from '@/hooks/use-themed-image';
import { cn } from '@/lib/cn';
import { ApproachStep } from './ApproachStep';

interface ApproachSectionProps {
  id: string;
  content: ApproachContent;
}

// Funde la estatua decorativa con el fondo por todos los lados.
const decorationMask = {
  maskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 72%)',
};

/** Sección "Nuestro enfoque": cómo trabaja el despacho, en pasos numerados. */
export function ApproachSection({ id, content }: ApproachSectionProps) {
  const decoration = useThemedImage(content.decoration);
  const titleId = `${id}-title`;

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className="relative isolate scroll-mt-24 overflow-hidden section-spacing"
    >
      <img
        src={decoration.src}
        alt=""
        loading="lazy"
        // Foto clara: solo combina con el tema claro.
        className="absolute top-0 left-[58%] -z-10 hidden w-[26rem] opacity-60 light:lg:block"
        style={decorationMask}
      />

      <Container>
        <div className="relative">
          <p className="text-xs font-semibold tracking-[0.35em] text-gold uppercase">
            {content.eyebrow}
          </p>
          <h2
            id={titleId}
            className="mt-4 font-serif text-5xl leading-[1.05] font-bold tracking-tight sm:text-6xl lg:text-[4.4rem]"
          >
            {content.title.map((part, i) => (
              <span key={part.text} className={cn(part.highlight && 'text-gold')}>
                {i > 0 && ' '}
                {part.text}
              </span>
            ))}
          </h2>
          <p className="mt-3 max-w-[48rem] text-lg text-foreground/85 lg:text-[1.45rem]">
            {content.description}
          </p>

          <div aria-hidden="true" className="absolute top-2 right-0 hidden xl:block">
            <p className="-rotate-[14deg] font-script text-[2.5rem] leading-[1.05] text-foreground/85">
              {content.scriptLines.map((line, i) => (
                <span key={line} className="block" style={{ marginLeft: `${i * -0.5}rem` }}>
                  {line}
                </span>
              ))}
            </p>
            <svg viewBox="0 0 240 40" className="-mt-2 ml-auto w-60 text-gold">
              <path d="M2 38C70 20 150 8 238 2" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
        </div>

        <ol className="mx-auto mt-16 grid max-w-xl gap-12 lg:max-w-none lg:grid-cols-3 lg:gap-8">
          {content.steps.map((step, i) => (
            <ApproachStep
              key={step.title}
              step={step}
              number={i + 1}
              connectToNext={i < content.steps.length - 1}
            />
          ))}
        </ol>

        <div className="mt-12 flex justify-center">
          <CtaLink
            link={content.cta}
            className="px-12"
            trailingIcon={<ArrowRight className="size-5" aria-hidden="true" />}
          />
        </div>

        <div aria-hidden="true" className="mt-10 flex items-center gap-6 text-gold">
          <span className="h-px flex-1 bg-gold/50" />
          <Scale className="size-8" strokeWidth={1.4} />
          <span className="h-px flex-1 bg-gold/50" />
        </div>
      </Container>
    </section>
  );
}
