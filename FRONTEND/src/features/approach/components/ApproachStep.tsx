import type { CSSProperties } from 'react';
import type { ApproachContent } from '@orion-lex/shared';
import { cn } from '@/lib/cn';

interface ApproachStepProps {
  step: ApproachContent['steps'][number];
  number: number;
  /** true cuando la lista entró en pantalla: dispara la aparición escalonada. */
  visible: boolean;
}

/**
 * Tarjeta de una etapa: foto arriba, número grande y tenue detrás del título, y el punto
 * naranja donde termina la línea que une las etapas (solo en escritorio).
 */
export function ApproachStep({ step, number, visible }: ApproachStepProps) {
  const label = String(number).padStart(2, '0');

  return (
    <li
      style={{ '--delay': `${(number - 1) * 120}ms` } as CSSProperties}
      className={cn(
        'group relative flex flex-col rounded-md border border-border bg-background shadow-[0_1px_6px_-3px_rgb(0_0_0/0.08)]',
        'transition-[opacity,translate,box-shadow] duration-500 ease-out-soft [transition-delay:var(--delay)]',
        'hover:-translate-y-[3px] hover:shadow-[0_14px_30px_-20px_rgb(0_0_0/0.3)] hover:[transition-delay:0ms] hover:duration-200',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
      )}
    >
      {/* Punto naranja donde llega la línea de conexión */}
      <span
        aria-hidden="true"
        className="absolute -top-[7px] left-1/2 z-10 hidden size-3 -translate-x-1/2 rounded-full bg-accent ring-4 ring-transparent transition-[box-shadow,scale] duration-200 group-hover:scale-125 group-hover:ring-accent/20 lg:block"
      />
      <img
        src={step.image.src}
        alt={step.image.alt}
        loading="lazy"
        decoding="async"
        width={1012}
        height={596}
        className="aspect-[1.7/1] w-full rounded-t-md object-cover"
      />
      <div className="relative flex-1 px-6 pt-10 pb-8 sm:px-7 lg:px-6 lg:pt-12">
        <span
          aria-hidden="true"
          className="absolute top-2 left-5 font-serif text-[5.5rem] leading-none font-semibold text-accent/12 select-none sm:text-[6.5rem] lg:top-3"
        >
          {label}
        </span>
        <div className="relative pl-16 sm:pl-20 lg:pl-14">
          <h3 className="font-serif text-[1.55rem] leading-tight font-semibold tracking-tight lg:text-[1.5rem] xl:text-[1.6rem]">
            <span className="sr-only">{label}. </span>
            {step.title}
          </h3>
          <p className="mt-2 text-[1.02rem] leading-relaxed text-foreground/75">
            {step.description}
          </p>
        </div>
      </div>
    </li>
  );
}
