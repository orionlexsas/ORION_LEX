import { useState } from 'react';
import {
  ClipboardList,
  Eye,
  Image as ImageIcon,
  LoaderCircle,
  Pencil,
  Plus,
  Send,
  Trash,
  X,
} from 'lucide-react';
import { adminArticleSaveSchema, type AdminArticle, type AdminCategory } from '@orion-lex/shared';
import { Field } from '@/components/admin/Field';
import { ImagePicker } from '@/components/admin/ImagePicker';
import { MarkdownEditor } from '@/components/admin/MarkdownEditor';
import { Modal } from '@/components/admin/Modal';
import { Notice } from '@/components/admin/Notice';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Switch } from '@/components/admin/Switch';
import {
  dangerClass,
  fieldClass,
  ghostClass,
  labelClass,
  outlineAccentClass,
  primaryClass,
} from '@/components/admin/styles';
import { Markdown } from '@/components/ui/Markdown';
import { ApiRequestError } from '@/lib/api-client';
import { cn } from '@/lib/cn';
import { setFlash, setPendingOpen } from '@/lib/flash';
import { formatDate } from '@/lib/format';
import { useDeleteArticle, useImageChoices, useSaveArticle } from '../hooks/use-articles';
import { draftFrom, slugify, toPayload, type ArticleDraft } from '../lib/editor';

type Tab = 'content' | 'seo' | 'settings';
type FieldErrors = Partial<
  Record<'title' | 'excerpt' | 'body' | 'category' | 'slug' | 'date' | 'sources' | 'seo', string>
>;

const FIELD_TAB: Record<keyof FieldErrors, Tab> = {
  title: 'content',
  excerpt: 'content',
  body: 'content',
  category: 'content',
  slug: 'seo',
  seo: 'seo',
  date: 'settings',
  sources: 'settings',
};

const FIELD_MESSAGES: Record<keyof FieldErrors, string> = {
  title: 'Escribe el título (máximo 160 caracteres).',
  excerpt: 'Escribe el extracto (máximo 300 caracteres).',
  body: 'Escribe el contenido de la noticia.',
  category: 'Elige una categoría.',
  slug: 'La URL solo puede tener letras minúsculas sin tildes, números y guiones.',
  seo: 'Revisa la descripción para Google.',
  date: 'Elige una fecha válida.',
  sources: 'Cada fuente necesita un nombre y un enlace que empiece por https://',
};

const SITE = 'https://orionlex.co';

/** En móvil los dos botones de guardar caben en una sola fila. */
const FOOTER_BUTTON = 'max-sm:px-3 max-sm:text-[0.8rem]';

interface ArticleEditorProps {
  article?: AdminArticle;
  categories: AdminCategory[];
  onClose: () => void;
  onSaved: (slug: string, message: string) => void;
  onDeleted: (message: string) => void;
}

