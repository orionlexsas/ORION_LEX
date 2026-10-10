import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface AdminCardProps {
  title?: string;
  icon?: LucideIcon;
  /** Botón o enlace a la derecha del título ("Ver todas"). */
  action?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}

/** Tarjeta blanca del panel con título opcional (Últimas noticias, Vista previa…). */
export function AdminCard({
  title,
  icon: Icon,
  action,
  className,
  bodyClassName,
  children,
}: AdminCardProps) {
  return (
    <section className={cn('rounded-2xl border border-border bg-background shadow-sm', className)}>
      {title && (
        <header className="flex items-center justify-between gap-4 px-5 pt-5 sm:px-6">
          <h2 className="flex items-center gap-3 font-serif text-xl font-semibold sm:text-2xl">
            {Icon && (
              <Icon aria-hidden="true" className="size-6 shrink-0 text-accent" strokeWidth={1.6} />
            )}
            {title}
          </h2>
          {action}
        </header>
      )}
      <div className={cn('p-5 sm:p-6', bodyClassName)}>{children}</div>
    </section>
  );
}
