import { StatsView } from '@/features/admin-stats';
import { useAdminDocument } from '@/hooks/use-admin-document';

export function StatsPage() {
  useAdminDocument('Estadísticas');
  return <StatsView />;
}
