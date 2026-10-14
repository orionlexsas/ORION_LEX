import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';
import type { CarouselNavState } from '@/hooks/use-carousel';
import { cn } from '@/lib/cn';

interface CarouselNavProps extends CarouselNavState {
  className?: string;
}

/**
 * Controles bajo un carrusel del celular (mismo estilo que la vitrina de Servicios): flechas
 * redondas juntas a la izquierda (a la derecha las taparía el botón flotante de WhatsApp), una
 * línea con un punto por tarjeta (la actual, en naranja y con su número) y el aviso
 * "Desliza para ver más" hasta que la persona desliza.
 */
export function CarouselNav({ active, count, touched, goTo, className }: CarouselNavProps) {
  const { t } = useTranslation();
  if (count < 2) return null;

  const arrow =
    'grid size-10 shrink-0 cursor-pointer place-items-center rounded-full border border-foreground/20 bg-foreground/5 transition-[background-color,scale,opacity] hover:bg-foreground/10 active:scale-95 disabled:pointer-events-none disabled:opacity-35';

  return (
    <div className={cn('mt-4 sm:hidden', className)}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => goTo(active - 1)}
          disabled={active === 0}
          aria-label={t('carousel.previous')}
          className={arrow}
        >
          <ChevronLeft aria-hidden="true" className="size-5" />
        </button>

        <button
          type="button"
          onClick={() => goTo(active + 1)}
          disabled={active === count - 1}
          aria-label={t('carousel.next')}
          className={arrow}
        >
          <ChevronRight aria-hidden="true" className="size-5" />
        </button>

        {/* Línea con un punto por tarjeta; el activo crece y muestra su número. */}
        <div
          role="group"
          aria-label={t('carousel.label')}
          className="relative ml-1 flex flex-1 items-center justify-between before:absolute before:inset-x-3 before:top-1/2 before:h-px before:bg-foreground/20"
        >
          {Array.from({ length: count }, (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goTo(index)}
              aria-label={t('carousel.goTo', { number: index + 1, total: count })}
              aria-current={index === active}
              className="relative grid size-7 cursor-pointer place-items-center"
            >
              <span
                className={cn(
                  'grid size-6 place-items-center rounded-full text-[0.68rem] font-bold transition-[scale,background-color] duration-300',
                  index === active
                    ? 'scale-100 bg-accent text-on-accent'
                    : 'scale-[0.38] bg-foreground/45 text-transparent',
                )}
              >
                {index + 1}
              </span>
            </button>
          ))}
        </div>
      </div>
      <p
        aria-hidden="true"
        className={cn(
          'mt-2 flex items-center justify-center gap-1 text-[0.7rem] font-medium tracking-[0.12em] text-muted uppercase transition-opacity duration-500',
          touched && 'opacity-0',
        )}
      >
        {t('carousel.hint')}
        <ChevronsRight className="size-3.5 animate-[nudge_1.4s_ease-in-out_infinite] text-accent" />
      </p>
    </div>
  );
}
