import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import {
  EllipsisVertical,
  ExternalLink,
  FileText,
  Pencil,
  Plus,
  Search,
  Star,
  Trash,
} from 'lucide-react';
import type { AdminArticle, AdminCategory } from '@orion-lex/shared';
import { Notice } from '@/components/admin/Notice';
import { PageHeader } from '@/components/admin/PageHeader';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { fieldClass, labelClass, primaryClass } from '@/components/admin/styles';
import { errorMessage } from '@/lib/api-client';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/format';
import { useArticles, useDeleteArticle, useSaveArticle } from '../hooks/use-articles';
import { setFlash, takeFlash, takePendingOpen } from '@/lib/flash';
import { ArticleEditor } from './ArticleEditor';

type Sort = 'recent' | 'oldest' | 'title';

/** Gestión de noticias: filtros, tabla y editor lateral. La noticia abierta va en la URL (?editar=). */
export function NewsManager() {
  const [params, setParams] = useSearchParams();
  const { data, isPending, isError, error } = useArticles();
  const [flash, setFlashState] = useState<string | null>(() => takeFlash());
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<'' | 'published' | 'draft'>('');
  const [sort, setSort] = useState<Sort>('recent');

  // El respaldo del mensaje solo sirve para una recarga inmediata; luego se borra.
  useEffect(() => {
    if (!flash) return;
    const timer = setTimeout(() => setFlash(null), 5000);
    return () => clearTimeout(timer);
  }, [flash]);
  const query = params.get('q') ?? '';
  const editing = params.get('editar');
  // Noticia que se estaba guardando cuando Vite recargó la página (en local): se reabre.
  const [pendingOpen] = useState(() => takePendingOpen());
  const reopened = useRef(false);
  useEffect(() => {
    if (reopened.current || !pendingOpen || !data) return;
    reopened.current = true;
    if (data.articles.some((a) => a.slug === pendingOpen)) {
      setParams({ editar: pendingOpen }, { replace: true });
    }
  }, [data, pendingOpen, setParams]);

  const setParam = (key: string, value: string | null) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );

  const showMessage = (message: string) => {
    setFlash(message); // por si Vite recarga la página en local
    setFlashState(message);
  };

  const articles = useMemo(() => {
    const term = query.trim().toLowerCase();
    const list = (data?.articles ?? []).filter(
      (a) =>
        (!term || `${a.title} ${a.excerpt}`.toLowerCase().includes(term)) &&
        (!category || a.category === category) &&
        (!status || (status === 'published') === a.published),
    );
    if (sort === 'oldest') return [...list].reverse();
    if (sort === 'title') return [...list].sort((a, b) => a.title.localeCompare(b.title, 'es'));
    return list;
  }, [data, query, category, status, sort]);

  const current =
    editing && editing !== 'nueva' ? data?.articles.find((a) => a.slug === editing) : undefined;
  const editorOpen = !!data && (editing === 'nueva' || !!current);

  return (
    <div
      className={cn('grid grid-cols-1 gap-7', editorOpen && '2xl:grid-cols-[minmax(0,1fr)_35rem]')}
    >
      <div className="min-w-0 space-y-6">
        <PageHeader
          title="Gestión de noticias"
          description="Crea, edita y organiza las noticias de Actualidad Jurídica en el sitio web de Orión Lex Servicios Jurídicos."
          actions={
            <button
              type="button"
              onClick={() => setParam('editar', 'nueva')}
              className={cn(primaryClass, 'min-h-12 px-6 text-[0.95rem]')}
            >
              <Plus aria-hidden="true" className="size-5" /> Nueva noticia
            </button>
          }
        />

        {flash && (
          <Notice tone="success" className="items-center">
            <span className="flex items-center justify-between gap-4">
              {flash}
              <button
                type="button"
                onClick={() => setFlashState(null)}
                className="cursor-pointer text-xs font-semibold text-muted hover:text-foreground"
              >
                Cerrar
              </button>
            </span>
          </Notice>
        )}

        <div className="grid gap-4 rounded-2xl border border-border bg-background p-5 shadow-sm sm:grid-cols-2 xl:grid-cols-[minmax(0,1.6fr)_1fr_1fr_1fr]">
          <label>
            <span className={labelClass}>Buscar noticia</span>
            <span className="relative block">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-muted"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setParam('q', e.target.value || null)}
                placeholder="Buscar por título o palabras clave…"
                className={cn(fieldClass, 'pl-10')}
              />
            </span>
          </label>
          <label>
            <span className={labelClass}>Categoría</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={cn(fieldClass, 'cursor-pointer')}
            >
              <option value="">Todas</option>
              {data?.categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className={labelClass}>Estado</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className={cn(fieldClass, 'cursor-pointer')}
            >
              <option value="">Todos</option>
              <option value="published">Publicadas</option>
              <option value="draft">Borradores</option>
            </select>
          </label>
          <label>
            <span className={labelClass}>Ordenar por</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className={cn(fieldClass, 'cursor-pointer')}
            >
              <option value="recent">Más recientes</option>
              <option value="oldest">Más antiguas</option>
              <option value="title">Título (A–Z)</option>
            </select>
          </label>
        </div>

        <section className="rounded-2xl border border-border bg-background shadow-sm">
          <header className="flex items-center gap-3 px-5 pt-5 pb-4 sm:px-6">
            <FileText aria-hidden="true" className="size-6 text-accent" strokeWidth={1.6} />
            <h2 className="font-serif text-2xl font-semibold">
              Noticias {data && <span className="text-muted">({articles.length})</span>}
            </h2>
          </header>
          {isError ? (
            <Notice tone="error" className="mx-6 mb-6">
              {errorMessage(error, 'No se pudieron cargar las noticias. Recarga la página.')}
            </Notice>
          ) : isPending ? (
            <p className="px-6 pb-8 text-sm text-muted">Cargando noticias…</p>
          ) : articles.length === 0 ? (
            <p className="px-6 pb-8 text-sm text-muted">No hay noticias con estos filtros.</p>
          ) : (
            <NewsTable
              articles={articles}
              categories={data.categories}
              selected={editing}
              compact={editorOpen}
              onEdit={(slug) => setParam('editar', slug)}
              onMessage={showMessage}
            />
          )}
        </section>
      </div>

      {editorOpen && (
        <>
          {/* En pantallas medianas el editor se abre encima, como un panel deslizable */}
          <div aria-hidden="true" className="fixed inset-0 z-30 bg-black/45 2xl:hidden" />
          <div className="fixed inset-y-0 right-0 z-40 w-full max-w-[35rem] shadow-2xl 2xl:sticky 2xl:top-[6.5rem] 2xl:z-auto 2xl:h-[calc(100dvh-8.5rem)] 2xl:max-w-none 2xl:overflow-hidden 2xl:rounded-2xl 2xl:border 2xl:border-border 2xl:shadow-sm">
            <ArticleEditor
              key={editing}
              article={current}
              categories={data.categories}
              onClose={() => setParam('editar', null)}
              onSaved={(slug, message) => {
                showMessage(message);
                setParam('editar', slug);
              }}
              onDeleted={(message) => {
                showMessage(message);
                setParam('editar', null);
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}

interface NewsTableProps {
  articles: AdminArticle[];
  categories: AdminCategory[];
  selected: string | null;
  /** Con el editor abierto se oculta la categoría para dar espacio al título. */
  compact: boolean;
  onEdit: (slug: string) => void;
  onMessage: (message: string) => void;
}

function NewsTable({ articles, categories, selected, compact, onEdit, onMessage }: NewsTableProps) {
  const save = useSaveArticle();
  const remove = useDeleteArticle();
  const categoryName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug;
  const busy = save.isPending || remove.isPending;

  const toggleFeatured = (article: AdminArticle) =>
    save.mutate(
      {
        originalSlug: article.slug,
        data: { article: { ...article, featured: !article.featured } },
      },
      {
        onSuccess: (result) =>
          onMessage(
            `${article.featured ? 'Se quitó el destacado' : 'Noticia destacada en portada'}.${result.mode === 'github' ? ' La web se actualizará en 1–2 minutos.' : ''}`,
          ),
      },
    );

  const confirmDelete = (article: AdminArticle) => {
    if (
      !window.confirm(`¿Eliminar la noticia "${article.title}"? Esta acción no se puede deshacer.`)
    )
      return;
    remove.mutate(article.slug, {
      onSuccess: (result) =>
        onMessage(
          `Noticia eliminada.${result.mode === 'github' ? ' La web se actualizará en 1–2 minutos.' : ''}`,
        ),
    });
  };

  return (
    <div className="relative overflow-x-auto pb-2">
      {(save.isError || remove.isError) && (
        <Notice tone="error" className="mx-6 mb-4">
          No se pudo guardar el cambio. Inténtalo de nuevo.
        </Notice>
      )}
      <table className={cn('w-full text-sm', compact ? 'min-w-[40rem]' : 'min-w-[52rem]')}>
        <thead>
          <tr className="bg-surface text-left text-[0.8rem] font-semibold">
            <th className="py-3 pr-2 pl-6">Imagen</th>
            <th className="px-3 py-3">Título</th>
            {!compact && <th className="px-3 py-3">Categoría</th>}
            <th className="px-3 py-3">Fecha</th>
            <th className="px-3 py-3">Estado</th>
            <th className="px-2 py-3 text-center">Destacado</th>
            <th className="py-3 pr-6 pl-2 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {articles.map((article) => (
            <tr
              key={article.slug}
              className={cn(
                'border-b border-border last:border-0',
                selected === article.slug && 'bg-accent/8',
              )}
            >
              <td className="py-3 pr-2 pl-6">
                <Thumb src={article.image?.src} />
              </td>
              <td className="px-3 py-3">
                <button
                  type="button"
                  onClick={() => onEdit(article.slug)}
                  className="line-clamp-2 max-w-[22rem] cursor-pointer text-left font-medium hover:text-accent-text"
                >
                  {article.title}
                </button>
              </td>
              {!compact && (
                <td className="px-3 py-3 text-muted">{categoryName(article.category)}</td>
              )}
              <td className="px-3 py-3 whitespace-nowrap text-muted">{formatDate(article.date)}</td>
              <td className="px-3 py-3">
                <StatusBadge published={article.published} />
              </td>
              <td className="px-3 py-3 text-center">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => toggleFeatured(article)}
                  aria-pressed={article.featured}
                  aria-label={
                    article.featured
                      ? `Quitar destacado de "${article.title}"`
                      : `Destacar "${article.title}" en portada`
                  }
                  title={article.featured ? 'Destacada en portada' : 'Destacar en portada'}
                  className="grid size-9 cursor-pointer place-items-center rounded-lg hover:bg-accent/10 disabled:cursor-wait"
                >
                  <Star
                    aria-hidden="true"
                    className={cn(
                      'size-5',
                      article.featured ? 'fill-accent text-accent' : 'text-muted',
                    )}
                    strokeWidth={1.6}
                  />
                </button>
              </td>
              <td className="px-6 py-3 text-right">
                <RowMenu
                  article={article}
                  onEdit={() => onEdit(article.slug)}
                  onDelete={() => confirmDelete(article)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Thumb({ src }: { src?: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <span className="grid h-12 w-16 place-items-center rounded-md bg-ink text-accent">
        <FileText aria-hidden="true" className="size-5" />
      </span>
    );
  }
  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-12 w-16 rounded-md object-cover"
    />
  );
}

function RowMenu({
  article,
  onEdit,
  onDelete,
}: {
  article: AdminArticle;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) =>
      !ref.current?.contains(event.target as Node) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const item =
    'flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-foreground/5';
  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Acciones de "${article.title}"`}
        className="grid size-9 cursor-pointer place-items-center rounded-lg text-muted hover:bg-foreground/5 hover:text-foreground"
      >
        <EllipsisVertical aria-hidden="true" className="size-5" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-10 mt-1 w-52 overflow-hidden rounded-xl border border-border bg-background py-1.5 text-left shadow-lg"
        >
          <button
            role="menuitem"
            type="button"
            className={item}
            onClick={() => (setOpen(false), onEdit())}
          >
            <Pencil aria-hidden="true" className="size-4" /> Editar
          </button>
          {article.published && (
            <a
              role="menuitem"
              href={`/actualidad/${article.slug}`}
              target="_blank"
              rel="noreferrer"
              className={item}
            >
              <ExternalLink aria-hidden="true" className="size-4" /> Ver en la web
            </a>
          )}
          <button
            role="menuitem"
            type="button"
            className={cn(item, 'text-danger hover:bg-danger/8')}
            onClick={() => (setOpen(false), onDelete())}
          >
            <Trash aria-hidden="true" className="size-4" /> Eliminar
          </button>
        </div>
      )}
    </div>
  );
}
