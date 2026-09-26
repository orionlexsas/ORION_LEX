import { useId, useState } from 'react';
import { Plus } from 'lucide-react';
import type { FaqItem as FaqItemContent } from '@orion-lex/shared';
import { cn } from '@/lib/cn';

/** Pregunta desplegable (patrón "acordeón" accesible: botón con aria-expanded). */
export function FaqItem({ item }: { item: FaqItemContent }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="border-b border-border">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
          className="group flex w-full cursor-pointer items-center justify-between gap-6 py-5 text-left text-lg font-medium transition-colors hover:text-accent-text"
        >
          {item.question}
          <span
            aria-hidden="true"
            className={cn(
              'grid size-9 shrink-0 place-items-center rounded-full border border-border transition-colors duration-300 group-hover:border-accent',
              open && 'border-accent bg-accent text-on-accent',
            )}
          >
            <Plus
              className={cn(
                'size-4 transition-transform duration-300 ease-out-soft',
                open && 'rotate-45',
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
          'grid transition-[grid-template-rows,opacity] duration-400 ease-out-soft',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden" inert={!open}>
          <p className="max-w-3xl pr-12 pb-6 leading-relaxed text-foreground/80">{item.answer}</p>
        </div>
      </div>
    </div>
  );
}
