import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import type { ServiceItem } from '@orion-lex/shared';
import { ContentIcon } from '@/components/ui/ContentIcon';
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon';
import { useContent } from '@/content';
import { track } from '@/lib/analytics';
import { whatsappUrl } from '@/lib/whatsapp';

interface PracticeAreaCardProps {
  item: ServiceItem;
  detailsLabel: string;
  ctaLabel: string;
  onOpenDetails: () => void;
}

const cardClass =
  'group flex h-full w-full cursor-pointer flex-col rounded-lg border border-border bg-background p-6 text-left transition-[border-color,box-shadow] duration-300 ease-out-soft hover:border-accent hover:shadow-[0_18px_40px_-26px_rgb(0_0_0/0.35)] sm:p-7';

/** Tarjeta de un área del derecho: toda la tarjeta es clicable. */
export function PracticeAreaCard({
  item,
  detailsLabel,
  ctaLabel,
  onOpenDetails,
}: PracticeAreaCardProps) {
  const { t } = useTranslation();
  const { site } = useContent();

  const body = (action: ReactNode) => (
    <>
      <ContentIcon name={item.icon} className="size-8 text-accent" strokeWidth={1.4} />
      <span className="mt-5 font-serif text-2xl font-semibold">{item.title}</span>
      <span className="mt-2 flex-1 leading-relaxed text-muted">{item.description}</span>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent-text">
        {action}
      </span>
    </>
  );

  if (item.action === 'whatsapp') {
    return (
      <a
        href={whatsappUrl(site.contact.whatsapp.number, item.message)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          track('whatsapp_click', { location: 'practice_area', service: item.slug });
          track('service_card_click', { service: item.slug });
        }}
        className={cardClass}
      >
        {body(
          <>
            <WhatsAppIcon className="size-4" />
            {ctaLabel}
            <span className="sr-only"> {t('a11y.opensWhatsApp')}</span>
          </>,
        )}
      </a>
    );
  }

  return (
    <button
      type="button"
      aria-haspopup="dialog"
      onClick={() => {
        track('service_card_click', { service: item.slug });
        onOpenDetails();
      }}
      className={cardClass}
    >
      {body(
        <>
          {detailsLabel}
          <ArrowRight
            className="size-4 transition-transform duration-300 ease-out-soft group-hover:translate-x-1"
            aria-hidden="true"
          />
        </>,
      )}
    </button>
  );
}
