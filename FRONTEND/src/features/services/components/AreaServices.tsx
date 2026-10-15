import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import type { ServiceItem } from '@orion-lex/shared';
import { serviceHref } from '../lib/routes';

/** Tarjetas de los servicios de un área (en la página del área). */
export function AreaServices({ item }: { item: ServiceItem }) {
  const { t } = useTranslation();
  if (item.services.length === 0) return null;

  return (
    <section aria-labelledby="area-services" className="mt-16 max-sm:mt-10 lg:mt-20">
      <h2 id="area-services" className="font-serif text-3xl font-semibold sm:text-4xl">
        {t('practiceArea.servicesTitle')}
      </h2>
      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {item.services.map((service) => (
          <li key={service.slug}>
            <Link
              to={serviceHref(item.slug, service.slug)}
              className="group flex h-full flex-col rounded-md border border-border bg-background p-6 transition-colors hover:border-accent"
            >
              <span aria-hidden="true" className="block h-0.5 w-10 bg-accent" />
              <h3 className="mt-4 font-serif text-xl leading-snug font-semibold">
                {service.title}
              </h3>
              <p className="mt-2 flex-1 leading-relaxed text-foreground/75">
                {service.description}
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent-text">
                {t('practiceArea.viewService')}
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform group-hover:translate-x-1"
                />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
