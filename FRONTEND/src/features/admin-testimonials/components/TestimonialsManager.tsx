import { useEffect, useState } from 'react';
import { Pencil, Plus, Quote } from 'lucide-react';
import { adminTestimonialSchema, type AdminTestimonial } from '@orion-lex/shared';
import { Field } from '@/components/admin/Field';
import { RowActions } from '@/components/admin/ListField';
import { Modal } from '@/components/admin/Modal';
import { Notice } from '@/components/admin/Notice';
import { PageHeader } from '@/components/admin/PageHeader';
import { fieldClass, ghostClass, primaryClass } from '@/components/admin/styles';
import { errorMessage } from '@/lib/api-client';
import { cn } from '@/lib/cn';
import { setFlash, takeFlash } from '@/lib/flash';
import { move } from '@/lib/move';
import { useSaveTestimonials, useTestimonials } from '../hooks/use-testimonials';

/** Límites de cada campo (los mismos que valida la API). */
const MAX = { name: 80, service: 60, text: 320 };
const EMPTY: AdminTestimonial = { name: '', service: '', text: '' };

/**
 * Testimonios de la portada: lista en el orden de la web, con agregar, editar, subir/bajar y
 * eliminar. Cada cambio se guarda de inmediato (en Vercel, la web se actualiza en 1–2 minutos).
 */
export function TestimonialsManager() {
  const { data, isPending, isError, error } = useTestimonials();
  const save = useSaveTestimonials();
  // null = cerrado; -1 = nuevo; n = editando el testimonio n.
  const [editing, setEditing] = useState<number | null>(null);
  const [message, setMessageState] = useState<string | null>(() => takeFlash());
  const items = data?.items ?? [];

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setFlash(null), 5000);
    return () => clearTimeout(timer);
  }, [message]);

  const persist = (next: AdminTestimonial[], text: string, after?: () => void) =>
    save.mutate(
      { items: next },
      {
        onSuccess: (result) => {
          after?.();
          const full = `${text}${result.mode === 'github' ? ' La web se actualizará en 1–2 minutos.' : ''}`;
          setFlash(full); // por si Vite recarga la página en local
          setMessageState(full);
        },
      },
    );

  const remove = (index: number) => {
    const item = items[index];
    if (!item || !window.confirm(`¿Eliminar el testimonio de "${item.name}"?`)) return;
    persist(
      items.filter((_, i) => i !== index),
      'Testimonio eliminado.',
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Testimonios"
        description="Las reseñas de clientes que se ven en la portada, en este orden. Publique solo testimonios reales y con permiso del cliente."
        actions={
          <button type="button" onClick={() => setEditing(-1)} className={primaryClass}>
            <Plus aria-hidden="true" className="size-4" />
            Nuevo testimonio
          </button>
        }
      />

      {message && (
        <Notice tone="success">
          <span className="flex items-center justify-between gap-4">
            {message}
            <button
              type="button"
              onClick={() => setMessageState(null)}
              className="cursor-pointer text-xs font-semibold text-muted hover:text-foreground"
            >
              Cerrar
            </button>
          </span>
        </Notice>
      )}
      {save.isError && (
        <Notice tone="error">
          {errorMessage(save.error, 'No se pudo guardar. Intenta de nuevo.')}
        </Notice>
      )}

      {isPending ? (
        <p className="py-10 text-center text-muted">Cargando testimonios…</p>
      ) : isError ? (
        <Notice tone="error">
          {errorMessage(error, 'No se pudieron cargar los testimonios. Recarga la página.')}
        </Notice>
      ) : items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-10 text-center text-muted">
          Aún no hay testimonios. Mientras la lista esté vacía, la sección no aparece en la web.
        </p>
      ) : (
        <ol className="space-y-3">
          {items.map((item, i) => (
            <li
              key={item.name}
              className={cn(
                'flex gap-4 rounded-2xl border border-border bg-background p-4 shadow-sm sm:p-5',
                save.isPending && 'opacity-60',
              )}
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
                <Quote aria-hidden="true" className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{item.name}</p>
                <p className="text-xs font-semibold tracking-wider text-accent-text uppercase">
                  {item.service}
                </p>
                <p className="mt-1.5 line-clamp-2 text-sm text-muted">{item.text}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-start">
                <button
                  type="button"
                  onClick={() => setEditing(i)}
                  className={cn(ghostClass, 'min-h-9 px-3')}
                >
                  <Pencil aria-hidden="true" className="size-4" />
                  Editar
                </button>
                <RowActions
                  index={i}
                  count={items.length}
                  name={item.name}
                  onMove={(step) => persist(move(items, i, step), 'Orden guardado.')}
                  onRemove={() => remove(i)}
                />
              </div>
            </li>
          ))}
        </ol>
      )}

      {editing !== null && (
        <TestimonialForm
          initial={editing === -1 ? EMPTY : (items[editing] ?? EMPTY)}
          isNew={editing === -1}
          saving={save.isPending}
          takenNames={items.filter((_, i) => i !== editing).map((t) => t.name.toLowerCase())}
          onClose={() => setEditing(null)}
          onSave={(item) => {
            const next =
              editing === -1 ? [...items, item] : items.map((t, i) => (i === editing ? item : t));
            persist(next, editing === -1 ? 'Testimonio agregado.' : 'Cambios guardados.', () =>
              setEditing(null),
            );
          }}
        />
      )}
    </div>
  );
}

