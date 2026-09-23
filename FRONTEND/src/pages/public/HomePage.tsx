import { useContent } from '@/content';
import { ApproachSection } from '@/features/approach';
import { ClientsSection } from '@/features/clients';
import { FaqSection } from '@/features/faq';
import { HeroSection } from '@/features/home';
import { LocationsSection } from '@/features/locations';

export function HomePage() {
  const { home, approach, clients, locations, faq } = useContent();
  return (
    <>
      <HeroSection hero={home.hero} nextSectionHref="#enfoque" />
      <ApproachSection id="enfoque" content={approach} />
      {/* Aquí irán más secciones (nosotros, casos…); clientes, sedes y preguntas cierran la página. */}
      <ClientsSection id="clientes" content={clients} />
      <LocationsSection id="sedes" content={locations} />
      <FaqSection id="preguntas" content={faq} />
    </>
  );
}
