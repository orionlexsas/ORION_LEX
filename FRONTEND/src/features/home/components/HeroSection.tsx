import type { CSSProperties } from 'react';
import { Link } from 'react-router';
import { ArrowDown, Check } from 'lucide-react';
import type { HomeContent } from '@orion-lex/shared';
import { CtaLink } from '@/components/cta/CtaLink';
import { buttonStyles } from '@/components/ui/button-styles';
import { Container } from '@/components/ui/Container';
import { cn } from '@/lib/cn';

/** Retraso escalonado para la animación de entrada (`animate-rise`). */
const delay = (ms: number) => ({ '--delay': `${ms}ms` }) as CSSProperties;

interface HeroSectionProps {
  hero: HomeContent['hero'];
}

/**
 * Portada compacta: desde 1280 px la foto del equipo ocupa el fondo y el texto se apoya en el
 * lado claro; en pantallas menores la foto va arriba y el texto debajo. Es más baja que una pantalla para
 * que los servicios asomen enseguida.
 */
export function HeroSection({ hero }: HeroSectionProps) {
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
          width={1715}
          height={917}
          className="block aspect-[16/10] w-full object-cover object-[78%_center] sm:aspect-[16/7] xl:absolute xl:inset-0 xl:-z-20 xl:aspect-auto xl:h-full xl:object-[68%_center]"
        />
      </picture>
      {/* Degradado para leer el texto sobre la foto (solo pantallas de 1280 px o más) */}
      <div
        aria-hidden="true"
        className={cn(
          'absolute inset-0 -z-10 hidden xl:block',
          'bg-[linear-gradient(90deg,var(--color-background)_0%,var(--color-background)_28%,color-mix(in_oklab,var(--color-background)_75%,transparent)_42%,transparent_60%)]',
        )}
      />

      <Container className="flex flex-col justify-center py-10 sm:py-12 xl:min-h-[min(40rem,calc(100svh-4.5rem-6rem))] xl:py-16">
        <div className="max-w-xl xl:max-w-2xl">
          <p className="eyebrow animate-rise" style={delay(0)}>
            {hero.eyebrow}
          </p>
          <h1
            id="hero-title"
            className="mt-4 animate-rise font-serif text-[2.4rem] leading-[1.08] font-semibold tracking-tight sm:text-5xl lg:text-[3.6rem] xl:text-[4rem]"
            style={delay(80)}
          >
            {hero.title}
          </h1>
          <span
            aria-hidden="true"
            className="mt-6 block h-0.5 w-14 animate-rise bg-accent"
            style={delay(140)}
          />
          <p
            className="mt-6 max-w-lg animate-rise text-lg leading-relaxed text-foreground/85"
            style={delay(200)}
          >
            {hero.description}
          </p>

          <div
            className="mt-8 flex animate-rise flex-col gap-3 sm:flex-row sm:flex-wrap"
            style={delay(280)}
          >
            <CtaLink link={hero.primaryCta} location="hero" size="lg" />
            <Link
              to={hero.secondaryCta.href}
              className={buttonStyles({ variant: 'outline', size: 'lg' })}
            >
              {hero.secondaryCta.label}
              <ArrowDown className="size-4" aria-hidden="true" />
            </Link>
          </div>

          {hero.points.length > 0 && (
            <ul
              className="mt-7 flex animate-rise flex-wrap gap-x-6 gap-y-2 text-sm text-foreground/80"
              style={delay(360)}
            >
              {hero.points.map((point) => (
                <li key={point} className="flex items-center gap-2">
                  <Check className="size-4 text-accent" aria-hidden="true" strokeWidth={2.5} />
                  {point}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>
    </section>
  );
}
