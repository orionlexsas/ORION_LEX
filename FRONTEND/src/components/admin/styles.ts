/** Clases compartidas por los formularios del panel. */

export const fieldClass =
  'w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-[0.92rem] text-foreground placeholder:text-muted/80 transition-colors focus:border-accent focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-accent/25 disabled:opacity-60';

export const labelClass = 'mb-1.5 block text-sm font-semibold text-foreground';

/** Botón con borde naranja (acciones secundarias del panel: "Ver todas", "Guardar cambios"). */
export const outlineAccentClass =
  'inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-accent px-4 text-sm font-semibold text-accent-text transition-colors hover:bg-accent/10 disabled:pointer-events-none disabled:opacity-50';

/** Botón discreto (íconos, cancelar). */
export const ghostClass =
  'inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:bg-foreground/5 disabled:pointer-events-none disabled:opacity-50';

/** Botón principal del panel (naranja). */
export const primaryClass =
  'inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-accent px-5 text-sm font-semibold text-on-accent shadow-sm transition-[background-color,transform] hover:bg-[color-mix(in_oklab,var(--color-accent)_88%,#000)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50';

export const dangerClass =
  'inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-danger/40 px-4 text-sm font-semibold text-danger transition-colors hover:bg-danger/10 disabled:pointer-events-none disabled:opacity-50';
