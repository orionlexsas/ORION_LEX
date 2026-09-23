import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Combina clases de Tailwind resolviendo conflictos (p. ej. `px-2` vs `px-4`). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
