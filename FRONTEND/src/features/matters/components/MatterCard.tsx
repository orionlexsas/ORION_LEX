import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import type { LandingContent } from '@orion-lex/shared';
import { ContentIcon } from '@/components/ui/ContentIcon';
import { MediaPanel } from '@/components/ui/MediaPanel';
import { cn } from '@/lib/cn';
import { track } from '@/lib/analytics';

interface MatterCardProps {
  landing: LandingContent;
  ctaLabel: string;
  /** Carga inmediata de la foto (tarjetas visibles al abrir la página). */
  priority?: boolean;
}

/**
 * Tarjeta de un servicio frecuente. Toda la tarjeta es un único enlace a su landing page
 * (`/<slug>`, el mismo slug del archivo landings/<slug>.json). Foto a la izquierda desde 1280 px
 * y arriba en pantallas menores; título, línea naranja y "Ver más →".
 * En celular (< 640 px) es una tarjeta alta tipo "historia" de Facebook: la foto la llena, el
 * nombre va encima sobre un degradado y el ícono del asunto en un círculo naranja arriba.
 */
export function MatterCard({ landing, ctaLabel, priority }: MatterCardProps) {
  return (
    <Link
      to={`/${landing.slug}`}
      onClick={() => track('service_card_click', { service: landing.slug })}
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-md border border-border bg-background shadow-[0_2px_12px_-6px_rgb(0_0_0/0.12)] transition-[translate,box-shadow,border-color] duration-200 ease-out hover:-translate-y-1 hover:border-accent/70 hover:shadow-[0_18px_36px_-20px_rgb(0_0_0/0.35)] active:translate-y-0 xl:flex-row',
        // Celular: historia vertical.
        'max-sm:relative max-sm:aspect-[9/14] max-sm:h-auto max-sm:rounded-xl max-sm:border-0',
      )}
    >
      <MediaPanel
        image={landing.image}
        icon={landing.icon}
        priority={priority}
        className="aspect-[2/1] w-full shrink-0 max-sm:absolute max-sm:inset-0 max-sm:aspect-auto max-sm:h-full xl:aspect-auto xl:min-h-[12.75rem] xl:w-[47%]"
      />
      {/* Celular: degradado para leer el nombre e ícono en círculo naranja (como las historias). */}
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_top,rgb(0_0_0/0.85),rgb(0_0_0/0.05)_60%)] sm:hidden"
      />
      <span
        aria-hidden="true"
        className="absolute top-2.5 left-2.5 grid size-9 place-items-center rounded-full bg-accent text-on-accent ring-2 ring-white/80 sm:hidden"
      >
        <ContentIcon name={landing.icon} className="size-[1.15rem]" strokeWidth={1.8} />
      </span>
      <span className="flex flex-1 flex-col justify-center px-6 py-6 max-sm:relative max-sm:justify-end max-sm:px-3 max-sm:py-3 sm:px-7">
        <span className="font-serif text-[1.45rem] leading-[1.15] font-semibold tracking-tight max-sm:text-[1.02rem] max-sm:text-white sm:text-[1.6rem] xl:text-[1.55rem]">
          {landing.title}
        </span>
        <span
          aria-hidden="true"
          className="mt-4 block h-0.5 w-9 bg-accent transition-[width] duration-200 ease-out group-hover:w-12 max-sm:mt-2 max-sm:w-6"
        />
        <span className="mt-4 inline-flex min-h-6 items-center gap-3 text-[0.95rem] font-medium text-foreground/85 max-sm:hidden">
          {ctaLabel}
          <ArrowRight
            className="size-5 text-accent transition-transform duration-200 ease-out group-hover:translate-x-1"
            aria-hidden="true"
          />
        </span>
      </span>
    </Link>
  );
}
