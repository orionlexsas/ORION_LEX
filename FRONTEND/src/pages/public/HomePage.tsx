import { StructuredData } from '@/components/seo/StructuredData';
import { useContent } from '@/content';
import { ApproachSection } from '@/features/approach';
import { BlogPreviewSection } from '@/features/blog';
import { ContactSection } from '@/features/contact';
import { CoverageSection } from '@/features/coverage';
import { HeroSection } from '@/features/home';
import { MattersSection } from '@/features/matters';
import { ServicesSection } from '@/features/services';
import { TeamSection } from '@/features/team';
import { seoFor } from '@/seo/pages';
import { useSeo } from '@/seo/use-seo';

/** Portada: servicio → confianza → explicación → contacto. */
export function HomePage() {
  const content = useContent();
  const { site, home, matters, landings, approach, services, team, blog, articles, coverage } =
    content;
  useSeo(seoFor.home(content));

  return (
    <>
      <HeroSection hero={home.hero} />
      <MattersSection id="asuntos" content={matters} landings={landings} />
      <ApproachSection id="como-trabajamos" content={approach} className="bg-surface" />
      <ServicesSection id="servicios-juridicos" content={services} className="bg-surface" />
      <TeamSection id="nosotros" content={team} />
      <BlogPreviewSection id="actualidad" blog={blog} articles={articles} className="bg-surface" />
      <CoverageSection id="cobertura" content={coverage} />
      <ContactSection
        id="contacto"
        contact={site.contact}
        subjects={landings.map((l) => l.title)}
        className="bg-surface"
      />
      <StructuredData
        data={{
          '@context': 'https://schema.org',
          '@type': 'LegalService',
          name: site.brand.legalName,
          url: site.siteUrl,
          logo: `${site.siteUrl}/brand/logo.webp`,
          image: `${site.siteUrl}${site.seo.image}`,
          description: site.seo.description,
          telephone: `+${site.contact.whatsapp.number}`,
          email: site.contact.email,
          areaServed: { '@type': 'Country', name: 'Colombia' },
          sameAs: site.social.map((s) => s.url),
        }}
      />
    </>
  );
}
