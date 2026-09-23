import type { ServiceItem } from '@orion-lex/shared';
import { cn } from '@/lib/cn';
import { cardBase } from './card-styles';
import { ServiceIconBadge, ServiceImage, ServiceMoreLink } from './ServiceCardParts';

/**
 * - `stacked`: ícono arriba y texto debajo (tarjetas medianas).
 * - `inline`: ícono a la izquierda y texto a su lado (tarjetas anchas o bajas).
 */
type Layout = 'stacked' | 'inline';

interface ServiceCardProps {
  service: ServiceItem;
  layout: Layout;
  linkLabel: string;
  /** Ancho de la foto dentro de la tarjeta (clase de Tailwind). */
  imageWidth?: string;
  className?: string;
}

export function ServiceCard({
  service,
  layout,
  linkLabel,
  imageWidth = 'w-[45%]',
  className,
}: ServiceCardProps) {
  return (
    <article
      className={cn(
        cardBase,
        'border-gold/25 hover:border-gold/60 hover:shadow-[0_24px_60px_-32px_rgb(227_191_118/0.5)]',
        layout === 'stacked'
          ? 'flex flex-col px-6 py-6 lg:px-7 lg:py-5'
          : 'flex items-start gap-5 px-6 py-6 lg:gap-7 lg:px-8 lg:py-6',
        className,
      )}
    >
      <ServiceImage image={service.image} className={imageWidth} />
      <ServiceIconBadge icon={service.icon} />

      <div className={cn(layout === 'stacked' && 'mt-3')}>
        <h3
          className={cn(
            'max-w-[20rem] font-serif leading-[1.12] font-bold text-balance',
            layout === 'stacked'
              ? 'text-[1.65rem] lg:text-[1.8rem]'
              : 'text-[1.55rem] lg:text-[1.65rem]',
          )}
        >
          {service.title}
        </h3>
        <p className="mt-2 max-w-[16.5rem] text-[0.95rem] leading-snug text-foreground/80 lg:text-base">
          {service.description}
        </p>
        <ServiceMoreLink
          href={service.href}
          label={linkLabel}
          serviceTitle={service.title}
          className="mt-4"
        />
      </div>
    </article>
  );
}
