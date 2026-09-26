import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Sparkles } from 'lucide-react';
import type { LandingContent } from '@orion-lex/shared';
import { CtaLink } from '@/components/cta/CtaLink';
import { Container } from '@/components/ui/Container';
import { MediaPanel } from '@/components/ui/MediaPanel';

interface LandingHeroProps {
  landing: LandingContent;
  coverage: string;
}

/** Encabezado de una landing: migas de pan, título (único H1), pregunta de entrada y llamado. */
export function LandingHero({ landing, coverage }: LandingHeroProps) {
  const { t } = useTranslation();
  const { hero, cta } = landing;

  return (
    <section aria-labelledby="landing-title" className="border-b border-border">
      <Container className="grid items-center gap-10 py-8 sm:py-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:py-14">
        <div>
          <nav aria-label={t('landing.breadcrumb')}>
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
              {[
                { label: t('landing.home'), href: '/' },
                { label: t('landing.services'), href: '/servicios' },
              ].map((crumb) => (
                <li key={crumb.href} className="flex items-center gap-1.5">
                  <Link to={crumb.href} className="hover:text-foreground">
                    {crumb.label}
                  </Link>
                  <ChevronRight className="size-3.5" aria-hidden="true" />
                </li>
              ))}
              <li aria-current="page" className="text-foreground">
                {landing.title}
              </li>
            </ol>
          </nav>

          <p className="eyebrow mt-8">{hero.eyebrow}</p>
          <h1
            id="landing-title"
            className="mt-3 font-serif text-[2.2rem] leading-[1.1] font-semibold tracking-tight sm:text-5xl lg:text-[3.3rem]"
          >
            {landing.title}
          </h1>
          <span aria-hidden="true" className="mt-5 block h-0.5 w-12 bg-accent" />
          <p className="mt-6 font-serif text-xl leading-snug sm:text-2xl">{hero.lead}</p>

          {hero.paragraphs.map((paragraph) => (
            <p
              key={paragraph}
              className="mt-4 max-w-2xl text-lg leading-relaxed text-foreground/80"
            >
              {paragraph}
            </p>
          ))}
          {hero.emphasis && (
            <p className="mt-5 max-w-2xl border-l-2 border-accent pl-4 text-lg leading-relaxed font-semibold">
              {hero.emphasis}
            </p>
          )}
          {hero.highlight && (
            <p className="mt-6 flex max-w-2xl items-start gap-3 rounded-md bg-accent/12 px-4 py-3.5 font-semibold">
              <Sparkles className="mt-0.5 size-5 shrink-0 text-accent-text" aria-hidden="true" />
              {hero.highlight}
            </p>
          )}

          <CtaLink
            link={{ label: cta.label, href: 'whatsapp', message: cta.message }}
            location="landing_hero"
            events={[landing.leadEvent, 'landing_cta_click']}
            size="lg"
            className="mt-8 w-full sm:w-auto"
          />
          <p className="mt-4 max-w-xl text-sm text-muted">{coverage}</p>
        </div>

        <MediaPanel
          image={landing.image}
          icon={landing.icon}
          priority
          className="aspect-[16/9] rounded-lg lg:aspect-[4/5]"
        />
      </Container>
    </section>
  );
}
