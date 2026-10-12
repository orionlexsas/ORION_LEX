import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { UserRound } from 'lucide-react';
import { cn } from '@/lib/cn';

/** Botón redondo (mismo estilo que el de tema) que lleva al acceso del panel de administración. */
export function AdminLoginButton({ className }: { className?: string }) {
  const { t } = useTranslation();
  const label = t('a11y.adminLogin');

  return (
    <Link
      to="/admin/login"
      aria-label={label}
      title={label}
      className={cn(
        'grid size-11 shrink-0 place-items-center rounded-full border border-accent text-foreground/85 transition-colors hover:bg-accent/10 hover:text-accent-text active:bg-accent/20',
        className,
      )}
    >
      <UserRound aria-hidden="true" className="size-5" />
    </Link>
  );
}
