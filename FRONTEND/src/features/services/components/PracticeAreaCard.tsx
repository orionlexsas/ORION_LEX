import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import type { ServiceItem } from '@orion-lex/shared';
import { CtaLink } from '@/components/cta/CtaLink';
import { ContentIcon } from '@/components/ui/ContentIcon';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/cn';
import { practiceAreaHref } from '../lib/routes';

interface PracticeAreaCardProps {
  item: ServiceItem;
  detailsLabel: string;
  ctaLabel: string;
  className?: string;
}

/**
 * Tarjeta de un área del derecho. El enlace del título se extiende a toda la tarjeta (un único
 * enlace, sin enlaces anidados); el botón "Solicitar asesoría" de la tarjeta destacada queda por
 * encima y abre WhatsApp con el número configurado en site.json.
 */
export function PracticeAreaCard({
  item,
  detailsLabel,
  ctaLabel,
  className,
}: PracticeAreaCardProps) {
  const featured = item.featured;

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-md border border-border bg-background shadow-[0_1px_6px_-3px_rgb(0_0_0/0.08)]',
        'transition-[translate,box-shadow,border-color] duration-200 ease-out hover:-translate-y-[3px] hover:border-accent/60 hover:shadow-[0_16px_32px_-22px_rgb(0_0_0/0.35)]',
        'has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-accent',
        featured && 'sm:flex-row xl:flex-col',
        className,
      )}
    >
      <img
        src={item.image.src}
        alt={item.image.alt}
        loading="lazy"
        decoding="async"
        className={cn(
          'w-full object-cover saturate-[0.9]',
          featured
            ? 'aspect-[16/10] sm:aspect-auto sm:w-1/2 xl:min-h-0 xl:w-full xl:flex-1'
            : 'aspect-[2.1/1]',
        )}
      />
      <div
        className={cn(
          'flex flex-col px-6 pt-5 pb-6',
          featured
            ? 'sm:flex-1 sm:justify-center sm:px-8 sm:py-8 xl:flex-none xl:px-7 xl:pt-6 xl:pb-8'
            : 'flex-1 xl:px-5',
        )}
      >
        <ContentIcon
          name={item.icon}
          className={cn('text-accent', featured ? 'size-9' : 'size-7')}
          strokeWidth={1.5}
        />
        <h3
          className={cn(
            'mt-3 font-serif leading-tight font-semibold tracking-tight',
            featured ? 'text-3xl lg:text-[2.3rem]' : 'text-[1.4rem] xl:text-[1.35rem]',
          )}
        >
          <Link
            to={practiceAreaHref(item.slug)}
            onClick={() => track('service_card_click', { service: item.slug })}
            // El área del enlace cubre toda la tarjeta; el foco se marca en la tarjeta (has-[...]).
            className="outline-none after:absolute after:inset-0"
          >
            {item.title}
          </Link>
        </h3>
        <p
          className={cn(
            'mt-2 leading-relaxed text-foreground/75',
            featured && 'lg:text-lg',
            !featured && 'flex-1',
          )}
        >
          {item.description}
        </p>

        <div
          className={cn(
            'mt-4 flex flex-wrap items-center gap-x-6 gap-y-4',
            featured && 'justify-between sm:mt-7',
          )}
        >
          <span
            aria-hidden="true"
            className="inline-flex items-center gap-2 text-[0.95rem] font-medium text-accent-text"
          >
            {detailsLabel}
            <ArrowRight className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-1" />
          </span>
          {featured && (
            <CtaLink
              link={{ label: ctaLabel, href: 'whatsapp', message: item.message }}
              location="practice_area_featured"
              hideWhatsAppIcon
              className="relative z-10 px-5"
            />
          )}
        </div>
      </div>
    </article>
  );
}
