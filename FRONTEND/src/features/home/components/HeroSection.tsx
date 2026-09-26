import type { CSSProperties } from 'react';
import { ArrowRight } from 'lucide-react';
import type { HomeContent } from '@orion-lex/shared';
import { CtaLink } from '@/components/cta/CtaLink';
import { ContentIcon } from '@/components/ui/ContentIcon';
import { Container } from '@/components/ui/Container';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/cn';

/** Retraso escalonado para la animación de entrada (`animate-rise`). */
const delay = (ms: number) => ({ '--delay': `${ms}ms` }) as CSSProperties;

interface HeroSectionProps {
  hero: HomeContent['hero'];
}

/**
 * Portada. Desde 1280 px la foto del equipo ocupa todo el fondo, anclada a la derecha, y el texto
 * va en el lado libre de la izquierda (nunca sobre los rostros), con una transición suave del
 * color de fondo del tema. En tablet y móvil primero va el texto y después la foto como bloque.
 * Termina con una franja de confianza; debajo asoma "Asuntos que atendemos con frecuencia".
 */
export function HeroSection({ hero }: HeroSectionProps) {
  // "/#asuntos" → "#asuntos": ancla en la misma página, con desplazamiento suave (CSS).
  const servicesHref = hero.secondaryCta.href.replace(/^\/(?=#)/, '');

  return (
    <>
      <section
        aria-labelledby="hero-title"
        className="relative isolate flex flex-col overflow-hidden xl:min-h-[clamp(620px,calc(100svh-16.5rem),720px)] xl:justify-center"
      >
        <Container className="py-10 sm:py-14 xl:py-16">
          <div className="max-w-[36rem] xl:max-w-[38rem]">
            <p className="eyebrow animate-rise" style={delay(0)}>
              {hero.eyebrow}
            </p>
            <h1
              id="hero-title"
              className="mt-4 animate-rise font-serif text-[2.5rem] leading-[1.05] font-semibold tracking-tight sm:text-[3.25rem] lg:text-[3.6rem] xl:text-[4.1rem]"
              style={delay(80)}
            >
              {hero.title}
            </h1>
            <p
              className="mt-5 animate-rise text-lg leading-relaxed text-foreground/80 xl:text-[1.2rem]"
              style={delay(160)}
            >
              {hero.description}
            </p>

            <div
              className="mt-8 flex animate-rise flex-col gap-4 sm:flex-row sm:items-center sm:gap-8"
              style={delay(240)}
            >
              <CtaLink link={hero.primaryCta} location="hero" size="lg" className="px-9" />
              <a
                href={servicesHref}
                onClick={() => track('hero_services_click', { location: 'hero' })}
                className="group inline-flex min-h-11 items-center gap-2 self-start font-medium underline decoration-foreground/40 underline-offset-8 transition-colors hover:text-accent-text hover:decoration-accent active:text-accent-text sm:self-auto"
              >
                {hero.secondaryCta.label}
                <ArrowRight
                  className="size-4 transition-transform duration-300 ease-out-soft group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </a>
            </div>

            {hero.script && (
              <p
                aria-hidden="true"
                className="mt-9 w-fit animate-rise text-foreground/90"
                style={delay(320)}
              >
                <span className="block -rotate-3 font-script text-[2.15rem] leading-none whitespace-nowrap min-[375px]:text-[2.6rem] sm:text-[3rem]">
                  {hero.script}
                </span>
                {/* Trazo naranja con apariencia manuscrita */}
                <svg viewBox="0 0 260 24" className="-mt-1 ml-6 w-56 text-accent sm:w-64">
                  <path
                    d="M3 19C58 11 132 6 200 7c20 0 38 2 55 5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </p>
            )}
          </div>
        </Container>

        {/* Foto limpia: fondo completo desde 1280 px; bloque independiente debajo del texto antes. */}
        <div className="relative xl:absolute xl:inset-0 xl:-z-10">
          <picture>
            {hero.image.srcMobile && (
              <source media="(max-width: 767px)" srcSet={hero.image.srcMobile} />
            )}
            <img
              src={hero.image.src}
              alt={hero.image.alt}
              width={1672}
              height={941}
              fetchPriority="high"
              className="block aspect-[4/3] h-auto w-full object-cover object-[72%_center] sm:aspect-[16/9] xl:aspect-auto xl:h-full xl:object-[right_center]"
            />
          </picture>
          {/* Transición suave del color del tema desde la izquierda (blanca o negra), sin tapar rostros */}
          <div
            aria-hidden="true"
            className={cn(
              'absolute inset-0 hidden xl:block',
              'bg-[linear-gradient(90deg,var(--color-background)_0%,color-mix(in_oklab,var(--color-background)_85%,transparent)_24%,color-mix(in_oklab,var(--color-background)_35%,transparent)_40%,transparent_52%)]',
              // En modo oscuro la foto es muy clara: la transición negra llega un poco más lejos.
              'dark:bg-[linear-gradient(90deg,var(--color-background)_0%,var(--color-background)_30%,color-mix(in_oklab,var(--color-background)_70%,transparent)_42%,transparent_56%)]',
            )}
          />
        </div>
      </section>

      {hero.points.length > 0 && (
        <div className="border-y border-border bg-background">
          <Container>
            <ul className="flex flex-col items-center justify-center gap-3 py-5 sm:flex-row sm:gap-0 sm:divide-x sm:divide-border">
              {hero.points.map((point) => (
                <li key={point.text} className="flex items-center gap-3 text-[0.95rem] sm:px-10">
                  <ContentIcon
                    name={point.icon}
                    className="size-6 shrink-0 text-accent"
                    strokeWidth={1.6}
                  />
                  {point.text}
                </li>
              ))}
            </ul>
          </Container>
        </div>
      )}
    </>
  );
}
