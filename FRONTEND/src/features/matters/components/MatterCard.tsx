import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import type { LandingContent } from '@orion-lex/shared';
import { MediaPanel } from '@/components/ui/MediaPanel';
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
 */
export function MatterCard({ landing, ctaLabel, priority }: MatterCardProps) {
  return (
    <Link
      to={`/${landing.slug}`}
      onClick={() => track('service_card_click', { service: landing.slug })}
      className="group flex h-full flex-col overflow-hidden rounded-md border border-border bg-background shadow-[0_2px_12px_-6px_rgb(0_0_0/0.12)] transition-[translate,box-shadow,border-color] duration-200 ease-out hover:-translate-y-1 hover:border-accent/70 hover:shadow-[0_18px_36px_-20px_rgb(0_0_0/0.35)] active:translate-y-0 xl:flex-row"
    >
      <MediaPanel
        image={landing.image}
        icon={landing.icon}
        priority={priority}
        className="aspect-[2/1] w-full shrink-0 xl:aspect-auto xl:min-h-[12.75rem] xl:w-[47%]"
      />
      <span className="flex flex-1 flex-col justify-center px-6 py-6 sm:px-7">
        <span className="font-serif text-[1.45rem] leading-[1.15] font-semibold tracking-tight sm:text-[1.6rem] xl:text-[1.55rem]">
          {landing.title}
        </span>
        <span
          aria-hidden="true"
          className="mt-4 block h-0.5 w-9 bg-accent transition-[width] duration-200 ease-out group-hover:w-12"
        />
        <span className="mt-4 inline-flex min-h-6 items-center gap-3 text-[0.95rem] font-medium text-foreground/85">
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
