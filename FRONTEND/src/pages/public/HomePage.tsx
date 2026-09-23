import { homeContent, servicesContent } from '@/content';
import { HeroSection } from '@/features/home';
import { ServicesSection } from '@/features/services';

export function HomePage() {
  return (
    <>
      <HeroSection hero={homeContent.hero} nextSectionHref="#servicios" />
      <ServicesSection id="servicios" content={servicesContent} />
      {/* Aquí irán las siguientes secciones: nosotros, casos… */}
    </>
  );
}
