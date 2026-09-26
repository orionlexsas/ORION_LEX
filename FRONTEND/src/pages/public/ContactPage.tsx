import { useContent } from '@/content';
import { ContactSection } from '@/features/contact';
import { seoFor } from '@/seo/pages';
import { useSeo } from '@/seo/use-seo';

export function ContactPage() {
  const content = useContent();
  useSeo(seoFor.contact(content));
  return (
    <ContactSection
      id="contacto"
      contact={content.site.contact}
      subjects={content.landings.map((l) => l.title)}
      headingLevel="h1"
    />
  );
}
