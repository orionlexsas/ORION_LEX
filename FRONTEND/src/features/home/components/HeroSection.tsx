import type { CSSProperties } from 'react';
import { ArrowRight } from 'lucide-react';
import type { HomeContent } from '@orion-lex/shared';
import { CtaLink } from '@/components/cta/CtaLink';
import { ContentIcon } from '@/components/ui/ContentIcon';
import { Container } from '@/components/ui/Container';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/cn';
import { SLIDE_MS, useSlideshow } from '../hooks/use-slideshow';
import { PenStroke } from './PenStroke';

/** Retraso escalonado para la animación de entrada (`animate-rise`). */
const delay = (ms: number) => ({ '--delay': `${ms}ms` }) as CSSProperties;

interface HeroSectionProps {
  hero: HomeContent['hero'];
}

/**
 * Portada. Desde 1280 px la foto del equipo ocupa todo el fondo, anclada a la derecha, y el texto
 * va en el lado libre de la izquierda (nunca sobre los rostros), con una transición suave del
 * color de fondo del tema. En tablet primero va el texto y después la foto. En celular (< 640 px)
 * la foto llena la sección con un velo café oscuro y el texto va en blanco encima, a la izquierda,
 * con las frases de confianza, los botones y la frase manuscrita (maqueta del usuario).
 * Termina con una franja de confianza; debajo asoma "Asuntos que atendemos con frecuencia".
 */
