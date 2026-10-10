import { NewsManager } from '@/features/admin-news';
import { useAdminDocument } from '@/hooks/use-admin-document';

export function NewsPage() {
  useAdminDocument('Noticias');
  return <NewsManager />;
}
