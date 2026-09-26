import type { Ref } from 'react';
import { X } from 'lucide-react';
import type { ServiceItem } from '@orion-lex/shared';
import { CtaLink } from '@/components/cta/CtaLink';
import { ContentIcon } from '@/components/ui/ContentIcon';

interface PracticeAreaDialogProps {
  ref: Ref<HTMLDialogElement>;
  item?: ServiceItem;
  ctaLabel: string;
  closeLabel: string;
}

/**
 * Ventana con la explicación breve de un área. Usa <dialog> nativo: atrapa el foco, se cierra
 * con Escape y devuelve el foco a la tarjeta al cerrar. Un clic fuera del recuadro también cierra.
 */
export function PracticeAreaDialog({ ref, item, ctaLabel, closeLabel }: PracticeAreaDialogProps) {
  return (
    <dialog
      ref={ref}
      aria-labelledby="practice-area-title"
      onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
      className="m-auto w-[min(34rem,calc(100vw-2rem))] rounded-lg bg-background p-0 text-foreground shadow-2xl backdrop:bg-black/60"
    >
      {item && (
        <div className="p-7 sm:p-9">
          <div className="flex items-start justify-between gap-4">
            <ContentIcon name={item.icon} className="size-9 text-accent" strokeWidth={1.4} />
            <form method="dialog">
              <button
                type="submit"
                aria-label={closeLabel}
                className="grid size-10 cursor-pointer place-items-center rounded-full border border-border transition-colors hover:border-foreground"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </form>
          </div>
          <h3 id="practice-area-title" className="mt-5 font-serif text-3xl font-semibold">
            {item.title}
          </h3>
          <span aria-hidden="true" className="mt-4 block h-0.5 w-10 bg-accent" />
          <p className="mt-5 text-lg leading-relaxed text-foreground/85">{item.details}</p>
          <CtaLink
            link={{ label: ctaLabel, href: 'whatsapp', message: item.message }}
            location={`practice_area_${item.slug}`}
            className="mt-8 w-full sm:w-auto"
          />
        </div>
      )}
    </dialog>
  );
}
