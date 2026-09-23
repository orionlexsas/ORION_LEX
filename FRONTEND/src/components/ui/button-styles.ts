import { cn } from '@/lib/cn';

type Variant = 'gold' | 'outline';
type Size = 'md' | 'lg';

export interface ButtonStyleOptions {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  gold: 'bg-gold-gradient text-gold-ink shadow-[0_8px_24px_-8px_color-mix(in_oklab,var(--color-gold)_55%,transparent)] hover:brightness-105',
  outline: 'border border-border bg-foreground/5 text-foreground hover:bg-foreground/10',
};

const sizes: Record<Size, string> = {
  md: 'min-h-12 px-6 text-base',
  lg: 'min-h-14 px-8 text-lg',
};

/** Clases compartidas por botones, enlaces internos y enlaces externos con forma de botón. */
export function buttonStyles({ variant = 'gold', size = 'md' }: ButtonStyleOptions = {}) {
  return cn(
    'inline-flex items-center justify-center gap-3 rounded-md font-semibold whitespace-nowrap',
    'transition-[filter,background-color,transform] duration-200 ease-out-soft active:scale-[0.98]',
    'disabled:pointer-events-none disabled:opacity-50',
    variants[variant],
    sizes[size],
  );
}
