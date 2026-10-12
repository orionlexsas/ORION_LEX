import { useContent } from '@/content';
import { ServiceDetail } from '@/features/services';
import { seoFor } from '@/seo/pages';
import { useSeo } from '@/seo/use-seo';
import { NotFoundPage } from './NotFoundPage';

/** Página de un servicio: /servicios/<área>/<servicio> (los slugs salen de services.json). */
export function ServicePage({ area, slug }: { area: string; slug: string }) {
  const content = useContent();
  const item = content.services.items.find((i) => i.slug === area);
  const service = item?.services.find((s) => s.slug === slug);
  useSeo(seoFor.service(content, area, slug));

  if (!item || !service) return <NotFoundPage />;
  return <ServiceDetail area={item} service={service} content={content.services} />;
}
