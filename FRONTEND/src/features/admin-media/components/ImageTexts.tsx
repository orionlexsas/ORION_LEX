import { useState } from 'react';
import { LoaderCircle, Save, Type } from 'lucide-react';
import type { ImageTextBlock } from '@orion-lex/shared';
import { Notice } from '@/components/admin/Notice';
import { fieldClass, labelClass, primaryClass } from '@/components/admin/styles';
import { ApiRequestError } from '@/lib/api-client';
import { cn } from '@/lib/cn';
import { setFlash } from '@/lib/flash';
import { useImageTexts, useSaveImageTexts } from '../hooks/use-media';

interface ImageTextsProps {
  src: string;
  onSaved: (message: string) => void;
}

/** Textos que acompañan a la foto en la web, editables bloque por bloque. */
export function ImageTexts({ src, onSaved }: ImageTextsProps) {
  const { data: blocks, isPending, isError } = useImageTexts(src);

  if (isPending) return <p className="text-sm text-muted">Buscando los textos de esta foto…</p>;
  if (isError) return <Notice tone="error">No se pudieron cargar los textos.</Notice>;
  if (blocks.length === 0) {
    return (
      <p className="text-sm text-muted">
        Esta foto no tiene textos al lado en la web. Puedes cambiar la foto o usarla en una noticia.
      </p>
    );
  }
  return (
    <div className="space-y-4">
      {blocks.map((block) => (
        <TextBlockForm key={`${block.file}${block.pointer}`} block={block} onSaved={onSaved} />
      ))}
    </div>
  );
}

function TextBlockForm({
  block,
  onSaved,
}: {
  block: ImageTextBlock;
  onSaved: (message: string) => void;
}) {
  const initial = Object.fromEntries(block.fields.map((f) => [f.key, f.value]));
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [missing, setMissing] = useState<string[]>([]);
  const save = useSaveImageTexts();
  const changed = block.fields.filter((f) => values[f.key] !== f.value);

  const submit = () => {
    const empty = block.fields
      .filter((f) => !f.optional && !values[f.key]?.trim())
      .map((f) => f.key);
    setMissing(empty);
    if (empty.length > 0) return;
    setFlash('Textos guardados. Ya se ven en la web local.');
    save.mutate(
      {
        file: block.file,
        pointer: block.pointer,
        values: Object.fromEntries(changed.map((f) => [f.key, values[f.key] ?? ''])),
      },
      {
        onSuccess: (result) =>
          onSaved(
            `Textos guardados.${result.mode === 'github' ? ' La web se actualizará en 1–2 minutos.' : ' Ya se ven en la web local.'}`,
          ),
        onError: () => setFlash(null),
      },
    );
  };

  return (
    <section className="rounded-xl border border-border p-4">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
        <Type aria-hidden="true" className="size-4 text-accent" />
        {block.label}
      </h3>
      <div className="space-y-4">
        {block.fields.map((field) => {
          const props = {
            value: values[field.key] ?? '',
            onChange: (e: { target: { value: string } }) =>
              setValues((v) => ({ ...v, [field.key]: e.target.value })),
            className: cn(fieldClass, missing.includes(field.key) && 'border-danger'),
            'aria-invalid': missing.includes(field.key) || undefined,
          };
          return (
            <label key={field.key} className="block">
              <span className={labelClass}>
                {field.label}
                {!field.optional && <span className="text-danger"> *</span>}
              </span>
              {field.multiline ? (
                <textarea rows={3} {...props} className={cn(props.className, 'resize-y')} />
              ) : (
                <input {...props} />
              )}
              {missing.includes(field.key) && (
                <span role="alert" className="mt-1 block text-sm text-danger">
                  Este texto no puede quedar vacío.
                </span>
              )}
            </label>
          );
        })}
      </div>
      {save.isError && (
        <Notice tone="error" className="mt-4">
          {save.error instanceof ApiRequestError
            ? save.error.message
            : 'No se pudieron guardar los textos.'}
        </Notice>
      )}
      <div className="mt-4 flex items-center justify-end gap-3">
        {changed.length > 0 && (
          <button
            type="button"
            onClick={() => setValues(initial)}
            className="cursor-pointer text-sm text-muted hover:text-foreground"
          >
            Deshacer
          </button>
        )}
        <button
          type="button"
          onClick={submit}
          disabled={changed.length === 0 || save.isPending}
          className={primaryClass}
        >
          {save.isPending ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <Save aria-hidden="true" className="size-4" />
          )}
          Guardar textos
        </button>
      </div>
    </section>
  );
}
