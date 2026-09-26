import { useContent } from '@/content';
import { ApproachSection } from '@/features/approach';
import { TeamSection } from '@/features/team';
import { seoFor } from '@/seo/pages';
import { useSeo } from '@/seo/use-seo';

/** Nosotros: primero quién atiende; después cómo trabajamos. */
export function AboutPage() {
  const content = useContent();
  useSeo(seoFor.about(content));
  return (
    <>
      <TeamSection id="equipo" content={content.team} headingLevel="h1" />
      <ApproachSection id="como-trabajamos" content={content.approach} className="bg-surface" />
    </>
  );
}
