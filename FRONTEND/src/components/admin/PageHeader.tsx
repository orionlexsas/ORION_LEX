import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
  /** Botones a la derecha del título ("Nueva noticia", "Subir imagen"). */
  actions?: ReactNode;
}

/** Encabezado de cada página del panel: línea naranja, título grande y descripción. */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-x-8 gap-y-5">
      <div className="max-w-3xl min-w-[min(100%,20rem)] flex-1">
        <span aria-hidden="true" className="mb-4 block h-1 w-14 rounded-full bg-accent" />
        <h1 className="font-serif text-4xl leading-tight font-semibold sm:text-5xl">{title}</h1>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-muted sm:text-base">{description}</p>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-3 sm:mt-9">{actions}</div>}
    </header>
  );
}
