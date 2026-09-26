import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Link2, Share2 } from 'lucide-react';
import { siFacebook } from 'simple-icons';
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon';

interface ShareButtonsProps {
  url: string;
  title: string;
  label: string;
}

const buttonClass =
  'grid size-11 cursor-pointer place-items-center rounded-full border border-border transition-colors hover:border-accent hover:text-accent-text';

/** Compartir un artículo: WhatsApp, Facebook, copiar enlace y el menú del sistema (móvil). */
export function ShareButtons({ url, title, label }: ShareButtonsProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const canNativeShare = typeof navigator !== 'undefined' && 'share' in navigator;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Sin permiso para el portapapeles: no se hace nada.
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="mr-1 text-sm font-semibold">{label}</p>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t('share.whatsapp')}
        title={t('share.whatsapp')}
        className={buttonClass}
      >
        <WhatsAppIcon className="size-5" />
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t('share.facebook')}
        title={t('share.facebook')}
        className={buttonClass}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-5">
          <path d={siFacebook.path} />
        </svg>
      </a>
      <button
        type="button"
        onClick={copy}
        aria-label={t('share.copy')}
        title={t('share.copy')}
        className={buttonClass}
      >
        {copied ? (
          <Check className="size-5 text-success" aria-hidden="true" />
        ) : (
          <Link2 className="size-5" aria-hidden="true" />
        )}
      </button>
      {canNativeShare && (
        <button
          type="button"
          onClick={() => void navigator.share({ title, url }).catch(() => undefined)}
          aria-label={t('share.more')}
          title={t('share.more')}
          className={buttonClass}
        >
          <Share2 className="size-5" aria-hidden="true" />
        </button>
      )}
      <span role="status" className="sr-only">
        {copied ? t('share.copied') : ''}
      </span>
    </div>
  );
}
