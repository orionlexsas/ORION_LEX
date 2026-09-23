import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

const sizes = {
  default: 'max-w-[92rem]',
  wide: 'max-w-[102rem]',
};

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: keyof typeof sizes;
}

/** Ancho máximo y márgenes laterales comunes a todas las secciones. */
export function Container({ size = 'default', className, ...props }: ContainerProps) {
  return <div className={cn('mx-auto w-full px-5 sm:px-8', sizes[size], className)} {...props} />;
}
