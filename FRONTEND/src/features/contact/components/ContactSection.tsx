import { lazy, Suspense } from 'react';
import { Mail, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SiteContent } from '@orion-lex/shared';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/cn';
import { whatsappUrl } from '@/lib/whatsapp';
// El formulario (validación y envío) se descarga aparte: está al final de la página y así no
// retrasa la carga inicial.
const ContactForm = lazy(() => import('./ContactForm').then((m) => ({ default: m.ContactForm })));

interface ContactSectionProps {
  id: string;
  contact: SiteContent['contact'];
  subjects: string[];
  headingLevel?: 'h1' | 'h2';
  className?: string;
}

/** Contacto: datos directos (WhatsApp, correo, cobertura) y el formulario. */
export function ContactSection({
  id,
  contact,
  subjects,
  headingLevel = 'h2',
  className,
}: ContactSectionProps) {
  const { t } = useTranslation();
  const titleId = `${id}-title`;

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={cn('scroll-mt-20 section-spacing', className)}
    >
      <Container className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div>
          <SectionHeading
            id={titleId}
            as={headingLevel}
            eyebrow={t('contact.eyebrow')}
            title={t('contact.title')}
            description={t('contact.description')}
          />
          <ul className="mt-10 space-y-5">
            <li>
              <a
                href={whatsappUrl(contact.whatsapp.number, contact.whatsapp.message)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('whatsapp_click', { location: 'contact_details' })}
                className="group flex items-center gap-4"
              >
                <span className="grid size-12 place-items-center rounded-full bg-accent text-on-accent">
                  <Phone className="size-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm text-muted">{t('contact.whatsappLabel')}</span>
                  <span className="block text-lg font-semibold group-hover:text-accent-text">
                    {contact.phone}
                  </span>
                  <span className="sr-only"> {t('a11y.opensWhatsApp')}</span>
                </span>
              </a>
            </li>
            <li>
              <a href={`mailto:${contact.email}`} className="group flex items-center gap-4">
                <span className="grid size-12 place-items-center rounded-full bg-ink text-white dark:bg-white dark:text-ink">
                  <Mail className="size-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm text-muted">{t('contact.emailLabel')}</span>
                  <span className="block text-lg font-semibold break-all group-hover:text-accent-text">
                    {contact.email}
                  </span>
                </span>
              </a>
            </li>
          </ul>
          <p className="mt-8 max-w-md leading-relaxed text-muted">{contact.coverage}</p>
        </div>

        <div className="relative rounded-lg border border-border bg-background p-6 sm:p-8">
          <Suspense fallback={<div className="min-h-[34rem]" aria-busy="true" />}>
            <ContactForm subjects={subjects} />
          </Suspense>
        </div>
      </Container>
    </section>
  );
}
