import { ArrowDown, ArrowUp, Plus, Trash } from 'lucide-react';
import { cn } from '@/lib/cn';
import { move } from '@/lib/move';
import { fieldClass, ghostClass, labelClass } from './styles';

interface RowActionsProps {
  index: number;
  count: number;
  onMove: (step: -1 | 1) => void;
  onRemove: () => void;
  /** Nombre del elemento para lectores de pantalla ("paso 2"). */
  name: string;
}

/** Botones subir, bajar y quitar de una fila. */
export function RowActions({ index, count, onMove, onRemove, name }: RowActionsProps) {
  const button =
    'grid size-9 cursor-pointer place-items-center rounded-lg text-muted hover:bg-foreground/8 hover:text-foreground disabled:pointer-events-none disabled:opacity-30';
  return (
    <div className="flex shrink-0 items-start gap-0.5">
      <button
        type="button"
        onClick={() => onMove(-1)}
        disabled={index === 0}
        aria-label={`Subir ${name}`}
        className={button}
      >
        <ArrowUp aria-hidden="true" className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => onMove(1)}
        disabled={index === count - 1}
        aria-label={`Bajar ${name}`}
        className={button}
      >
        <ArrowDown aria-hidden="true" className="size-4" />
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Quitar ${name}`}
        className={cn(button, 'hover:bg-danger/10 hover:text-danger')}
      >
        <Trash aria-hidden="true" className="size-4" />
      </button>
    </div>
  );
}

interface StringListProps {
  label: string;
  /** Nombre de cada elemento ("párrafo", "caso"). */
  itemName: string;
  values: string[];
  onChange: (values: string[]) => void;
  multiline?: boolean;
  hint?: string;
}

/** Lista de textos (párrafos, casos…) que se pueden agregar, ordenar y quitar. */
export function StringList({
  label,
  itemName,
  values,
  onChange,
  multiline,
  hint,
}: StringListProps) {
  const set = (index: number, value: string) =>
    onChange(values.map((v, i) => (i === index ? value : v)));

  return (
    <div>
      <span className={labelClass}>{label}</span>
      {hint && <p className="mb-2 text-xs text-muted">{hint}</p>}
      <ol className="space-y-2">
        {values.map((value, index) => (
          <li key={index} className="flex gap-2">
            {multiline ? (
              <textarea
                value={value}
                onChange={(e) => set(index, e.target.value)}
                rows={3}
                aria-label={`${itemName} ${index + 1}`}
                className={cn(fieldClass, 'resize-y')}
              />
            ) : (
              <input
                value={value}
                onChange={(e) => set(index, e.target.value)}
                aria-label={`${itemName} ${index + 1}`}
                className={fieldClass}
              />
            )}
            <RowActions
              index={index}
              count={values.length}
              name={`${itemName} ${index + 1}`}
              onMove={(step) => onChange(move(values, index, step))}
              onRemove={() => onChange(values.filter((_, i) => i !== index))}
            />
          </li>
        ))}
      </ol>
      <button
        type="button"
        onClick={() => onChange([...values, ''])}
        className={cn(ghostClass, 'mt-2 min-h-9 px-3 text-xs')}
      >
        <Plus aria-hidden="true" className="size-4" /> Agregar {itemName}
      </button>
    </div>
  );
}

interface RecordField<T> {
  key: keyof T & string;
  label: string;
  multiline?: boolean;
}

interface RecordListProps<T extends Record<string, string>> {
  label: string;
  itemName: string;
  values: T[];
  fields: RecordField<T>[];
  empty: T;
  onChange: (values: T[]) => void;
}

/** Lista de elementos con varios campos (pasos, preguntas, testimonios). */
export function RecordList<T extends Record<string, string>>({
  label,
  itemName,
  values,
  fields,
  empty,
  onChange,
}: RecordListProps<T>) {
  const set = (index: number, key: keyof T, value: string) =>
    onChange(values.map((v, i) => (i === index ? { ...v, [key]: value } : v)));

  return (
    <div>
      <span className={labelClass}>{label}</span>
      <ol className="space-y-3">
        {values.map((value, index) => (
          <li key={index} className="rounded-lg border border-border p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-muted">
                {itemName} {index + 1}
              </span>
              <RowActions
                index={index}
                count={values.length}
                name={`${itemName} ${index + 1}`}
                onMove={(step) => onChange(move(values, index, step))}
                onRemove={() => onChange(values.filter((_, i) => i !== index))}
              />
            </div>
            <div className="space-y-2">
              {fields.map((field) => (
                <label key={field.key} className="block">
                  <span className="mb-1 block text-xs font-medium">{field.label}</span>
                  {field.multiline ? (
                    <textarea
                      value={value[field.key]}
                      onChange={(e) => set(index, field.key, e.target.value)}
                      rows={3}
                      className={cn(fieldClass, 'resize-y')}
                    />
                  ) : (
                    <input
                      value={value[field.key]}
                      onChange={(e) => set(index, field.key, e.target.value)}
                      className={fieldClass}
                    />
                  )}
                </label>
              ))}
            </div>
          </li>
        ))}
      </ol>
      <button
        type="button"
        onClick={() => onChange([...values, { ...empty }])}
        className={cn(ghostClass, 'mt-2 min-h-9 px-3 text-xs')}
      >
        <Plus aria-hidden="true" className="size-4" /> Agregar {itemName}
      </button>
    </div>
  );
}
