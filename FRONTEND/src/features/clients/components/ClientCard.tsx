import type { CSSProperties } from 'react';
import type { ClientsContent } from '@orion-lex/shared';
import { useThemedImage } from '@/hooks/use-themed-image';
import { cn } from '@/lib/cn';

interface ClientCardProps {
  item: ClientsContent['items'][number];
  /** Posición respecto a la tarjeta activa: 0 centro, ±1 a los lados, más lejos = oculta. */
  offset: number;
  label: string;
  onSelect: () => void;
}

/** Transformación 3D según la posición: la del centro al frente, las laterales giradas hacia él. */
function positionStyle(offset: number): CSSProperties {
  const distance = Math.abs(offset);
  if (distance > 1) {
    return {
      transform: `translateX(calc(-50% + ${Math.sign(offset) * 120}%)) scale(0.6)`,
      opacity: 0,
      zIndex: 0,
    };
  }
  return {
    transform: `translateX(calc(-50% + ${offset * 88}%)) scale(${distance ? 0.9 : 1}) rotateY(${offset * -38}deg)`,
    opacity: 1,
    zIndex: distance ? 10 : 20,
    filter: distance ? 'brightness(0.85)' : undefined,
  };
}

export function ClientCard({ item, offset, label, onSelect }: ClientCardProps) {
  const photo = useThemedImage(item.image);
  const isActive = offset === 0;
  const isVisible = Math.abs(offset) <= 1;

  return (
    <div
      role="group"
      aria-roledescription="diapositiva"
      aria-label={label}
      aria-hidden={!isActive}
      onClick={isActive || !isVisible ? undefined : onSelect}
      style={positionStyle(offset)}
      className={cn(
        'absolute top-0 left-1/2 h-full w-[74%] transition-[transform,opacity,filter] duration-[450ms] ease-out-soft will-change-transform sm:w-[58%] lg:w-[45%]',
        !isActive && isVisible && 'cursor-pointer',
        !isVisible && 'pointer-events-none',
      )}
    >
      <div
        className={cn(
          'on-photo relative size-full overflow-hidden rounded-2xl border bg-night shadow-[0_30px_60px_-30px_rgb(0_0_0/0.6)]',
          isActive ? 'border-gold/80' : 'border-gold/40',
        )}
      >
        <img
          src={photo.src}
          alt={photo.alt}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/15 to-transparent" />

        <span className="absolute top-4 left-4 rounded-full border border-gold/70 bg-night/60 px-3 py-1 text-[0.65rem] font-semibold tracking-[0.15em] text-gold uppercase backdrop-blur-sm lg:top-5 lg:left-5">
          {item.tag}
        </span>

        <div className="absolute inset-x-5 bottom-5 lg:inset-x-7 lg:bottom-7">
          <span aria-hidden="true" className="block h-px w-8 bg-gold" />
          <p className="mt-3 max-w-[16rem] font-serif text-xl leading-snug text-balance lg:text-[1.6rem]">
            {item.caption}
          </p>
        </div>
      </div>
    </div>
  );
}
