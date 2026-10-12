import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import type { PracticeService, ServiceItem, ServicesContent } from '@orion-lex/shared';
import { CtaLink } from '@/components/cta/CtaLink';
import { Container } from '@/components/ui/Container';
import { Markdown } from '@/components/ui/Markdown';
import { practiceAreaHref, serviceHref } from '../lib/routes';

interface ServiceDetailProps {
  area: ServiceItem;
  service: PracticeService;
  content: ServicesContent;
}

/**
 * Página de un servicio (/servicios/<área>/<servicio>): pensada como destino de anuncios.
 * Título, resumen y botón a WhatsApp arriba; explicación completa y otros servicios del área abajo.
 */
export function ServiceDetail({ area, service, content }: ServiceDetailProps) {
  const { t } = useTranslation();
  const image = service.image ?? area.image;
  const others = area.services.filter((s) => s.slug !== service.slug);
  const cta = {
    label: content.ctaLabel,
    href: 'whatsapp',
    message: service.message,
  };

  return (
    <article className="section-spacing">
      <Container>
        <Link
          to={practiceAreaHref(area.slug)}
          className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {t('practiceArea.backTo', { area: area.title })}
        </Link>

        <div className="mt-6 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="eyebrow">{area.title}</p>
            <h1 className="mt-4 font-serif text-4xl leading-[1.08] font-semibold tracking-tight sm:text-5xl lg:text-[3.2rem]">
              {service.title}
            </h1>
            <span aria-hidden="true" className="mt-5 block h-0.5 w-12 bg-accent" />
            <p className="mt-6 text-lg leading-relaxed text-foreground/80 sm:text-xl">
              {service.description}
            </p>
            <CtaLink
              link={cta}
              location={`service_page_${area.slug}_${service.slug}`}
              size="lg"
              className="mt-8 w-full sm:w-auto"
            />
          </div>
          <img
            src={image.src}
            alt={image.alt}
            fetchPriority="high"
            className="aspect-[4/3] w-full rounded-md object-cover saturate-[0.9]"
          />
        </div>

        {service.body.trim() && (
          <div className="mx-auto mt-14 max-w-3xl text-[1.05rem] lg:mt-20">
            <Markdown>{service.body}</Markdown>
            <CtaLink
              link={cta}
              location={`service_page_bottom_${area.slug}_${service.slug}`}
              size="lg"
              className="mt-10 w-full sm:w-auto"
            />
          </div>
        )}

        {others.length > 0 && (
          <nav
            aria-labelledby="other-services"
            className="mt-16 border-t border-border pt-10 lg:mt-20"
          >
            <h2 id="other-services" className="font-serif text-2xl font-semibold">
              {t('practiceArea.otherServices', { area: area.title })}
            </h2>
            <ul className="mt-5 flex flex-wrap gap-3">
              {others.map((other) => (
                <li key={other.slug}>
                  <Link
                    to={serviceHref(area.slug, other.slug)}
                    className="inline-flex min-h-11 items-center rounded-md border border-border px-4 transition-colors hover:border-accent hover:text-accent-text"
                  >
                    {other.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </Container>
    </article>
  );
}
