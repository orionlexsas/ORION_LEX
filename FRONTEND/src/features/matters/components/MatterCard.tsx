import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import type { LandingContent } from '@orion-lex/shared';
import { MediaPanel } from '@/components/ui/MediaPanel';
import { track } from '@/lib/analytics';

interface MatterCardProps {
  landing: LandingContent;
  ctaLabel: string;
}

/**
 * Tarjeta de un servicio frecuente. Toda la tarjeta es un enlace a su landing page (un solo
 * enlace por tarjeta, así los lectores de pantalla no repiten el mismo destino).
 */
export function MatterCard({ landing, ctaLabel }: MatterCardProps) {
  const href = `/${landing.slug}`;

  return (
    <Link
      to={href}
      onClick={() => track('service_card_click', { service: landing.slug })}
      className="group flex overflow-hidden rounded-lg border border-border bg-background transition-[border-color,box-shadow,translate] duration-300 ease-out-soft hover:-translate-y-0.5 hover:border-accent hover:shadow-[0_18px_40px_-24px_rgb(0_0_0/0.35)]"
    >
      <MediaPanel
        image={landing.image}
        icon={landing.icon}
        className="w-[38%] shrink-0 sm:w-[42%]"
      />
      <span className="flex min-h-36 flex-1 flex-col justify-between gap-4 p-5 sm:min-h-44 sm:p-7">
        <span className="font-serif text-xl leading-snug font-semibold sm:text-2xl">
          {landing.title}
        </span>
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-accent-text">
          {ctaLabel}
          <ArrowRight
            className="size-4 transition-transform duration-300 ease-out-soft group-hover:translate-x-1"
            aria-hidden="true"
          />
        </span>
      </span>
    </Link>
  );
}
