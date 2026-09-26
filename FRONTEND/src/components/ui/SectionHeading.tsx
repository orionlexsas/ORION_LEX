import { cn } from '@/lib/cn';

interface SectionHeadingProps {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  /** Nivel del título: h2 en secciones, h1 cuando es el título de la página. */
  as?: 'h1' | 'h2';
  className?: string;
}

/** Encabezado de sección: etiqueta, título en serif y descripción. */
export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  align = 'left',
  as: Heading = 'h2',
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn(align === 'center' && 'mx-auto text-center', 'max-w-3xl', className)}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <Heading
        id={id}
        className={cn(
          'font-serif leading-[1.1] font-semibold tracking-tight',
          eyebrow && 'mt-3',
          Heading === 'h1'
            ? 'text-4xl sm:text-5xl lg:text-[3.4rem]'
            : 'text-3xl sm:text-4xl lg:text-[2.75rem]',
        )}
      >
        {title}
      </Heading>
      <span
        aria-hidden="true"
        className={cn('mt-5 block h-0.5 w-12 bg-accent', align === 'center' && 'mx-auto')}
      />
      {description && <p className="mt-5 text-lg leading-relaxed text-muted">{description}</p>}
    </div>
  );
}