/** Panel lateral para crear o editar una noticia. */
export function ArticleEditor({
  article,
  categories,
  onClose,
  onSaved,
  onDeleted,
}: ArticleEditorProps) {
  const [initial] = useState(() => draftFrom(article, categories[0]?.slug ?? ''));
  const [draft, setDraft] = useState<ArticleDraft>(initial);
  const [tab, setTab] = useState<Tab>('content');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [picking, setPicking] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const choices = useImageChoices(picking);
  const save = useSaveArticle();
  const remove = useDeleteArticle();

  const isNew = !article;
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);
  const busy = save.isPending || remove.isPending;

  const update = (patch: Partial<ArticleDraft>) => setDraft((d) => ({ ...d, ...patch }));
  const setTitle = (title: string) =>
    update(draft.slugTouched ? { title } : { title, slug: slugify(title) });

  const close = () => {
    if (!dirty || window.confirm('Hay cambios sin guardar. ¿Cerrar de todos modos?')) onClose();
  };

  const submit = (published: boolean) => {
    const payload = toPayload(draft, published);
    const parsed = adminArticleSaveSchema.safeParse(payload);
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[1] as keyof FieldErrors;
        if (key in FIELD_MESSAGES) next[key] ??= FIELD_MESSAGES[key];
      }
      setErrors(next);
      // Se abre la primera pestaña (en orden) que tenga errores.
      const tabs: Tab[] = ['content', 'seo', 'settings'];
      const first = tabs.find((t) =>
        Object.keys(next).some((k) => FIELD_TAB[k as keyof FieldErrors] === t),
      );
      if (first) setTab(first);
      return;
    }
    setErrors({});
    const action = published && !article?.published ? 'Noticia publicada.' : 'Cambios guardados.';
    // Por si la página se recarga antes de la respuesta (en local): mensaje y noticia a reabrir.
    setFlash(`${action} Ya se ven en la web local.`);
    setPendingOpen(draft.slug);
    save.mutate(
      { originalSlug: article?.slug ?? null, data: payload },
      {
        onSuccess: (result) => {
          setPendingOpen(null);
          const when =
            result.mode === 'github'
              ? ' La web se actualizará en 1–2 minutos.'
              : ' Ya se ven en la web local.';
          onSaved(result.article.slug, action + when);
        },
        onError: (error) => {
          setFlash(null);
          setPendingOpen(null);
          if (error instanceof ApiRequestError && error.code === 'SLUG_TAKEN') {
            setErrors({ slug: 'Ya existe otra noticia con esta URL. Cámbiala.' });
            setTab('seo');
          }
        },
      },
    );
  };

  const confirmDelete = () => {
    if (!article) return;
    if (
      !window.confirm(`¿Eliminar la noticia "${article.title}"? Esta acción no se puede deshacer.`)
    )
      return;
    remove.mutate(article.slug, {
      onSuccess: (result) =>
        onDeleted(
          `Noticia eliminada.${result.mode === 'github' ? ' La web se actualizará en 1–2 minutos.' : ''}`,
        ),
    });
  };

  const requestError = save.error ?? remove.error;
  const showRequestError =
    requestError &&
    !(requestError instanceof ApiRequestError && requestError.code === 'SLUG_TAKEN');

  return (
    <section
      aria-label={isNew ? 'Nueva noticia' : 'Editar noticia'}
      className="flex h-full flex-col bg-background"
    >
      <header className="flex items-center gap-3 border-b border-border px-5 pt-5 pb-4">
        <ClipboardList
          aria-hidden="true"
          className="size-6 shrink-0 text-foreground"
          strokeWidth={1.6}
        />
        <h2 className="flex-1 font-serif text-2xl font-semibold">
          {isNew ? 'Nueva noticia' : 'Editar noticia'}
        </h2>
        {!isNew && <StatusBadge published={article.published} />}
        <button
          type="button"
          onClick={close}
          aria-label="Cerrar editor"
          className="grid size-10 cursor-pointer place-items-center rounded-lg text-muted hover:bg-foreground/5 hover:text-foreground"
        >
          <X aria-hidden="true" className="size-5" />
        </button>
      </header>

      <div role="tablist" className="flex gap-2 border-b border-border px-5">
        {(
          [
            ['content', 'Contenido'],
            ['seo', 'SEO'],
            ['settings', 'Configuración'],
          ] as const
        ).map(([value, label]) => {
          const hasError = Object.entries(errors).some(
            ([field]) => FIELD_TAB[field as keyof FieldErrors] === value,
          );
          return (
            <button
              key={value}
              role="tab"
              type="button"
              aria-selected={tab === value}
              onClick={() => setTab(value)}
              className={cn(
                '-mb-px cursor-pointer border-b-2 px-3 py-3 text-sm font-semibold',
                tab === value
                  ? 'border-accent text-accent-text'
                  : 'border-transparent text-muted hover:text-foreground',
              )}
            >
              {label}
              {hasError && (
                <span className="ml-1.5 inline-block size-2 rounded-full bg-danger align-middle" />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
        {tab === 'content' && (
          <>
            <Field label="Título" required error={errors.title}>
              <input
                value={draft.title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={160}
                className={fieldClass}
                placeholder="Ej.: ¿Cuánto tiempo permanece un reporte negativo?"
              />
            </Field>

            <Field
              label="Extracto"
              required
              error={errors.excerpt}
              hint={`${draft.excerpt.length}/300`}
            >
              <textarea
                value={draft.excerpt}
                onChange={(e) => update({ excerpt: e.target.value })}
                maxLength={300}
                rows={3}
                className={cn(fieldClass, 'resize-y')}
                placeholder="Resumen corto que se ve en las tarjetas y en Google."
              />
            </Field>

            <div>
              <span className={labelClass}>Imagen destacada</span>
              <div className="flex flex-wrap items-start gap-4">
                <span className="relative block aspect-[1200/630] w-full max-w-[13rem] overflow-hidden rounded-lg bg-surface">
                  {draft.image.previewUrl ? (
                    <img src={draft.image.previewUrl} alt="" className="size-full object-cover" />
                  ) : (
                    <span className="grid size-full place-items-center text-muted">
                      <ImageIcon aria-hidden="true" className="size-8" strokeWidth={1.4} />
                    </span>
                  )}
                </span>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setPicking(true)}
                    className={outlineAccentClass}
                  >
                    <ImageIcon aria-hidden="true" className="size-4" />
                    {draft.image.previewUrl ? 'Cambiar imagen' : 'Elegir imagen'}
                  </button>
                  {draft.image.previewUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        update({ image: { src: null, previewUrl: null, alt: '', upload: null } })
                      }
                      className="block cursor-pointer text-sm text-muted hover:text-danger"
                    >
                      Quitar imagen
                    </button>
                  )}
                  <p className="text-xs text-muted">
                    JPG, PNG o WebP
                    <br />
                    Recomendado: 1200 × 630 px
                  </p>
                </div>
              </div>
              {draft.image.previewUrl && (
                <input
                  value={draft.image.alt}
                  onChange={(e) => update({ image: { ...draft.image, alt: e.target.value } })}
                  maxLength={200}
                  className={cn(fieldClass, 'mt-3')}
                  placeholder="Describe la imagen (para personas con discapacidad visual y Google)"
                  aria-label="Descripción de la imagen"
                />
              )}
            </div>

            <Field label="Categoría" required error={errors.category}>
              <select
                value={draft.category}
                onChange={(e) => update({ category: e.target.value })}
                className={cn(fieldClass, 'cursor-pointer')}
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>

            <Switch
              checked={draft.featured}
              onChange={(featured) => update({ featured })}
              label="Destacar en portada"
              description="Se muestra como “Actualidad jurídica de la semana”. Solo puede haber una."
            />

            <Field label="Contenido" required error={errors.body} group>
              <MarkdownEditor
                value={draft.body}
                onChange={(body) => update({ body })}
                label="Contenido de la noticia"
                placeholder={
                  'Escribe aquí la noticia.\n\n## Un subtítulo\n\nUn párrafo con **negrita**.\n\n- Un punto\n- Otro punto'
                }
              />
            </Field>
          </>
        )}

        {tab === 'seo' && (
          <>
            <Field
              label="Dirección (URL)"
              required
              error={errors.slug}
              hint={
                isNew
                  ? 'Se genera sola a partir del título.'
                  : 'Si la cambias, los enlaces viejos dejarán de funcionar.'
              }
              group
            >
              <div className="flex overflow-hidden rounded-lg border border-border focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/25">
                <span className="hidden items-center bg-surface px-3 text-sm text-muted sm:flex">
                  /actualidad/
                </span>
                <input
                  value={draft.slug}
                  onChange={(e) =>
                    update({
                      slug: slugify(e.target.value) || e.target.value.toLowerCase(),
                      slugTouched: true,
                    })
                  }
                  aria-label="Dirección (URL) de la noticia"
                  className="min-w-0 flex-1 bg-background px-3.5 py-2.5 text-[0.92rem] focus:outline-none"
                />
              </div>
              {draft.slugTouched && draft.title && draft.slug !== slugify(draft.title) && (
                <button
                  type="button"
                  onClick={() => update({ slug: slugify(draft.title) })}
                  className="mt-2 cursor-pointer text-sm font-medium text-accent-text hover:underline"
                >
                  Generar desde el título
                </button>
              )}
            </Field>

            <Field
              label="Descripción para Google"
              error={errors.seo}
              hint={`${draft.seoDescription.length}/160 · Si la dejas vacía se usa el extracto.`}
            >
              <textarea
                value={draft.seoDescription}
                onChange={(e) => update({ seoDescription: e.target.value })}
                rows={3}
                className={cn(fieldClass, 'resize-y')}
              />
            </Field>

            <div>
              <span className={labelClass}>Vista previa en Google</span>
              <div className="rounded-xl border border-border p-4">
                <p className="truncate text-xs text-muted">
                  {SITE}/actualidad/{draft.slug || '…'}
                </p>
                <p className="mt-1 line-clamp-1 text-lg text-serp-link">
                  {draft.title || 'Título de la noticia'} | Orión Lex
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-muted">
                  {draft.seoDescription || draft.excerpt || 'Descripción de la noticia.'}
                </p>
              </div>
            </div>
          </>
        )}

        {tab === 'settings' && (
          <>
            <Field label="Fecha de publicación" required error={errors.date}>
              <input
                type="date"
                value={draft.date}
                onChange={(e) => update({ date: e.target.value })}
                className={cn(fieldClass, 'max-w-[14rem]')}
              />
            </Field>

            <Sources draft={draft} update={update} error={errors.sources} />

            {!isNew && (
              <div className="rounded-xl border border-danger/25 p-4">
                <p className="text-sm font-semibold">Eliminar noticia</p>
                <p className="mt-1 text-sm text-muted">
                  Se borra de la web en español y en inglés.
                </p>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={busy}
                  className={cn(dangerClass, 'mt-3')}
                >
                  <Trash aria-hidden="true" className="size-4" /> Eliminar
                </button>
              </div>
            )}
          </>
        )}

        {showRequestError && (
          <Notice tone="error">
            {requestError instanceof ApiRequestError ? requestError.message : 'No se pudo guardar.'}
          </Notice>
        )}
      </div>

      <footer className="flex items-center gap-2 border-t border-border px-4 py-4 sm:px-5">
        <button
          type="button"
          onClick={() => setPreviewing(true)}
          className={cn(ghostClass, 'max-sm:px-3')}
        >
          <Eye aria-hidden="true" className="size-4" />
          <span className="max-sm:sr-only">Vista previa</span>
        </button>
        <div className="ml-auto flex gap-2">
          {article?.published ? (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() => submit(false)}
                className={cn(outlineAccentClass, FOOTER_BUTTON)}
              >
                Pasar a borrador
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => submit(true)}
                className={cn(primaryClass, FOOTER_BUTTON)}
              >
                {save.isPending ? (
                  <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                ) : (
                  <Pencil aria-hidden="true" className="size-4 max-sm:hidden" />
                )}
                Guardar cambios
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() => submit(false)}
                className={cn(outlineAccentClass, FOOTER_BUTTON)}
              >
                Guardar borrador
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => submit(true)}
                className={cn(primaryClass, FOOTER_BUTTON)}
              >
                {save.isPending ? (
                  <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                ) : (
                  <Send aria-hidden="true" className="size-4 max-sm:hidden" />
                )}
                Publicar
              </button>
            </>
          )}
        </div>
      </footer>

      {picking && (
        <ImagePicker
          choices={choices}
          onClose={() => setPicking(false)}
          onPick={(picked) => {
            setPicking(false);
            update({
              image:
                picked.kind === 'upload'
                  ? {
                      src: null,
                      previewUrl: picked.image.previewUrl,
                      alt: draft.image.alt,
                      upload: picked.image,
                    }
                  : { src: picked.src, previewUrl: picked.url, alt: draft.image.alt, upload: null },
            });
          }}
        />
      )}

      {previewing && (
        <Modal title="Vista previa" onClose={() => setPreviewing(false)} className="max-w-4xl">
          <article className="mx-auto max-w-2xl">
            <p className="eyebrow">
              {categories.find((c) => c.slug === draft.category)?.name} · {formatDate(draft.date)}
            </p>
            <h1 className="mt-3 font-serif text-3xl leading-tight font-semibold sm:text-4xl">
              {draft.title || 'Sin título'}
            </h1>
            <p className="mt-4 text-lg text-muted">{draft.excerpt}</p>
            {draft.image.previewUrl && (
              <img
                src={draft.image.previewUrl}
                alt={draft.image.alt}
                className="mt-6 aspect-[1200/630] w-full rounded-xl object-cover"
              />
            )}
            <Markdown className="mt-4">{draft.body || '_Sin contenido todavía._'}</Markdown>
          </article>
        </Modal>
      )}
    </section>
  );
}