export function HeroSection({ hero }: HeroSectionProps) {
  // "/#asuntos" → "#asuntos": ancla en la misma página, con desplazamiento suave (CSS).
  const servicesHref = hero.secondaryCta.href.replace(/^\/(?=#)/, '');
  // Fotos de fondo: la principal (el equipo) y luego las demás, pasando solas.
  const slides = hero.slides ?? [];
  const activeSlide = useSlideshow(slides.length + 1);

  return (
    <>
      <section
        aria-labelledby="hero-title"
        className="relative isolate flex flex-col overflow-hidden max-sm:min-h-[39rem] xl:min-h-[clamp(620px,calc(100svh-16.5rem),720px)] xl:justify-center"
      >
        <Container className="py-8 max-sm:on-dark max-sm:[&_:is(h1,p,li)]:[text-shadow:0_1px_14px_rgb(0_0_0/0.55)] max-sm:pt-11 max-sm:pb-10 sm:py-14 xl:py-16">
          <div className="max-w-[36rem] max-sm:max-w-none xl:max-w-[38rem]">
            <p
              className="eyebrow animate-rise max-sm:text-[0.66rem] max-sm:tracking-[0.18em]"
              style={delay(0)}
            >
              {hero.eyebrow}
            </p>
            {/* Celular: raya naranja corta bajo el antetítulo */}
            <span
              aria-hidden="true"
              className="mt-4 block h-[3px] w-11 animate-rise rounded-full bg-accent sm:hidden"
              style={delay(40)}
            />
            <div className="max-sm:w-[66%] max-sm:min-w-[14rem]">
              <h1
                id="hero-title"
                className="mt-4 animate-rise font-serif text-[2.3rem] leading-[1.02] font-semibold tracking-tight min-[375px]:text-[2.55rem] sm:text-[3.25rem] sm:leading-[1.05] lg:text-[3.6rem] xl:text-[4.1rem]"
                style={delay(80)}
              >
                {hero.title}
              </h1>
              <p
                className="mt-5 animate-rise text-[0.95rem] leading-relaxed text-foreground/80 max-sm:max-w-[calc(56vw-1.25rem)] max-sm:min-w-[11rem] max-sm:leading-snug max-sm:text-foreground/90 sm:text-lg xl:text-[1.2rem]"
                style={delay(160)}
              >
                {hero.mobileDescription ? (
                  <>
                    <span className="sm:hidden">{hero.mobileDescription}</span>
                    <span className="max-sm:hidden">{hero.description}</span>
                  </>
                ) : (
                  hero.description
                )}
              </p>

              {/*
                Celular: las frases de confianza van aquí (en pantallas grandes, en la franja de abajo).
                Igual que la descripción, terminan antes de la cara de la abogada (≈ 56 % del ancho).
              */}
              {hero.points.length > 0 && (
                <ul
                  className="mt-6 animate-rise space-y-3.5 max-sm:max-w-[calc(56vw-1.25rem)] max-sm:min-w-[11rem] sm:hidden"
                  style={delay(200)}
                >
                  {hero.points.map((point) => (
                    <li
                      key={point.text}
                      className="flex items-center gap-3 text-[0.9rem] leading-snug"
                    >
                      <ContentIcon
                        name={point.icon}
                        className="size-7 shrink-0 text-accent"
                        strokeWidth={1.6}
                      />
                      {point.text}
                    </li>
                  ))}
                </ul>
              )}

              <div
                className="mt-7 flex animate-rise flex-col gap-3 sm:flex-row sm:items-center sm:gap-8"
                style={delay(240)}
              >
                <CtaLink
                  link={hero.primaryCta}
                  location="hero"
                  size="lg"
                  trailingIcon={<ArrowRight className="size-4 sm:hidden" aria-hidden="true" />}
                  className="px-9 max-sm:min-h-12 max-sm:w-full max-sm:gap-2 max-sm:px-3 max-sm:whitespace-nowrap max-sm:text-[0.92rem]"
                />
                <a
                  href={servicesHref}
                  onClick={() => track('hero_services_click', { location: 'hero' })}
                  className={cn(
                    'group inline-flex min-h-11 items-center gap-2 self-start font-medium underline decoration-foreground/40 underline-offset-8 transition-colors hover:text-accent-text hover:decoration-accent active:text-accent-text sm:self-auto',
                    // En celular: botón con borde blanco a todo el ancho de la columna.
                    'max-sm:min-h-12 max-sm:w-full max-sm:justify-center max-sm:rounded-md max-sm:border max-sm:border-foreground/80 max-sm:no-underline max-sm:active:bg-foreground/10',
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
                  className="mt-9 w-fit animate-rise text-foreground/90 max-sm:mt-10 max-sm:-ml-1"
                  style={delay(320)}
                >
                  <span className="block -rotate-3 font-script text-[2.15rem] leading-none whitespace-nowrap min-[375px]:text-[2.45rem] sm:text-[3rem]">
                    {hero.script}
                  </span>
                  {/* Trazo naranja con apariencia manuscrita */}
                  <svg viewBox="0 0 260 24" className="-mt-1 ml-6 w-48 text-accent sm:w-64">
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
          </div>
        </Container>

        {/*
          Foto limpia: fondo completo desde 1280 px; bloque independiente debajo del texto en tablet.
          En celular es el fondo de toda la sección (foto vertical, `srcMobile`), con un velo café
          oscuro para que el texto blanco se lea.
        */}
        <div className="relative overflow-hidden max-sm:absolute max-sm:inset-0 max-sm:-z-10 max-sm:bg-hero-shade xl:absolute xl:inset-0 xl:-z-10">
          <picture>
            {hero.image.srcMobile && (
              <source media="(max-width: 639px)" srcSet={hero.image.srcMobile} />
            )}
            <img
              src={hero.image.src}
              alt={hero.image.alt}
              width={1672}
              height={941}
              fetchPriority="high"
              className={cn(
                'block aspect-[5/4] h-auto w-full object-cover object-[74%_center] sm:aspect-[16/9] xl:aspect-auto xl:h-full xl:object-[right_center]',
                // Celular: foto vertical que llena la sección; los rostros quedan a la derecha.
                'max-sm:absolute max-sm:inset-0 max-sm:size-full max-sm:aspect-auto max-sm:object-cover max-sm:object-[50%_35%]',
              )}
            />
          </picture>
          {/* Más fotos de fondo: aparecen encima de la principal con un fundido y un zoom lento */}
          {slides.map((slide, i) => {
            const shown = activeSlide === i + 1;
            return (
              <img
                key={slide.src}
                src={slide.src}
                alt={shown ? slide.alt : ''}
                aria-hidden={!shown}
                loading="lazy"
                decoding="async"
                style={{ transitionDuration: `1500ms, ${SLIDE_MS + 1500}ms` }}
                className={cn(
                  'absolute inset-0 size-full object-cover transition-[opacity,scale] ease-out-soft',
                  shown ? 'scale-100 opacity-100' : 'scale-110 opacity-0',
                )}
              />
            );
          })}
          {/* Celular: velo café solo en la izquierda (donde va el texto); el equipo queda con su color */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-hero-shade)_30%,transparent)_0%,transparent_22%,transparent_78%,color-mix(in_oklab,var(--color-hero-shade)_40%,transparent)_100%),linear-gradient(90deg,color-mix(in_oklab,var(--color-hero-shade)_78%,transparent)_0%,color-mix(in_oklab,var(--color-hero-shade)_50%,transparent)_35%,transparent_62%)] sm:hidden"
          />
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
        // Encima del hero (z-10) para que el bolígrafo 3D pueda sobresalir hacia arriba. En celular
        // las frases ya van en la portada: queda una franja crema delgada para la línea; el bolígrafo
        // sobresale encima del final de la foto.
        <div className="relative z-10 border-y border-border bg-background max-sm:h-6 max-sm:border-y-0 max-sm:bg-band">
          <Container className="max-sm:hidden">
            <ul className="flex items-center justify-center divide-x divide-border py-5">
              {hero.points.map((point) => (
                <li
                  key={point.text}
                  className="flex flex-none items-center justify-center gap-3 px-10 text-[0.95rem] leading-snug"
                >
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
          <PenStroke />
        </div>
      )}
    </>
  );
}
