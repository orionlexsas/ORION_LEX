import { useState } from 'react';
import { LoaderCircle, Save } from 'lucide-react';
import type { ServiceItem } from '@orion-lex/shared';
import { EditorDrawer } from '@/components/admin/EditorDrawer';
import { Field } from '@/components/admin/Field';
import { IconSelect } from '@/components/admin/IconSelect';
import { Notice } from '@/components/admin/Notice';
import { Switch } from '@/components/admin/Switch';
import { UrlField } from '@/components/admin/UrlField';
import { fieldClass, ghostClass, labelClass, primaryClass } from '@/components/admin/styles';
import { cn } from '@/lib/cn';
import { slugify } from '@/lib/slug';
import { newArea, suggestedMessage } from '../lib/drafts';
import { ImageField } from './ImageField';

interface AreaEditorProps {
  area?: ServiceItem;
  /** URLs de las demás categorías (para avisar si se repite). */
  takenSlugs: string[];
  saving: boolean;
  error: string | null;
  onSave: (area: ServiceItem) => void;
  onClose: () => void;
}

type Errors = Partial<
  Record<'title' | 'slug' | 'description' | 'details' | 'message' | 'image', string>
>;

/** Crear o editar una categoría de servicios (área del derecho). */
export function AreaEditor({ area, takenSlugs, saving, error, onSave, onClose }: AreaEditorProps) {
  const [initial] = useState(() => area ?? newArea());
  const [draft, setDraft] = useState<ServiceItem>(initial);
  const [touched, setTouched] = useState({ slug: !!area, message: !!area });
  const [errors, setErrors] = useState<Errors>({});
  const update = (patch: Partial<ServiceItem>) => {
    setDraft((d) => ({ ...d, ...patch }));
    // El error de un campo desaparece en cuanto se corrige.
    setErrors((e) => {
      const next = { ...e };
      for (const key of Object.keys(patch)) delete next[key as keyof Errors];
      return next;
    });
  };

  const setTitle = (title: string) =>
    update({
      title,
      ...(touched.slug ? {} : { slug: slugify(title) }),
      ...(touched.message ? {} : { message: suggestedMessage(title) }),
    });

  const close = () => {
    const dirty = JSON.stringify(draft) !== JSON.stringify(initial);
    if (!dirty || window.confirm('Hay cambios sin guardar. ¿Cerrar de todos modos?')) onClose();
  };

  const submit = () => {
    const next: Errors = {};
    if (!draft.title.trim()) next.title = 'Escribe el nombre de la categoría.';
    if (!/^[a-z0-9-]+$/.test(draft.slug))
      next.slug = 'Escribe la URL (minúsculas, números y guiones).';
    else if (takenSlugs.includes(draft.slug)) next.slug = 'Otra categoría ya usa esta URL.';
    if (!draft.description.trim()) next.description = 'Escribe la descripción corta.';
    if (!draft.details.trim()) next.details = 'Escribe la explicación.';
    if (!draft.message.trim()) next.message = 'Escribe el mensaje de WhatsApp.';
    if (!draft.image.src) next.image = 'Elige una foto.';
    setErrors(next);
    if (Object.keys(next).length === 0) onSave(draft);
  };

  return (
    <EditorDrawer
      title={area ? 'Editar categoría' : 'Nueva categoría'}
      onClose={close}
      footer={
        <>
          <button type="button" onClick={close} className={ghostClass}>
            Cancelar
          </button>
          <button type="button" onClick={submit} disabled={saving} className={primaryClass}>
            {saving ? (
              <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              <Save aria-hidden="true" className="size-4" />
            )}
            {area ? 'Guardar cambios' : 'Crear categoría'}
          </button>
        </>
      }
    >
      <Field label="Nombre de la categoría" required error={errors.title}>
        <input
          value={draft.title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={80}
          placeholder="Ej.: Derecho laboral"
          className={fieldClass}
        />
      </Field>

      <UrlField
        prefix="/servicios/"
        value={draft.slug}
        saved={area?.slug ?? null}
        error={errors.slug}
        onChange={(slug) => {
          setTouched((t) => ({ ...t, slug: true }));
          update({ slug });
        }}
      />

      <div>
        <span className={labelClass}>Ícono de la tarjeta</span>
        <IconSelect value={draft.icon} onChange={(icon) => update({ icon })} />
      </div>

      <ImageField
        label="Foto"
        required
        value={draft.image.src ? draft.image : undefined}
        onChange={(image) => update({ image: image ?? { src: '', alt: '' } })}
        folder="areas"
        fileName={draft.slug}
        hint="Horizontal, idealmente 1200 × 900 px. Sale en la tarjeta y en la página."
      />
      {errors.image && <p className="-mt-3 text-sm text-danger">{errors.image}</p>}

      <Field
        label="Descripción corta"
        required
        error={errors.description}
        hint="Una frase. Sale en la tarjeta de la categoría."
      >
        <textarea
          value={draft.description}
          onChange={(e) => update({ description: e.target.value })}
          rows={2}
          className={cn(fieldClass, 'resize-y')}
        />
      </Field>

      <Field
        label="Explicación"
        required
        error={errors.details}
        hint="Sale en la página de la categoría, arriba de sus servicios."
      >
        <textarea
          value={draft.details}
          onChange={(e) => update({ details: e.target.value })}
          rows={4}
          className={cn(fieldClass, 'resize-y')}
        />
      </Field>

      <Field
        label="Mensaje de WhatsApp"
        required
        error={errors.message}
        hint="Texto que ya aparece escrito cuando el cliente pulsa el botón."
      >
        <textarea
          value={draft.message}
          onChange={(e) => {
            setTouched((t) => ({ ...t, message: true }));
            update({ message: e.target.value });
          }}
          rows={2}
          className={cn(fieldClass, 'resize-y')}
        />
      </Field>

      <Switch
        checked={draft.featured}
        onChange={(featured) => update({ featured })}
        label="Categoría destacada"
        description="Sale primero y con tarjeta grande en Servicios jurídicos. Solo puede haber una."
      />

      {error && <Notice tone="error">{error}</Notice>}
    </EditorDrawer>
  );
}
