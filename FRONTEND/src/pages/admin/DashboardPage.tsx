import { useOutletContext } from 'react-router';
import type { AdminOutletContext } from '@/components/layout/AdminLayout';
import { DashboardView } from '@/features/admin-dashboard';
import { useAdminDocument } from '@/hooks/use-admin-document';

export function DashboardPage() {
  const { user } = useOutletContext<AdminOutletContext>();
  useAdminDocument('Dashboard');
  return <DashboardView userName={user.name} />;
}
