import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { buttonStyles } from '@/components/ui/button-styles';
import { Container } from '@/components/ui/Container';
import { useContent } from '@/content';
import { cn } from '@/lib/cn';
import { useSeo } from '@/seo/use-seo';

export function NotFoundPage() {
  const { t } = useTranslation();
  const { site } = useContent();
  useSeo({
    path: '/404',
    title: `${t('notFound.title')} | ${site.brand.name}`,
    description: site.seo.description,
  });

  return (
    <section className="section-spacing">
      <Container className="max-w-2xl py-12 text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">
          {t('notFound.title')}
        </h1>
        <p className="mt-4 text-lg text-muted">{t('notFound.description')}</p>
        <Link to="/" className={cn(buttonStyles({ variant: 'ink', size: 'lg' }), 'mt-8')}>
          {t('notFound.back')}
        </Link>
      </Container>
    </section>
  );
}