function Sources({
  draft,
  update,
  error,
}: {
  draft: ArticleDraft;
  update: (patch: Partial<ArticleDraft>) => void;
  error?: string;
}) {
  const setSource = (index: number, patch: Partial<ArticleDraft['sources'][number]>) =>
    update({ sources: draft.sources.map((s, i) => (i === index ? { ...s, ...patch } : s)) });

  return (
    <div>
      <span className={labelClass}>Fuentes</span>
      <p className="mb-3 text-sm text-muted">
        Leyes, sentencias o páginas oficiales citadas (se muestran al final).
      </p>
      <ul className="space-y-3">
        {draft.sources.map((source, index) => (
          <li key={index} className="flex gap-2">
            <div className="grid flex-1 gap-2">
              <input
                value={source.label}
                onChange={(e) => setSource(index, { label: e.target.value })}
                placeholder="Nombre (p. ej. Ley 2157 de 2021)"
                aria-label={`Nombre de la fuente ${index + 1}`}
                className={fieldClass}
              />
              <input
                value={source.url}
                onChange={(e) => setSource(index, { url: e.target.value })}
                placeholder="https://"
                type="url"
                aria-label={`Enlace de la fuente ${index + 1}`}
                className={fieldClass}
              />
            </div>
            <button
              type="button"
              onClick={() => update({ sources: draft.sources.filter((_, i) => i !== index) })}
              aria-label={`Quitar la fuente ${index + 1}`}
              className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-lg text-muted hover:bg-danger/10 hover:text-danger"
            >
              <Trash aria-hidden="true" className="size-4" />
            </button>
          </li>
        ))}
      </ul>
      {error && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={() => update({ sources: [...draft.sources, { label: '', url: '' }] })}
        className={cn(ghostClass, 'mt-3')}
      >
        <Plus aria-hidden="true" className="size-4" /> Agregar fuente
      </button>
    </div>
  );
}
