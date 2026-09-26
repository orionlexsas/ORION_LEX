import { cn } from '@/lib/cn';

/**
 * - `primary`: naranja de marca con texto negro (7.8:1). Un solo botón principal por pantalla.
 * - `ink`: negro de marca con texto blanco (acciones secundarias fuertes).
 * - `outline`: borde discreto.
 */
type Variant = 'primary' | 'ink' | 'outline';
type Size = 'md' | 'lg';

export interface ButtonStyleOptions {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-on-accent hover:bg-[color-mix(in_oklab,var(--color-accent)_88%,#000)]',
  ink: 'bg-ink text-white hover:bg-[color-mix(in_oklab,var(--color-ink)_82%,#fff)] dark:bg-white dark:text-ink dark:hover:bg-white/85',
  outline:
    'border border-foreground/25 text-foreground hover:border-foreground hover:bg-foreground/5',
};

const sizes: Record<Size, string> = {
  md: 'min-h-12 px-6 text-[0.95rem]',
  lg: 'min-h-14 px-8 text-base',
};

/** Clases compartidas por botones, enlaces internos y enlaces externos con forma de botón. */
export function buttonStyles({ variant = 'primary', size = 'md' }: ButtonStyleOptions = {}) {
  return cn(
    'inline-flex items-center justify-center gap-2.5 rounded-md font-semibold text-center',
    'transition-[background-color,border-color,color,transform] duration-200 ease-out-soft active:scale-[0.98]',
    'disabled:pointer-events-none disabled:opacity-50',
    variants[variant],
    sizes[size],
  );
}
