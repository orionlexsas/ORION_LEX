import { useContent } from '@/content';
import { ApproachSection } from '@/features/approach';
import { BlogPreviewSection } from '@/features/blog';
import { ContactSection } from '@/features/contact';
import { CoverageSection } from '@/features/coverage';
import { HeroSection } from '@/features/home';
import { MattersSection } from '@/features/matters';
import { ServicesSection } from '@/features/services';
import { TeamSection } from '@/features/team';
import { TestimonialsSection } from '@/features/testimonials';
import { seoFor } from '@/seo/pages';
import { useSeo } from '@/seo/use-seo';

/**
 * Portada: servicio → confianza → explicación → contacto. Los fondos alternan (blanco, crema,
 * la vitrina negra de Servicios, naranja suave) para que cada sección se distinga de la siguiente.
 * Los datos del despacho para Google (JSON-LD) los escribe el prerender en el HTML de cada página.
 */
export function HomePage() {
  const content = useContent();
  const {
    site,
    home,
    matters,
    landings,
    approach,
    services,
    team,
    blog,
    articles,
    coverage,
    testimonials,
  } = content;
  useSeo(seoFor.home(content));

  return (
    <>
      <HeroSection hero={home.hero} />
      <MattersSection id="asuntos" content={matters} landings={landings} className="bg-band" />
      <ApproachSection id="como-trabajamos" content={approach} cinematic />
      <ServicesSection id="servicios-juridicos" content={services} />
      <TeamSection id="nosotros" content={team} className="defer-render bg-band" />
      <BlogPreviewSection
        id="actualidad"
        blog={blog}
        articles={articles}
        className="defer-render"
      />
      <CoverageSection id="cobertura" content={coverage} className="defer-render bg-band-accent" />
      <TestimonialsSection id="testimonios" content={testimonials} />
      <ContactSection
        id="contacto"
        className="defer-render"
        contact={site.contact}
        subjects={landings.map((l) => l.title)}
      />
    </>
  );
}
