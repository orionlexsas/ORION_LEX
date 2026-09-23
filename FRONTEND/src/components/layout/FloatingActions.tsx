import { ArrowUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SiteContent } from '@orion-lex/shared';
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon';
import { useScrolledPast } from '@/hooks/use-scrolled-past';
import { cn } from '@/lib/cn';
import { whatsappUrl } from '@/lib/whatsapp';

interface FloatingActionsProps {
  whatsapp: SiteContent['contact']['whatsapp'];
}

/**
 * Botones fijos abajo a la derecha: WhatsApp (siempre) y "volver arriba", que aparece
 * cuando se ha bajado más de una pantalla.
 */
export function FloatingActions({ whatsapp }: FloatingActionsProps) {
  const { t } = useTranslation();
  const showBackToTop = useScrolledPast(1);

  return (
    <div className="fixed right-4 bottom-4 z-40 flex flex-col items-center gap-3 sm:right-6 sm:bottom-6">
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0 })}
        aria-label={t('a11y.backToTop')}
        title={t('a11y.backToTop')}
        aria-hidden={!showBackToTop}
        tabIndex={showBackToTop ? 0 : -1}
        className={cn(
          'grid size-12 place-items-center rounded-full border border-gold/60 bg-night/90 text-gold shadow-lg backdrop-blur-sm transition-[opacity,translate,background-color,color] duration-500 ease-out-soft hover:bg-gold hover:text-night',
          showBackToTop
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-4 opacity-0',
        )}
      >
        <ArrowUp className="size-5" aria-hidden="true" />
      </button>

      <a
        href={whatsappUrl(whatsapp.number, whatsapp.message)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${t('a11y.whatsappChat')} ${t('a11y.opensWhatsApp')}`}
        className="group relative grid size-14 place-items-center rounded-full bg-whatsapp text-white shadow-[0_10px_30px_-8px_color-mix(in_oklab,var(--color-whatsapp)_75%,transparent)] transition-transform duration-300 ease-out-soft hover:scale-110"
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-whatsapp/50 motion-safe:animate-ping [animation-duration:2.5s]"
        />
        <WhatsAppIcon className="relative size-7" />
        {/* Etiqueta que aparece al pasar el cursor */}
        <span
          aria-hidden="true"
          className="on-photo pointer-events-none absolute right-full mr-3 rounded-full bg-night px-4 py-2 text-sm font-medium whitespace-nowrap opacity-0 shadow-lg transition-all duration-300 ease-out-soft group-hover:opacity-100 group-focus-visible:opacity-100 max-sm:hidden"
        >
          {t('a11y.whatsappChat')}
        </span>
      </a>
    </div>
  );
}
