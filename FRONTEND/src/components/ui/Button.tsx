import type { ButtonHTMLAttributes } from 'react';
import { Link, type LinkProps } from 'react-router';
import { cn } from '@/lib/cn';

type Variant = 'gold' | 'outline';
type Size = 'md' | 'lg';

interface StyleOptions {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  gold: 'bg-gold-gradient text-on-gold shadow-[0_8px_24px_-8px_rgb(227_191_118/0.55)] hover:brightness-105',
  outline: 'border border-border bg-white/5 text-foreground hover:bg-white/10',
};

const sizes: Record<Size, string> = {
  md: 'min-h-12 px-6 text-base',
  lg: 'min-h-14 px-8 text-lg',
};

/** Clases compartidas por botones y enlaces con forma de botón. */
function buttonStyles({ variant = 'gold', size = 'md' }: StyleOptions = {}) {
  return cn(
    'inline-flex items-center justify-center gap-3 rounded-md font-semibold whitespace-nowrap',
    'transition-[filter,background-color,transform] duration-200 ease-out-soft active:scale-[0.98]',
    'disabled:pointer-events-none disabled:opacity-50',
    variants[variant],
    sizes[size],
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & StyleOptions;

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return <button className={cn(buttonStyles({ variant, size }), className)} {...props} />;
}

type ButtonLinkProps = LinkProps & StyleOptions;

/** Enlace de navegación con apariencia de botón. */
export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link className={cn(buttonStyles({ variant, size }), className)} {...props} />;
}
