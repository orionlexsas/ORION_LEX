import { ServicesManager } from '@/features/admin-services';
import { useAdminDocument } from '@/hooks/use-admin-document';

export function ServicesAdminPage() {
  useAdminDocument('Servicios');
  return <ServicesManager />;
}
