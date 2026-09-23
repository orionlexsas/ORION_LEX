import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { FaqContent } from '@orion-lex/shared';
import { cn } from '@/lib/cn';

/** Pregunta desplegable (patrón "acordeón" accesible: botón con aria-expanded). */
export function FaqItem({ item }: { item: FaqContent['items'][number] }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="border-t border-gold/40 last:border-b">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
          className="group flex w-full items-center justify-between gap-6 py-6 text-left text-lg transition-colors hover:text-gold lg:py-7 lg:text-[1.3rem]"
        >
          {item.question}
          <span
            aria-hidden="true"
            className={cn(
              'grid size-11 shrink-0 place-items-center rounded-full border-[1.5px] border-gold/70 text-gold transition-colors duration-300 group-hover:border-gold lg:size-12',
              open && 'bg-gold text-on-gold',
            )}
          >
            <ChevronDown
              className={cn(
                'size-5 transition-transform duration-500 ease-out-soft',
                open && 'rotate-180',
              )}
            />
          </span>
        </button>
      </h3>
      {/* La fila de la cuadrícula pasa de 0fr a 1fr: anima la altura sin medirla. */}
      <div
        id={panelId}
        role="region"
        aria-label={item.question}
        className={cn(
          'grid transition-[grid-template-rows,opacity] duration-500 ease-out-soft',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden" inert={!open}>
          <p className="max-w-[34rem] pr-16 pb-7 leading-relaxed text-foreground/80 lg:text-[1.05rem]">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
}
