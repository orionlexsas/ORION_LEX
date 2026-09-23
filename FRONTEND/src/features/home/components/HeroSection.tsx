import type { CSSProperties } from 'react';
import { Link } from 'react-router';
import { CalendarDays, ChevronDown, ChevronRight, Play } from 'lucide-react';
import type { HomeContent } from '@orion-lex/shared';
import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { cn } from '@/lib/cn';
import { HeroContactBar } from './HeroContactBar';
import { HeroHighlights } from './HeroHighlights';
import { HeroSignature } from './HeroSignature';

/** Retraso escalonado para la animación de entrada (`animate-rise`). */
const delay = (ms: number) => ({ '--delay': `${ms}ms` }) as CSSProperties;

interface HeroSectionProps {
  hero: HomeContent['hero'];
  /** Ancla de la sección siguiente, para el indicador "desliza". */
  nextSectionHref: string;
}

export function HeroSection({ hero, nextSectionHref }: HeroSectionProps) {
  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden">
      <picture>
        {hero.image.srcMobile && (
          <source media="(max-width: 767px)" srcSet={hero.image.srcMobile} />
        )}
        <img
          src={hero.image.src}
          alt={hero.image.alt}
          fetchPriority="high"
          className="absolute inset-x-0 top-0 -z-20 h-[32rem] w-full object-cover object-[72%_center] sm:h-[40rem] lg:inset-y-0 lg:h-full lg:object-[70%_center]"
        />
      </picture>
      {/*
       * Degradados para que el texto se lea sobre la foto.
       * Móvil: la foto queda arriba y se funde con el fondo. Escritorio: oscurece la izquierda.
       */}
      <div
        aria-hidden="true"
        className={cn(
          'absolute inset-0 -z-10',
          'bg-[linear-gradient(180deg,transparent_0%,rgb(11_10_8/0.35)_12rem,var(--color-background)_28rem)]',
          'sm:bg-[linear-gradient(180deg,transparent_0%,rgb(11_10_8/0.35)_16rem,var(--color-background)_36rem)]',
          'lg:bg-[linear-gradient(90deg,rgb(11_10_8/0.94)_0%,rgb(11_10_8/0.8)_34%,rgb(11_10_8/0.2)_58%,transparent_72%)]',
        )}
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 hidden h-40 bg-gradient-to-t from-background to-transparent lg:block"
      />

      <Container className="flex flex-col justify-center pt-[17rem] pb-16 sm:pt-[24rem] lg:min-h-[50.75rem] lg:pt-12 lg:pb-24">
        <p
          className="animate-rise text-xs font-medium tracking-[0.35em] text-gold uppercase"
          style={delay(0)}
        >
          {hero.eyebrow}
        </p>

        <h1
          id="hero-title"
          className="mt-4 max-w-[52rem] animate-rise font-serif text-[2.5rem] leading-[1.08] font-bold tracking-tight text-balance sm:text-6xl lg:text-[3.9rem] lg:leading-[1.14]"
          style={delay(80)}
        >
          {hero.titleLines.map((line) => (
            <span key={line.text} className={cn('block', line.highlight && 'text-gold')}>
              {line.text}
            </span>
          ))}
        </h1>

        <p
          className="mt-5 max-w-[38rem] animate-rise text-lg leading-relaxed text-foreground/90 lg:text-[1.3rem] lg:leading-[1.45]"
          style={delay(160)}
        >
          {hero.description}
        </p>

        <div
          className="mt-6 flex animate-rise flex-wrap items-center gap-x-8 gap-y-5"
          style={delay(240)}
        >
          <ButtonLink to={hero.primaryCta.href} size="lg" className="px-9">
            <CalendarDays className="size-5" aria-hidden="true" />
            {hero.primaryCta.label}
            <ChevronRight className="size-5" aria-hidden="true" />
          </ButtonLink>

          <Link to={hero.secondaryCta.href} className="group flex items-center gap-5">
            <span className="grid size-12 place-items-center rounded-full border-2 border-gold/90 transition-colors group-hover:bg-gold/15">
              <Play className="ml-0.5 size-4 fill-gold text-gold" aria-hidden="true" />
            </span>
            <span className="max-w-[10rem] text-[0.95rem] leading-snug text-foreground/90">
              {hero.secondaryCta.label}
            </span>
          </Link>
        </div>

        <HeroHighlights items={hero.highlights} className="mt-6 animate-rise" style={delay(320)} />
        <HeroContactBar
          items={hero.contactItems}
          className="mt-5 animate-rise"
          style={delay(400)}
        />
      </Container>

      <HeroSignature signature={hero.signature} quote={hero.quote} />

      <a
        href={nextSectionHref}
        className="absolute bottom-3 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[0.65rem] tracking-[0.25em] text-muted uppercase transition-colors hover:text-foreground lg:flex"
      >
        {hero.scrollHint}
        <ChevronDown className="size-6 animate-bounce [animation-duration:2s]" aria-hidden="true" />
      </a>
    </section>
  );
}
