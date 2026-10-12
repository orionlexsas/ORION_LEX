import { useState } from 'react';
import { LoaderCircle, Save } from 'lucide-react';
import type { PracticeService, ServiceItem } from '@orion-lex/shared';
import { EditorDrawer } from '@/components/admin/EditorDrawer';
import { Field } from '@/components/admin/Field';
import { MarkdownEditor } from '@/components/admin/MarkdownEditor';
import { Notice } from '@/components/admin/Notice';
import { UrlField } from '@/components/admin/UrlField';
import { fieldClass, ghostClass, primaryClass } from '@/components/admin/styles';
import { cn } from '@/lib/cn';
import { slugify } from '@/lib/slug';
import { newService, suggestedMessage } from '../lib/drafts';
import { ImageField } from './ImageField';

interface ServiceEditorProps {
  area: ServiceItem;
  service?: PracticeService;
  saving: boolean;
  error: string | null;
  onSave: (service: PracticeService) => void;
  onClose: () => void;
}

type Errors = Partial<Record<'title' | 'slug' | 'description' | 'message', string>>;

/** Crear o editar un servicio dentro de una categoría (página para compartir en anuncios). */
export function ServiceEditor({
  area,
  service,
  saving,
  error,
  onSave,
  onClose,
}: ServiceEditorProps) {
  const [initial] = useState(() => service ?? newService());
  const [draft, setDraft] = useState<PracticeService>(initial);
  const [touched, setTouched] = useState({ slug: !!service, message: !!service });
  const [errors, setErrors] = useState<Errors>({});
  const update = (patch: Partial<PracticeService>) => {
    setDraft((d) => ({ ...d, ...patch }));
    // El error de un campo desaparece en cuanto se corrige.
    setErrors((e) => {
      const next = { ...e };
      for (const key of Object.keys(patch)) delete next[key as keyof Errors];
      return next;
    });
  };
  const takenSlugs = area.services.filter((s) => s.slug !== service?.slug).map((s) => s.slug);

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
    if (!draft.title.trim()) next.title = 'Escribe el nombre del servicio.';
    if (!/^[a-z0-9-]+$/.test(draft.slug))
      next.slug = 'Escribe la URL (minúsculas, números y guiones).';
    else if (takenSlugs.includes(draft.slug))
      next.slug = 'Otro servicio de esta categoría ya usa esta URL.';
    if (!draft.description.trim()) next.description = 'Escribe el resumen.';
    if (!draft.message.trim()) next.message = 'Escribe el mensaje de WhatsApp.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    const seo = {
      title: draft.seo?.title?.trim() || undefined,
      description: draft.seo?.description?.trim() || undefined,
    };
    onSave({ ...draft, seo: seo.title || seo.description ? seo : undefined });
  };

  return (
    <EditorDrawer
      title={service ? 'Editar servicio' : `Nuevo servicio en ${area.title}`}
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
            {service ? 'Guardar cambios' : 'Crear servicio'}
          </button>
        </>
      }
    >
      <Field label="Nombre del servicio" required error={errors.title}>
        <input
          value={draft.title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          placeholder="Ej.: Despido sin justa causa"
          className={fieldClass}
        />
      </Field>

      <UrlField
        prefix={`/servicios/${area.slug}/`}
        value={draft.slug}
        saved={service?.slug ?? null}
        error={errors.slug}
        onChange={(slug) => {
          setTouched((t) => ({ ...t, slug: true }));
          update({ slug });
        }}
      />

      <Field
        label="Resumen"
        required
        error={errors.description}
        hint="1 o 2 frases. Sale en la tarjeta y debajo del título."
      >
        <textarea
          value={draft.description}
          onChange={(e) => update({ description: e.target.value })}
          rows={3}
          maxLength={300}
          className={cn(fieldClass, 'resize-y')}
        />
      </Field>

      <Field label="Explicación completa" group hint="Opcional. Subtítulos, listas y negritas.">
        <MarkdownEditor
          value={draft.body}
          onChange={(body) => update({ body })}
          label="Explicación completa del servicio"
          placeholder={
            '## ¿En qué consiste?\n\nExplique el servicio.\n\n## ¿Cómo le ayudamos?\n\n- Paso uno\n- Paso dos'
          }
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

      <ImageField
        label="Foto"
        value={draft.image}
        onChange={(image) => update({ image })}
        folder="areas"
        fileName={`${area.slug}-${draft.slug}`}
        hint={`Opcional. Si no eliges una, se usa la foto de ${area.title}.`}
      />

      <fieldset className="space-y-4 rounded-xl border border-border p-4">
        <legend className="px-1 text-sm font-semibold">Google y Facebook (opcional)</legend>
        <Field label="Título al compartir" hint="Si lo dejas vacío se usa el nombre del servicio.">
          <input
            value={draft.seo?.title ?? ''}
            onChange={(e) => update({ seo: { ...draft.seo, title: e.target.value } })}
            maxLength={70}
            className={fieldClass}
          />
        </Field>
        <Field label="Descripción al compartir" hint="Si la dejas vacía se usa el resumen.">
          <textarea
            value={draft.seo?.description ?? ''}
            onChange={(e) => update({ seo: { ...draft.seo, description: e.target.value } })}
            rows={2}
            maxLength={160}
            className={cn(fieldClass, 'resize-y')}
          />
        </Field>
      </fieldset>

      {error && <Notice tone="error">{error}</Notice>}
    </EditorDrawer>
  );
}
