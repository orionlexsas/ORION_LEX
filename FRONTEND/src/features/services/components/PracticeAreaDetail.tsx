import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import type { ServiceItem, ServicesContent } from '@orion-lex/shared';
import { CtaLink } from '@/components/cta/CtaLink';
import { ContentIcon } from '@/components/ui/ContentIcon';
import { Container } from '@/components/ui/Container';
import { practiceAreaHref } from '../lib/routes';

interface PracticeAreaDetailProps {
  item: ServiceItem;
  content: ServicesContent;
}

/** Página de un área del derecho: foto, explicación breve, botón a WhatsApp y las demás áreas. */
export function PracticeAreaDetail({ item, content }: PracticeAreaDetailProps) {
  const others = content.items.filter((other) => other.slug !== item.slug);

  return (
    <article className="section-spacing">
      <Container>
        <Link
          to="/#servicios-juridicos"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {content.backLabel}
        </Link>

        <div className="mt-6 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="eyebrow">{content.eyebrow}</p>
            <ContentIcon name={item.icon} className="mt-5 size-10 text-accent" strokeWidth={1.4} />
            <h1 className="mt-4 font-serif text-4xl leading-[1.08] font-semibold tracking-tight sm:text-5xl lg:text-[3.4rem]">
              {item.title}
            </h1>
            <span aria-hidden="true" className="mt-5 block h-0.5 w-12 bg-accent" />
            <p className="mt-6 font-serif text-xl sm:text-2xl">{item.description}</p>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-foreground/80">
              {item.details}
            </p>
            <CtaLink
              link={{ label: content.ctaLabel, href: 'whatsapp', message: item.message }}
              location={`practice_area_page_${item.slug}`}
              size="lg"
              className="mt-8 w-full sm:w-auto"
            />
          </div>
          <img
            src={item.image.src}
            alt={item.image.alt}
            fetchPriority="high"
            className="aspect-[4/3] w-full rounded-md object-cover saturate-[0.9]"
          />
        </div>

        <nav aria-labelledby="other-areas" className="mt-16 border-t border-border pt-10 lg:mt-20">
          <h2 id="other-areas" className="font-serif text-2xl font-semibold">
            {content.title}
          </h2>
          <ul className="mt-5 flex flex-wrap gap-3">
            {others.map((other) => (
              <li key={other.slug}>
                <Link
                  to={practiceAreaHref(other.slug)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-4 transition-colors hover:border-accent hover:text-accent-text"
                >
                  <ContentIcon name={other.icon} className="size-4 text-accent" strokeWidth={1.6} />
                  {other.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </article>
  );
}
