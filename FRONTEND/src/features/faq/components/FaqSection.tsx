import { ArrowRight } from 'lucide-react';
import type { FaqContent } from '@orion-lex/shared';
import { CtaLink } from '@/components/cta/CtaLink';
import { Container } from '@/components/ui/Container';
import { useThemedImage } from '@/hooks/use-themed-image';
import { cn } from '@/lib/cn';
import { FaqItem } from './FaqItem';
import { FaqStructuredData } from './FaqStructuredData';

interface FaqSectionProps {
  id: string;
  content: FaqContent;
}

const fadeLeft = { maskImage: 'linear-gradient(to right, transparent, #000 60%)' };
const fadeTop = { maskImage: 'linear-gradient(to bottom, transparent, #000 50%)' };

/** Sección "Preguntas frecuentes": dos columnas de preguntas desplegables y botón de contacto. */
export function FaqSection({ id, content }: FaqSectionProps) {
  const right = useThemedImage(content.decorations.right);
  const left = useThemedImage(content.decorations.left);
  const titleId = `${id}-title`;
  // Las preguntas se reparten en dos columnas: la primera mitad a la izquierda.
  const half = Math.ceil(content.items.length / 2);
  const columns = [content.items.slice(0, half), content.items.slice(half)];

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className="relative isolate scroll-mt-24 overflow-hidden section-spacing"
    >
      {/* Adornos claros (estatua y mármol): solo combinan con el tema claro. */}
      <img
        src={right.src}
        alt=""
        loading="lazy"
        className="absolute inset-y-0 right-0 -z-10 hidden h-full w-[9rem] object-cover opacity-80 light:xl:block"
        style={fadeLeft}
      />
      <img
        src={left.src}
        alt=""
        loading="lazy"
        className="absolute bottom-0 left-0 -z-10 hidden w-[28rem] light:lg:block"
        style={fadeTop}
      />

      <Container>
        <p className="flex items-center justify-center gap-3 text-xs font-medium tracking-[0.3em] text-gold uppercase sm:gap-5 sm:tracking-[0.45em]">
          <span aria-hidden="true" className="h-px w-6 bg-gold/70 sm:w-16" />
          {content.eyebrow}
          <span aria-hidden="true" className="h-px w-6 bg-gold/70 sm:w-16" />
        </p>
        <h2
          id={titleId}
          className="mt-5 text-center font-serif text-5xl leading-[1.05] tracking-tight sm:text-6xl lg:text-[5.2rem]"
        >
          {content.title.map((part, i) => (
            <span key={part.text} className={cn(part.highlight && 'text-gold italic')}>
              {i > 0 && ' '}
              {part.text}
            </span>
          ))}
        </h2>
        <p className="mt-4 text-center text-lg text-foreground/75 lg:text-[1.35rem]">
          {content.description}
        </p>

        <div className="mx-auto mt-12 grid max-w-[86rem] gap-x-20 lg:mt-14 lg:grid-cols-2">
          {columns.map((items, i) => (
            <div key={i} className={cn(i > 0 && '-mt-px lg:mt-0')}>
              {items.map((item) => (
                <FaqItem key={item.question} item={item} />
              ))}
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-5">
          <CtaLink
            link={content.cta}
            size="lg"
            className="rounded-full px-12 font-serif font-normal"
            trailingIcon={<ArrowRight className="size-5" aria-hidden="true" />}
          />
          {content.footnote && (
            <p className="text-sm tracking-[0.15em] text-foreground/75">{content.footnote}</p>
          )}
        </div>
      </Container>

      <FaqStructuredData items={content.items} />
    </section>
  );
}
