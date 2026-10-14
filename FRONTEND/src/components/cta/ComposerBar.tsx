import { useTranslation } from 'react-i18next';
import { useContent } from '@/content';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/cn';
import { whatsappUrl } from '@/lib/whatsapp';
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon';

interface ComposerBarProps {
  /** Dónde está la barra; se envía con el evento de analítica. */
  location: string;
  className?: string;
}

/**
 * Barra al estilo "¿Qué estás pensando?" de Facebook: el escudo de Orión Lex, un campo redondeado
 * que invita a contar el caso y el logo de WhatsApp. Toda la barra abre el chat.
 */
export function ComposerBar({ location, className }: ComposerBarProps) {
  const { t } = useTranslation();
  const { site } = useContent();
  const { number, message } = site.contact.whatsapp;
  const label = t('composer.placeholder');

  return (
    <a
      href={whatsappUrl(number, message)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track('whatsapp_click', { location, label })}
      aria-label={`${label} ${t('a11y.opensWhatsApp')}`}
      className={cn(
        'group flex items-center gap-3 rounded-2xl border border-border bg-background p-2.5 shadow-[0_2px_10px_-6px_rgb(0_0_0/0.2)] transition-colors active:bg-surface',
        className,
      )}
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-full border border-border bg-background">
        <img
          src="/brand/escudo.webp"
          alt=""
          width={253}
          height={192}
          className="h-6 w-auto dark:hidden"
        />
        <img
          src="/brand/escudo-blanco.webp"
          alt=""
          width={253}
          height={192}
          className="hidden h-6 w-auto dark:block"
        />
      </span>
      <span className="min-w-0 flex-1 truncate rounded-full bg-surface px-4 py-3 text-[0.95rem] text-muted group-hover:text-foreground">
        {label}
      </span>
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-whatsapp text-white">
        <WhatsAppIcon className="size-5" />
      </span>
    </a>
  );
}
