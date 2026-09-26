import { useContent } from '@/content';
import { MattersSection } from '@/features/matters';
import { ServicesSection } from '@/features/services';
import { seoFor } from '@/seo/pages';
import { useSeo } from '@/seo/use-seo';

/** Servicios: primero los asuntos frecuentes (landings), luego las áreas del derecho. */
export function ServicesPage() {
  const content = useContent();
  useSeo(seoFor.services(content));
  return (
    <>
      <MattersSection
        id="asuntos"
        content={content.matters}
        landings={content.landings}
        headingLevel="h1"
      />
      <ServicesSection id="servicios-juridicos" content={content.services} className="bg-surface" />
    </>
  );
}
