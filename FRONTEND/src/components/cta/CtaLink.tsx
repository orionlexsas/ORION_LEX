import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useContent } from '@/content';
import { cn } from '@/lib/cn';
import { WHATSAPP_HREF, whatsappUrl } from '@/lib/whatsapp';
import { buttonStyles, type ButtonStyleOptions } from '@/components/ui/button-styles';
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon';

interface CtaLinkProps extends ButtonStyleOptions {
  link: { label: string; href: string };
  /** Ícono antes del texto; si el enlace es de WhatsApp se usa su logo. */
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * Botón de llamada a la acción del contenido. Si `href` es "whatsapp" abre el chat
 * (en otra pestaña) con el logo de WhatsApp; si no, navega dentro del sitio.
 */
export function CtaLink({
  link,
  leadingIcon,
  trailingIcon,
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
    return (
      <a
        href={whatsappUrl(number, message)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className={classes}
      >
        <WhatsAppIcon className="size-5 shrink-0" />
        {link.label}
        <span className="sr-only"> {t('a11y.opensWhatsApp')}</span>
        {trailingIcon}
      </a>
    );
  }

  return (
    <Link to={link.href} onClick={onClick} className={classes}>
      {leadingIcon}
      {link.label}
      {trailingIcon}
    </Link>
  );
}
