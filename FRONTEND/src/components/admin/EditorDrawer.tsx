import { useEffect, useEffectEvent, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface EditorDrawerProps {
  title: string;
  onClose: () => void;
  /** Botones de guardar, abajo. */
  footer: ReactNode;
  children: ReactNode;
}

/** Panel lateral para editar un elemento (categoría, servicio, asunto). Escape lo cierra. */
export function EditorDrawer({ title, onClose, footer, children }: EditorDrawerProps) {
  const close = useEffectEvent(() => onClose());

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-40">
      <button
        type="button"
        tabIndex={-1}
        aria-label="Cerrar"
        className="absolute inset-0 bg-black/45"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="absolute inset-y-0 right-0 flex w-full max-w-[40rem] flex-col bg-background shadow-2xl"
      >
        <header className="flex items-center gap-3 border-b border-border px-5 py-4">
          <h2 className="flex-1 font-serif text-2xl font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar editor"
            className="grid size-10 cursor-pointer place-items-center rounded-lg text-muted hover:bg-foreground/5 hover:text-foreground"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </header>
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">{children}</div>
        <footer className="flex flex-wrap items-center justify-end gap-2.5 border-t border-border px-5 py-4">
          {footer}
        </footer>
      </section>
    </div>
  );
}
