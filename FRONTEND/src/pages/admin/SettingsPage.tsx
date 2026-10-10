import { useOutletContext } from 'react-router';
import { KeyRound, Mail, UserRound } from 'lucide-react';
import { AdminCard } from '@/components/admin/AdminCard';
import { PageHeader } from '@/components/admin/PageHeader';
import type { AdminOutletContext } from '@/components/layout/AdminLayout';
import { useAdminDocument } from '@/hooks/use-admin-document';

/** Configuración: datos de la cuenta y cómo cambiar el acceso. */
export function SettingsPage() {
  const { user } = useOutletContext<AdminOutletContext>();
  useAdminDocument('Configuración');

  return (
    <div className="space-y-7">
      <PageHeader
        title="Configuración"
        description="Cuenta de acceso al panel y mensajes de la web."
      />
      <div className="grid max-w-5xl gap-6 lg:grid-cols-2">
        <AdminCard title="Tu cuenta" icon={UserRound}>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="font-semibold">Nombre</dt>
              <dd className="text-muted">{user.name}</dd>
            </div>
            <div>
              <dt className="font-semibold">Cargo</dt>
              <dd className="text-muted">{user.role}</dd>
            </div>
            <div>
              <dt className="font-semibold">Correo de acceso</dt>
              <dd className="text-muted">{user.email}</dd>
            </div>
          </dl>
        </AdminCard>

        <AdminCard title="Contraseña" icon={KeyRound}>
          <p className="text-sm leading-relaxed text-muted">
            Por seguridad, la contraseña y el correo de acceso se configuran en el servidor
            (Vercel), no desde el panel. Pide al administrador técnico del sitio que los cambie
            cuando lo necesites.
          </p>
        </AdminCard>

        <AdminCard title="Mensajes del formulario" icon={Mail} className="lg:col-span-2">
          <p className="text-sm leading-relaxed text-muted">
            Las consultas del formulario de contacto llegan al correo{' '}
            <strong className="text-foreground">abogados@orionlex.co</strong>. Puedes leerlas en el{' '}
            <a
              href="https://mail.hostinger.com"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-accent-text hover:underline"
            >
              webmail de Hostinger
            </a>
            .
          </p>
        </AdminCard>
      </div>
    </div>
  );
}
