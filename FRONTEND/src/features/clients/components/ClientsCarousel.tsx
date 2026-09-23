import { useRef, useState, type FocusEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import type { ClientsContent } from '@orion-lex/shared';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { cn } from '@/lib/cn';
import { circularOffset, useCarousel } from '../hooks/use-carousel';
import { ClientCard } from './ClientCard';

interface ClientsCarouselProps {
  items: ClientsContent['items'];
  intervalMs: number;
}

/** Distancia mínima (px) de un deslizamiento con el dedo para cambiar de tarjeta. */
const SWIPE_THRESHOLD = 40;

const arrowClass =
  'absolute top-1/2 z-30 grid size-11 -translate-y-1/2 place-items-center rounded-full border-2 border-gold bg-night text-gold shadow-lg transition-colors duration-300 hover:bg-gold hover:text-night lg:size-12';

/**
 * Carrusel en 3D: avanza solo cada `intervalMs`, se pausa al pasar el mouse o enfocar con el
 * teclado, tiene flechas, puntos, botón de pausa y se puede deslizar con el dedo.
 * Si el usuario prefiere menos movimiento, no avanza solo.
 */
export function ClientsCarousel({ items, intervalMs }: ClientsCarouselProps) {
  const { t } = useTranslation();
  const reducedMotion = usePrefersReducedMotion();
  const [userPaused, setUserPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const autoplay = !userPaused && !interacting && !reducedMotion;
  const { active, goTo, next, previous } = useCarousel({
    count: items.length,
    intervalMs,
    autoplay,
  });
  const swipeStartX = useRef<number | null>(null);
  const didSwipe = useRef(false);

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false);
  };

  return (
    <div
      role="region"
      aria-roledescription="carrusel"
      aria-label={t('carousel.label')}
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => setInteracting(false)}
      onFocus={() => setInteracting(true)}
      onBlur={handleBlur}
    >
      <div className="relative">
        <div
          aria-live={autoplay ? 'off' : 'polite'}
          className="relative aspect-[165/100] touch-pan-y select-none [perspective:1600px] sm:aspect-[21/10] lg:aspect-[27/10]"
          onPointerDown={(e) => {
            swipeStartX.current = e.clientX;
            didSwipe.current = false;
          }}
          onPointerUp={(e) => {
            if (swipeStartX.current === null) return;
            const dx = e.clientX - swipeStartX.current;
            swipeStartX.current = null;
            if (Math.abs(dx) < SWIPE_THRESHOLD) return;
            didSwipe.current = true;
            (dx < 0 ? next : previous)();
          }}
          onPointerCancel={() => (swipeStartX.current = null)}
          // Tras deslizar, el navegador lanza un clic sobre la tarjeta donde se soltó el dedo;
          // esa tarjeta ya pasó a un lado y el clic la devolvería al centro, así que se ignora.
          onClickCapture={(e) => {
            if (!didSwipe.current) return;
            didSwipe.current = false;
            e.stopPropagation();
          }}
        >
          {items.map((item, i) => (
            <ClientCard
              key={item.tag}
              item={item}
              offset={circularOffset(i, active, items.length)}
              label={t('carousel.slide', { current: i + 1, total: items.length })}
              onSelect={() => goTo(i)}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={previous}
          aria-label={t('carousel.previous')}
          className={cn(arrowClass, 'left-0 lg:left-[-9%]')}
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label={t('carousel.next')}
          className={cn(arrowClass, 'right-0 lg:right-[-9%]')}
        >
          <ChevronRight className="size-5" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-8 flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          {items.map((item, i) => (
            <button
              key={item.tag}
              type="button"
              onClick={() => goTo(i)}
              aria-label={t('carousel.goTo', { number: i + 1 })}
              aria-current={i === active}
              className="grid h-6 place-items-center px-0.5"
            >
              <span
                className={cn(
                  'block h-1.5 rounded-full transition-all duration-500 ease-out-soft',
                  i === active ? 'w-8 bg-gold' : 'w-4 bg-gold/30 hover:bg-gold/60',
                )}
              />
            </button>
          ))}
        </div>
        {!reducedMotion && (
          <button
            type="button"
            onClick={() => setUserPaused((p) => !p)}
            aria-label={userPaused ? t('carousel.play') : t('carousel.pause')}
            className="grid size-8 place-items-center rounded-full border border-gold/50 text-gold transition-colors hover:bg-gold/10"
          >
            {userPaused ? (
              <Play className="size-3.5 fill-current" aria-hidden="true" />
            ) : (
              <Pause className="size-3.5 fill-current" aria-hidden="true" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
