import { AdminLayout } from '@/components/layout/AdminLayout';
import { AdminGate } from '@/features/auth';

/** Raíz del panel: exige sesión y pinta el menú lateral con la sección elegida. */
export function AdminRoot() {
  return <AdminGate>{(user, logout) => <AdminLayout user={user} onLogout={logout} />}</AdminGate>;
}