interface TestimonialFormProps {
  initial: AdminTestimonial;
  isNew: boolean;
  saving: boolean;
  takenNames: string[];
  onClose: () => void;
  onSave: (item: AdminTestimonial) => void;
}

function TestimonialForm({
  initial,
  isNew,
  saving,
  takenNames,
  onClose,
  onSave,
}: TestimonialFormProps) {
  const [draft, setDraft] = useState(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof AdminTestimonial, string>>>({});
  const set = (key: keyof AdminTestimonial) => (value: string) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const submit = () => {
    const parsed = adminTestimonialSchema.safeParse(draft);
    const next: typeof errors = {};
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof AdminTestimonial;
        next[key] ??= 'Este campo es obligatorio';
      }
    } else if (takenNames.includes(parsed.data.name.toLowerCase())) {
      next.name = 'Ya hay un testimonio con este nombre';
    }
    setErrors(next);
    if (parsed.success && Object.keys(next).length === 0) onSave(parsed.data);
  };

  return (
    <Modal
      title={isNew ? 'Nuevo testimonio' : 'Editar testimonio'}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className={ghostClass}>
            Cancelar
          </button>
          <button type="button" onClick={submit} disabled={saving} className={primaryClass}>
            {saving ? 'Guardando…' : isNew ? 'Agregar' : 'Guardar'}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <Field
          label="Nombre del cliente"
          required
          error={errors.name}
          hint={`${draft.name.length}/${MAX.name}`}
        >
          <input
            value={draft.name}
            maxLength={MAX.name}
            onChange={(e) => set('name')(e.target.value)}
            placeholder="María Fernanda Rodríguez López"
            className={fieldClass}
          />
        </Field>
        <Field
          label="Asunto que se atendió"
          required
          error={errors.service}
          hint={`${draft.service.length}/${MAX.service}`}
        >
          <input
            value={draft.service}
            maxLength={MAX.service}
            onChange={(e) => set('service')(e.target.value)}
            placeholder="Derecho laboral"
            className={fieldClass}
          />
        </Field>
        <Field
          label="Testimonio"
          required
          error={errors.text}
          hint={`${draft.text.length}/${MAX.text} · Ideal: unos 250 caracteres para que quepa en la tarjeta`}
        >
          <textarea
            value={draft.text}
            maxLength={MAX.text}
            rows={5}
            onChange={(e) => set('text')(e.target.value)}
            placeholder="Lo que cuenta el cliente sobre cómo le fue."
            className={cn(fieldClass, 'resize-y')}
          />
        </Field>
      </div>
    </Modal>
  );
}
