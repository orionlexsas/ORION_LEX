import type { ApproachContent } from '@orion-lex/shared';
import { ContentIcon } from '@/components/ui/ContentIcon';
import { useThemedImage } from '@/hooks/use-themed-image';
import { cn } from '@/lib/cn';

interface ApproachStepProps {
  step: ApproachContent['steps'][number];
  number: number;
  /** Dibuja la línea que une esta tarjeta con la siguiente (solo en escritorio). */
  connectToNext: boolean;
}

/** Tarjeta de un paso del proceso: número, ícono, texto y foto. */
export function ApproachStep({ step, number, connectToNext }: ApproachStepProps) {
  const photo = useThemedImage(step.image);

  return (
    <li
      className={cn(
        'relative flex flex-col rounded-xl border border-gold/30 bg-surface/80 px-5 pt-12 pb-5 backdrop-blur-sm sm:px-7',
        connectToNext &&
          'lg:after:absolute lg:after:top-4 lg:after:-right-8 lg:after:h-px lg:after:w-8 lg:after:bg-gold/40',
      )}
    >
      <span
        aria-hidden="true"
        className="absolute -top-7 left-7 grid size-14 place-items-center rounded-full border-[1.5px] border-gold bg-background text-lg font-semibold text-gold"
      >
        {String(number).padStart(2, '0')}
      </span>

      <div className="flex items-start gap-5">
        <span className="grid size-16 shrink-0 place-items-center rounded-full bg-gold/12 text-gold lg:size-[5.25rem]">
          <ContentIcon name={step.icon} className="size-8 lg:size-10" strokeWidth={1.3} />
        </span>
        <div>
          <h3 className="max-w-[12rem] font-serif text-[1.65rem] leading-[1.08] font-bold text-balance lg:text-[1.95rem]">
            <span className="sr-only">{number}. </span>
            {step.title}
          </h3>
          <p className="mt-3 text-[0.95rem] leading-snug text-foreground/80 lg:text-[1.05rem]">
            {step.description}
          </p>
        </div>
      </div>

      <div className="relative mt-6 overflow-hidden rounded-lg">
        <img
          src={photo.src}
          alt={photo.alt}
          loading="lazy"
          decoding="async"
          className="aspect-[2/1] w-full object-cover"
        />
        {/* La foto se funde con la tarjeta por arriba */}
        <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-surface to-transparent" />
      </div>
    </li>
  );
}
