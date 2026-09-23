import { useTranslation } from 'react-i18next';
import { ContactForm } from '@/features/contact';

export function ContactPage() {
  const { t } = useTranslation();
  return (
    <section className="mx-auto max-w-xl px-4 py-16">
      <h1 className="mb-8 font-serif text-4xl">{t('contact.title')}</h1>
      <ContactForm />
    </section>
  );
}
