import { ArrowUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SiteContent } from '@orion-lex/shared';
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon';
import { useAnyVisible } from '@/hooks/use-any-visible';
import { useScrolledPast } from '@/hooks/use-scrolled-past';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/cn';
import { whatsappUrl } from '@/lib/whatsapp';

interface FloatingActionsProps {
  whatsapp: SiteContent['contact']['whatsapp'];
}

/** Llamados a WhatsApp del contenido y del pie (no los de la cabecera, siempre visibles). */
const PAGE_WHATSAPP_CTAS = 'main [data-whatsapp-cta], footer [data-whatsapp-cta]';

/**
 * Botones fijos abajo a la derecha: WhatsApp (incluso sobre el video de intro) y "volver arriba",
 * que aparece cuando se ha bajado más de una pantalla. El de WhatsApp se aparta mientras hay otro
 * botón de WhatsApp en pantalla, para no tapar llamados importantes en el celular.
 */
export function FloatingActions({ whatsapp }: FloatingActionsProps) {
  const { t } = useTranslation();
  const showBackToTop = useScrolledPast(1);
  const hideWhatsApp = useAnyVisible(PAGE_WHATSAPP_CTAS);

  return (
    <div className="fixed right-4 bottom-4 z-[110] flex flex-col items-center gap-3 sm:right-6 sm:bottom-6">
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0 })}
        aria-label={t('a11y.backToTop')}
        title={t('a11y.backToTop')}
        aria-hidden={!showBackToTop}
        tabIndex={showBackToTop ? 0 : -1}
        className={cn(
          'grid size-11 place-items-center rounded-full border border-border bg-background text-foreground shadow-md transition-[opacity,translate,border-color] duration-500 ease-out-soft hover:border-accent',
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
        onClick={() => track('whatsapp_click', { location: 'floating_button' })}
        aria-label={`${t('a11y.whatsappChat')} ${t('a11y.opensWhatsApp')}`}
        aria-hidden={hideWhatsApp || undefined}
        tabIndex={hideWhatsApp ? -1 : undefined}
        className={cn(
          'group relative grid size-14 place-items-center rounded-full bg-whatsapp text-white shadow-[0_8px_24px_-6px_rgb(0_0_0/0.35)] transition-[opacity,translate,scale] duration-300 ease-out-soft hover:scale-105',
          hideWhatsApp && 'pointer-events-none translate-y-4 opacity-0',
        )}
      >
        <WhatsAppIcon className="size-7" />
        {/* Etiqueta que aparece al pasar el cursor (solo escritorio) */}
        <span
          aria-hidden="true"
          className="on-dark pointer-events-none absolute right-full mr-3 rounded-full bg-ink px-4 py-2 text-sm font-medium whitespace-nowrap opacity-0 shadow-lg transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 max-sm:hidden"
        >
          {t('a11y.whatsappChat')}
        </span>
      </a>
    </div>
  );
}
