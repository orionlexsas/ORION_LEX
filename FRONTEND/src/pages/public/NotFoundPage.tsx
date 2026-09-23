import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

export function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 text-center">
      <h1 className="font-serif text-4xl">{t('notFound.title')}</h1>
      <Link to="/" className="mt-6 inline-block underline">
        {t('notFound.back')}
      </Link>
    </section>
  );
}
