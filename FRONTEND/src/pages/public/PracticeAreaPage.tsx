import { useContent } from '@/content';
import { PracticeAreaDetail } from '@/features/services';
import { seoFor } from '@/seo/pages';
import { useSeo } from '@/seo/use-seo';
import { NotFoundPage } from './NotFoundPage';

/** Página de un área del derecho: /servicios/<slug> (slug de services.json). */
export function PracticeAreaPage({ slug }: { slug: string }) {
  const content = useContent();
  const item = content.services.items.find((i) => i.slug === slug);
  useSeo(seoFor.practiceArea(content, slug));

  if (!item) return <NotFoundPage />;
  return <PracticeAreaDetail item={item} content={content.services} />;
}
