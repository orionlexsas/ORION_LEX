import type { ServiceItem, ServicesContent } from '@orion-lex/shared';
import { cn } from '@/lib/cn';
import { cardBase } from './card-styles';
import { ServiceIconBadge, ServiceImage, ServiceMoreLink } from './ServiceCardParts';

interface FeaturedServiceCardProps {
  service: ServiceItem;
  featured: ServicesContent['featured'];
  linkLabel: string;
  className?: string;
}

/** Tarjeta grande del servicio principal, con franja dorada inferior. */
export function FeaturedServiceCard({
  service,
  featured,
  linkLabel,
  className,
}: FeaturedServiceCardProps) {
  return (
    <article
      className={cn(
        cardBase,
        'flex flex-col border-gold/70 shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-gold)_15%,transparent),0_30px_80px_-40px_color-mix(in_oklab,var(--color-gold)_55%,transparent)] hover:border-gold',
        className,
      )}
    >
      <div className="relative isolate flex-1 px-7 pt-7 pb-7 lg:px-9 lg:pb-6">
        <ServiceImage image={service.image} className="w-[58%]" />

        <p className="text-xs font-medium tracking-[0.3em] text-gold uppercase">
          {featured.eyebrow}
        </p>
        <ServiceIconBadge icon={service.icon} className="mt-4" />
        <h3 className="mt-3 max-w-[13rem] font-serif text-[2.4rem] leading-[1.02] font-bold lg:text-[2.7rem]">
          {service.title}
        </h3>
        <p className="mt-3 max-w-[19rem] text-base leading-snug text-foreground/85 lg:text-[1.05rem]">
          {service.description}
        </p>
        <ServiceMoreLink
          href={service.href}
          label={linkLabel}
          serviceTitle={service.title}
          className="mt-5"
        />
      </div>

      <div className="flex flex-col gap-3 border-t border-gold/40 bg-[linear-gradient(90deg,color-mix(in_oklab,var(--color-gold)_30%,transparent),color-mix(in_oklab,var(--color-gold)_12%,transparent)_55%,color-mix(in_oklab,var(--color-gold)_22%,transparent))] px-7 py-5 sm:flex-row sm:items-center sm:gap-8 lg:px-9 lg:py-4">
        <p className="max-w-[11rem] text-xs leading-relaxed font-medium tracking-[0.25em] uppercase">
          {featured.footerLabel}
        </p>
        <span aria-hidden="true" className="hidden h-10 w-px bg-foreground/40 sm:block" />
        <p className="max-w-[18rem] text-[0.95rem] leading-snug text-foreground/90">
          {featured.footerText}
        </p>
      </div>
    </article>
  );
}
