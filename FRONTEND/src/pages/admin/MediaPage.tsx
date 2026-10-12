import { MediaLibrary } from '@/features/admin-media';
import { useAdminDocument } from '@/hooks/use-admin-document';

export function MediaPage() {
  useAdminDocument('Fotos y banners');
  return <MediaLibrary />;
}
