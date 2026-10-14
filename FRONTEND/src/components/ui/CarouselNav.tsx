import { useTranslation } from 'react-i18next';
import { ChevronsRight } from 'lucide-react';
import type { CarouselNavState } from '@/hooks/use-carousel';
import { cn } from '@/lib/cn';

interface CarouselNavProps extends CarouselNavState {
  className?: string;
}

/** Puntos y aviso "Desliza para ver más" bajo el carrusel (solo en celular). */
export function CarouselNav({ active, count, touched, goTo, className }: CarouselNavProps) {
  const { t } = useTranslation();
  if (count < 2) return null;

  return (
    <div className={cn('mt-3 flex items-center gap-4 sm:hidden', className)}>
      <div className="flex items-center" role="group" aria-label={t('carousel.label')}>
        {Array.from({ length: count }, (_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => goTo(index)}
            aria-label={t('carousel.goTo', { number: index + 1, total: count })}
            aria-current={index === active}
            // Área táctil de 24 × 28 px con un punto pequeño dentro.
            className="grid h-7 min-w-6 cursor-pointer place-items-center"
          >
            <span
              className={cn(
                'block h-2 rounded-full transition-all duration-300',
                index === active ? 'w-6 bg-accent' : 'w-2 bg-foreground/25',
              )}
            />
          </button>
        ))}
      </div>
      <p
        aria-hidden="true"
        className={cn(
          'flex items-center gap-1 text-xs font-medium text-muted transition-opacity duration-500',
          touched && 'opacity-0',
        )}
      >
        {t('carousel.hint')}
        <ChevronsRight className="size-4 animate-[nudge_1.4s_ease-in-out_infinite] text-accent" />
      </p>
    </div>
  );
}
