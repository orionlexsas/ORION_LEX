import { useContent } from '@/content';
import { FaqSection } from '@/features/faq';
import {
  GuaranteeBlock,
  LandingCases,
  LandingClosing,
  LandingHero,
  ProcessSteps,
  StatsBand,
  Testimonials,
} from '@/features/matters';
import { seoFor } from '@/seo/pages';
import { useSeo } from '@/seo/use-seo';
import { NotFoundPage } from './NotFoundPage';

/**
 * Landing page de un servicio (pensada para anuncios): qué sucede, si aplica a su caso,
 * cómo trabajamos, preguntas frecuentes y un llamado claro a WhatsApp.
 */
export function LandingPage({ slug }: { slug: string }) {
  const content = useContent();
  const landing = content.landings.find((l) => l.slug === slug);
  useSeo(seoFor.landing(content, slug));

  if (!landing) return <NotFoundPage />;
  return (
    <>
      <LandingHero landing={landing} coverage={content.site.contact.coverage} />
      {landing.cases && <LandingCases cases={landing.cases} />}
      {landing.process && <ProcessSteps process={landing.process} />}
      {landing.guarantee && <GuaranteeBlock guarantee={landing.guarantee} />}
      {landing.stats && <StatsBand stats={landing.stats} />}
      {landing.testimonials && <Testimonials testimonials={landing.testimonials} />}
      {landing.faq && (
        <FaqSection
          id="preguntas"
          title={landing.faq.title}
          items={landing.faq.items}
          className="border-t border-border"
        />
      )}
      <LandingClosing landing={landing} />
    </>
  );
}
