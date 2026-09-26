import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import type { ContentLink } from '@orion-lex/shared';
import { useContent } from '@/content';
import { track, type AnalyticsEvent } from '@/lib/analytics';
import { cn } from '@/lib/cn';
import { WHATSAPP_HREF, whatsappUrl } from '@/lib/whatsapp';
import { buttonStyles, type ButtonStyleOptions } from '@/components/ui/button-styles';
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon';

interface CtaLinkProps extends ButtonStyleOptions {
  link: ContentLink;
  /** Dónde está el botón (p. ej. "hero", "footer"); se envía con los eventos de analítica. */
  location: string;
  /** Eventos extra al pulsar (p. ej. el `leadEvent` de una landing y `landing_cta_click`). */
  events?: AnalyticsEvent[];
  /** Ícono antes del texto; si el enlace es de WhatsApp se usa su logo. */
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  /** Sin el logo de WhatsApp aunque el enlace lo sea. */
  hideWhatsAppIcon?: boolean;
  className?: string;
  onClick?: () => void;
}

/**
 * Botón de llamada a la acción del contenido. Si `href` es "whatsapp" abre el chat
 * (en otra pestaña) con el mensaje del enlace; si no, navega dentro del sitio.
 */
export function CtaLink({
  link,
  location,
  events = [],
  leadingIcon,
  trailingIcon,
  hideWhatsAppIcon,
  variant,
  size,
  className,
  onClick,
}: CtaLinkProps) {
  const { t } = useTranslation();
  const { site } = useContent();
  const classes = cn(buttonStyles({ variant, size }), className);

  if (link.href === WHATSAPP_HREF) {
    const { number, message } = site.contact.whatsapp;
    const handleClick = () => {
      track('whatsapp_click', { location, label: link.label });
      events.forEach((event) => track(event, { location }));
      onClick?.();
    };
    return (
      <a
        href={whatsappUrl(number, link.message ?? message)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        aria-label={`${link.label} ${t('a11y.opensWhatsApp')}`}
        className={classes}
        // El botón flotante de WhatsApp se oculta mientras este llamado está en pantalla.
        data-whatsapp-cta=""
      >
        {!hideWhatsAppIcon && <WhatsAppIcon className="size-5 shrink-0" />}
        {link.label}
        <span className="sr-only"> {t('a11y.opensWhatsApp')}</span>
        {trailingIcon}
      </a>
    );
  }

  return (
    <Link
      to={link.href}
      onClick={() => {
        events.forEach((event) => track(event, { location }));
        onClick?.();
      }}
      className={classes}
    >
      {leadingIcon}
      {link.label}
      {trailingIcon}
    </Link>
  );
}
