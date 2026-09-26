import { useTranslation } from 'react-i18next';
import type { LandingContent } from '@orion-lex/shared';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { Container } from '@/components/ui/Container';

type Stats = NonNullable<LandingContent['stats']>;

/** Cifra destacada con contador animado (p. ej. "Más de 1.000 reportes eliminados"). */
export function StatsBand({ stats }: { stats: Stats }) {
  const { i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === 'en' ? 'en-US' : 'es-CO';

  return (
    <section aria-label={`${stats.prefix} ${stats.value} ${stats.label}`} className="bg-surface">
      <Container className="flex flex-col items-center py-14 text-center lg:py-16">
        <p className="eyebrow">{stats.prefix}</p>
        <p className="mt-2 font-serif text-6xl leading-none font-semibold sm:text-7xl">
          <span aria-hidden="true" className="text-accent">
            +
          </span>
          <AnimatedCounter value={stats.value} locale={locale} />
        </p>
        <p className="mt-3 text-lg text-muted">{stats.label}</p>
      </Container>
    </section>
  );
}
