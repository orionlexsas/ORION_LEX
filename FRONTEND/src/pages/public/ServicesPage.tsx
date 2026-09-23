import { useContent } from '@/content';
import { ServicesSection } from '@/features/services';

export function ServicesPage() {
  const { services } = useContent();
  return <ServicesSection id="servicios" content={services} />;
}
