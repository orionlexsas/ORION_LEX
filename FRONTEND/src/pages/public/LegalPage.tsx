import { useTranslation } from 'react-i18next';
import { Container } from '@/components/ui/Container';
import { Markdown } from '@/components/ui/Markdown';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useContent } from '@/content';
import { seoFor } from '@/seo/pages';
import { useSeo } from '@/seo/use-seo';

/** Política de privacidad o términos (texto en content/<idioma>/legal.json). Se carga aparte. */
export function LegalPage({ kind }: { kind: 'privacy' | 'terms' }) {
  const { t } = useTranslation();
  const content = useContent();
  const page = content.legal[kind];
  useSeo(seoFor[kind](content));

  return (
    <section aria-labelledby="legal-title" className="section-spacing">
      <Container className="max-w-3xl">
        <SectionHeading id="legal-title" as="h1" title={page.title} />
        {page.status === 'provisional' && (
          <p className="mt-8 rounded-md bg-accent/12 px-4 py-3 text-sm font-medium">
            {t('legal.pendingNotice')}
          </p>
        )}
        <Markdown className="mt-8">{page.body}</Markdown>
      </Container>
    </section>
  );
}
