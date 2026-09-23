import { useState } from 'react';
import type { LocationsContent } from '@orion-lex/shared';
import { useInView } from '@/hooks/use-in-view';
import { useThemedImage } from '@/hooks/use-themed-image';
import { cn } from '@/lib/cn';

interface LocationsMapProps {
  map: LocationsContent['map'];
  cities: LocationsContent['cities'];
}

/**
 * Mapa de Colombia con las ciudades. Al entrar en pantalla, las líneas se dibujan y los
 * marcadores aparecen uno a uno. Al pasar el cursor (o enfocar con teclado) por un marcador
 * o su etiqueta, la ciudad se ilumina y muestra su detalle.
 */
export function LocationsMap({ map, cities }: LocationsMapProps) {
  const image = useThemedImage(map);
  const [ref, inView] = useInView<HTMLDivElement>(0.35);
  const [activeCity, setActiveCity] = useState<string | null>(null);

  return (
    // En móvil el mapa es más angosto para que las etiquetas laterales quepan en pantalla.
    <div ref={ref} className="relative mx-auto w-[74%] max-w-[38rem] sm:w-full">
      {/* Marco dorado y círculos concéntricos detrás del mapa */}
      <div
        aria-hidden="true"
        className="absolute inset-[4%_-5%_6%_-5%] border border-gold/50 sm:inset-[4%_-8%_6%_-8%]"
      />
      <svg aria-hidden="true" viewBox="0 0 100 100" className="absolute inset-0 size-full">
        {[46, 38, 30].map((r) => (
          <circle
            key={r}
            cx="50"
            cy="52"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.15"
            className="text-gold/40"
          />
        ))}
      </svg>

      <div className="relative aspect-square">
        <img
          src={image.src}
          alt={image.alt}
          loading="lazy"
          decoding="async"
          className={cn(
            'size-full object-contain drop-shadow-[0_20px_40px_rgb(0_0_0/0.18)] transition-[opacity,transform] duration-1000 ease-out-soft',
            inView ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
          )}
        />

        {/* Líneas de marcador a etiqueta: se "dibujan" al entrar en pantalla */}
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          className="absolute inset-0 size-full overflow-visible"
        >
          {cities.map((city, i) => {
            const active = activeCity === city.name;
            return (
              <line
                key={city.name}
                x1={city.marker.x}
                y1={city.marker.y}
                x2={city.label.x}
                y2={city.label.y}
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={inView ? 0 : 1}
                stroke="currentColor"
                strokeWidth={active ? 0.4 : 0.22}
                className={cn(
                  'text-gold transition-[stroke-dashoffset,stroke-width,opacity] duration-1000 ease-out-soft',
                  active ? 'opacity-100' : 'opacity-75',
                )}
                style={{ transitionDelay: inView ? `${400 + i * 250}ms, 0ms, 0ms` : undefined }}
              />
            );
          })}
        </svg>

        {cities.map((city, i) => {
          const active = activeCity === city.name;
          const detailId = `city-${i}-detail`;
          const activate = () => setActiveCity(city.name);
          const deactivate = () => setActiveCity((c) => (c === city.name ? null : c));

          return (
            <div key={city.name}>
              {/* Marcador */}
              <button
                type="button"
                aria-label={city.name}
                aria-describedby={detailId}
                onMouseEnter={activate}
                onMouseLeave={deactivate}
                onFocus={activate}
                onBlur={deactivate}
                className={cn(
                  'absolute grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center transition-[scale,opacity] duration-700 ease-out-soft',
                  inView ? 'scale-100 opacity-100' : 'scale-0 opacity-0',
                )}
                style={{
                  left: `${city.marker.x}%`,
                  top: `${city.marker.y}%`,
                  transitionDelay: inView ? `${200 + i * 250}ms` : undefined,
                }}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute size-8 rounded-full bg-beacon/45 motion-safe:animate-ping',
                    active ? '[animation-duration:1s]' : '[animation-duration:2.6s]',
                  )}
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    'relative size-4 rounded-full border-[3px] border-white/85 bg-beacon transition-all duration-500 ease-out-soft',
                    active
                      ? 'scale-150 shadow-[0_0_0_6px_color-mix(in_oklab,var(--color-beacon)_35%,transparent),0_0_30px_12px_color-mix(in_oklab,var(--color-beacon)_80%,transparent)]'
                      : 'shadow-[0_0_0_4px_color-mix(in_oklab,var(--color-beacon)_25%,transparent),0_0_16px_5px_color-mix(in_oklab,var(--color-beacon)_60%,transparent)]',
                  )}
                />
              </button>

              {/* Etiqueta (también ilumina la ciudad al pasar el cursor) */}
              <div
                aria-hidden="true"
                onMouseEnter={activate}
                onMouseLeave={deactivate}
                className={cn(
                  'absolute transition-[opacity,translate] duration-700 ease-out-soft',
                  city.label.side === 'left' ? '-translate-x-full text-right' : 'text-left',
                  '-translate-y-full',
                  inView ? 'opacity-100' : 'opacity-0',
                )}
                style={{
                  left: `${city.label.x}%`,
                  top: `${city.label.y}%`,
                  transitionDelay: inView ? `${900 + i * 250}ms` : undefined,
                }}
              >
                <span
                  className={cn(
                    'block cursor-default border-b pb-1 font-serif text-sm font-bold whitespace-nowrap transition-colors duration-300 sm:text-xl',
                    active ? 'border-gold text-gold' : 'border-gold/60 text-foreground',
                  )}
                >
                  {city.name}
                </span>
              </div>
              <p
                id={detailId}
                className={cn(
                  'pointer-events-none absolute w-max max-w-[7rem] pt-2 text-xs text-foreground/75 transition-all duration-300 sm:max-w-none sm:text-sm',
                  city.label.side === 'left' ? '-translate-x-full text-right' : 'text-left',
                  active ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0',
                )}
                style={{ left: `${city.label.x}%`, top: `${city.label.y}%` }}
              >
                {city.detail}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
