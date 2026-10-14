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
 * color de fondo del tema. En tablet primero va el texto y después la foto; en celular (< 640 px)
 * primero la foto, con la frase manuscrita encima, y debajo el texto con botones a todo el ancho.
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
        <Container className="py-8 max-sm:order-2 sm:py-14 xl:py-16">
          <div className="max-w-[36rem] xl:max-w-[38rem]">
            <p className="eyebrow animate-rise" style={delay(0)}>
              {hero.eyebrow}
            </p>
            <h1
              id="hero-title"
              className="mt-4 animate-rise font-serif text-[2.15rem] min-[375px]:text-[2.4rem] leading-[1.05] font-semibold tracking-tight sm:text-[3.25rem] lg:text-[3.6rem] xl:text-[4.1rem]"
              style={delay(80)}
            >
              {hero.title}
            </h1>
            <p
              className="mt-5 animate-rise text-[0.95rem] leading-relaxed text-foreground/80 sm:text-lg xl:text-[1.2rem]"
              style={delay(160)}
            >
              {hero.description}
            </p>

            <div
              className="mt-7 flex animate-rise flex-col gap-3 sm:flex-row sm:items-center sm:gap-8"
              style={delay(240)}
            >
              <CtaLink
                link={hero.primaryCta}
                location="hero"
                size="lg"
                className="px-9 max-sm:min-h-12 max-sm:w-full max-sm:text-base"
              />
              <a
                href={servicesHref}
                onClick={() => track('hero_services_click', { location: 'hero' })}
                className={cn(
                  'group inline-flex min-h-11 items-center gap-2 self-start font-medium underline decoration-foreground/40 underline-offset-8 transition-colors hover:text-accent-text hover:decoration-accent active:text-accent-text sm:self-auto',
                  // En celular: botón con borde a todo el ancho.
                  'max-sm:min-h-12 max-sm:w-full max-sm:justify-center max-sm:rounded-md max-sm:border max-sm:border-foreground/80 max-sm:no-underline',
                )}
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
                className="mt-9 w-fit animate-rise text-foreground/90 max-sm:hidden"
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
        <div className="relative max-sm:order-1 xl:absolute xl:inset-0 xl:-z-10">
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
              className="block aspect-[5/4] h-auto w-full object-cover object-[74%_center] sm:aspect-[16/9] xl:aspect-auto xl:h-full xl:object-[right_center]"
            />
          </picture>
          {/* Celular: la frase manuscrita va sobre la foto, arriba a la izquierda (zona clara, sin rostros). */}
          {hero.script && (
            <p
              aria-hidden="true"
              className="absolute top-[12%] left-5 w-[10.5rem] animate-rise text-ink min-[400px]:w-[12rem] sm:hidden"
              style={delay(200)}
            >
              <span className="block -rotate-6 font-script text-[1.85rem] leading-[0.85] min-[400px]:text-[2.1rem]">
                {hero.script}
              </span>
              <svg viewBox="0 0 260 24" className="mt-1.5 w-[85%] text-accent">
                <path
                  d="M3 19C58 11 132 6 200 7c20 0 38 2 55 5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </p>
          )}
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
            <ul className="flex items-center justify-center divide-x divide-border py-5">
              {hero.points.map((point) => (
                <li
                  key={point.text}
                  className="flex flex-auto items-center justify-center gap-2 px-2 text-[0.8rem] leading-snug min-[400px]:gap-2.5 min-[400px]:text-sm sm:flex-none sm:gap-3 sm:px-10 sm:text-[0.95rem]"
                >
                  <ContentIcon
                    name={point.icon}
                    className="size-7 shrink-0 text-accent min-[400px]:size-8 sm:size-6"
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
