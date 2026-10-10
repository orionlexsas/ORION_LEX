import { LoginScreen } from '@/features/auth';
import { useAdminDocument } from '@/hooks/use-admin-document';

export function LoginPage() {
  useAdminDocument('Acceso');
  return <LoginScreen />;
}
