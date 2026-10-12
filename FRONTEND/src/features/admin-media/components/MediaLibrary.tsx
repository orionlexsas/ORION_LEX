import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import {
  Check,
  Copy,
  FileText,
  Image as ImageIcon,
  ImageUp,
  LoaderCircle,
  Search,
  Trash,
  Upload,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import type { MediaItem } from '@orion-lex/shared';
import { Modal } from '@/components/admin/Modal';
import { Notice } from '@/components/admin/Notice';
import { PageHeader } from '@/components/admin/PageHeader';
import {
  dangerClass,
  fieldClass,
  ghostClass,
  labelClass,
  primaryClass,
} from '@/components/admin/styles';
import { ApiRequestError } from '@/lib/api-client';
import { cn } from '@/lib/cn';
import { setFlash, takeFlash } from '@/lib/flash';
import { formatBytes } from '@/lib/format';
import { ImageFileError, mimeFromPath, prepareImage, type PreparedImage } from '@/lib/image-file';
import { useDeleteMedia, useMedia, useReplaceMedia, useUploadMedia } from '../hooks/use-media';
import { ImageTexts } from './ImageTexts';

/** Pestañas: agrupan las carpetas de public/images/. */
const TABS: { id: string; label: string; icon: LucideIcon; folders?: string[] }[] = [
  { id: 'all', label: 'Biblioteca', icon: ImageIcon },
  { id: 'hero', label: 'Banners principales', icon: ImageIcon, folders: ['hero'] },
  { id: 'news', label: 'Actualidad', icon: FileText, folders: ['actualidad'] },
  {
    id: 'services',
    label: 'Servicios',
    icon: ImageIcon,
    folders: ['areas', 'servicios-frecuentes'],
  },
  { id: 'team', label: 'Equipo', icon: Users, folders: ['equipo'] },
];
const GROUPED = new Set(TABS.flatMap((t) => t.folders ?? []));

/** Nombre amable de cada carpeta. */
const FOLDER_LABELS: Record<string, string> = {
  hero: 'Banner principal',
  actualidad: 'Actualidad',
  areas: 'Áreas del derecho',
  'servicios-frecuentes': 'Asuntos frecuentes',
  equipo: 'Equipo',
  proceso: 'Cómo trabajamos',
  ubicaciones: 'Cobertura',
  general: 'General',
};
const folderLabel = (folder: string) => FOLDER_LABELS[folder] ?? folder;

const savedMessage = (action: string, mode: 'local' | 'github') =>
  `${action}${mode === 'github' ? ' La web se actualizará en 1–2 minutos.' : ''}`;

/** Fotos y banners: biblioteca de imágenes con detalle, subida, reemplazo y borrado. */
export function MediaLibrary() {
  const { data, isPending, isError } = useMedia();
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  const [usage, setUsage] = useState<'' | 'used' | 'unused'>('');
  const [sort, setSort] = useState<'name' | 'heavy' | 'light'>('name');
  // La foto abierta va en la URL (?imagen=): en local, al guardar textos Vite recarga la página.
  const [params, setParams] = useSearchParams();
  const selectedSrc = params.get('imagen');
  const setSelectedSrc = (src: string | null) =>
    setParams(src ? { imagen: src } : {}, { replace: true });
  const [uploading, setUploading] = useState(false);
  const [message, setMessageState] = useState<string | null>(() => takeFlash());
  const setMessage = (text: string | null) => {
    if (text) setFlash(text);
    setMessageState(text);
  };

  // El respaldo del mensaje solo sirve para una recarga inmediata; luego se borra.
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setFlash(null), 5000);
    return () => clearTimeout(timer);
  }, [message]);
  /** Dimensiones reales, medidas al cargar cada miniatura. */
  const [sizes, setSizes] = useState<Record<string, { w: number; h: number }>>({});

  const items = useMemo(() => {
    const active = TABS.find((t) => t.id === tab);
    const term = query.trim().toLowerCase();
    const list = (data ?? []).filter(
      (item) =>
        (!active?.folders || active.folders.includes(item.folder)) &&
        (!term ||
          `${item.folder} ${item.name} ${item.usages.map((u) => u.label).join(' ')}`
            .toLowerCase()
            .includes(term)) &&
        (!usage || (usage === 'used') === item.usages.length > 0),
    );
    if (sort === 'heavy') return [...list].sort((a, b) => b.size - a.size);
    if (sort === 'light') return [...list].sort((a, b) => a.size - b.size);
    return list;
  }, [data, tab, query, usage, sort]);

  const others = (data ?? []).filter((item) => !GROUPED.has(item.folder)).length;
  const selected = data?.find((item) => item.src === selectedSrc);
  const folders = useMemo(
    () => [...new Set((data ?? []).map((item) => item.folder))].sort(),
    [data],
  );

  return (
    <div className={cn('grid gap-7', selected && '2xl:grid-cols-[minmax(0,1fr)_30rem]')}>
      <div className="min-w-0 space-y-6">
        <PageHeader
          title="Fotos y banners"
          description="Gestiona las imágenes del sitio web. Sube, organiza y actualiza las fotos y banners que se muestran en Orión Lex."
          actions={
            <button
              type="button"
              onClick={() => setUploading(true)}
              className={cn(primaryClass, 'min-h-12 px-6 text-[0.95rem]')}
            >
              <Upload aria-hidden="true" className="size-5" /> Subir imagen
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

        <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-border">
          {[...TABS, ...(others ? [{ id: 'others', label: 'Otras', icon: ImageIcon }] : [])].map(
            ({ id, label, icon: Icon }) => (
              <button
                key={id}
                role="tab"
                type="button"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={cn(
                  '-mb-px flex shrink-0 cursor-pointer items-center gap-2.5 rounded-t-xl border-b-2 px-5 py-3.5 text-[0.95rem] font-medium whitespace-nowrap',
                  tab === id
                    ? 'border-accent bg-background text-accent-text'
                    : 'border-transparent text-foreground/80 hover:text-foreground',
                )}
              >
                <Icon aria-hidden="true" className="size-5" strokeWidth={1.6} />
                {label}
              </button>
            ),
          )}
        </div>

        <div className="grid gap-3 rounded-2xl border border-border bg-background p-4 shadow-sm sm:grid-cols-[minmax(0,1.5fr)_1fr_1fr]">
          <label className="relative block">
            <span className="sr-only">Buscar imágenes</span>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar imágenes…"
              className={cn(fieldClass, 'pl-10')}
            />
          </label>
          <label>
            <span className="sr-only">Uso</span>
            <select
              value={usage}
              onChange={(e) => setUsage(e.target.value as typeof usage)}
              className={cn(fieldClass, 'cursor-pointer')}
            >
              <option value="">En uso y sin usar</option>
              <option value="used">Solo en uso</option>
              <option value="unused">Solo sin usar</option>
            </select>
          </label>
          <label>
            <span className="sr-only">Ordenar</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className={cn(fieldClass, 'cursor-pointer')}
            >
              <option value="name">Por carpeta y nombre</option>
              <option value="heavy">Más pesadas primero</option>
              <option value="light">Más livianas primero</option>
            </select>
          </label>
        </div>

        {isError ? (
          <Notice tone="error">No se pudieron cargar las imágenes. Recarga la página.</Notice>
        ) : isPending ? (
          <p className="text-sm text-muted">Cargando imágenes…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted">No hay imágenes con estos filtros.</p>
        ) : (
          <ul
            className={cn(
              'grid gap-4 sm:grid-cols-2 lg:grid-cols-3',
              selected ? '2xl:grid-cols-3' : '2xl:grid-cols-4',
            )}
          >
            {items
              .filter((item) => tab !== 'others' || !GROUPED.has(item.folder))
              .map((item) => (
                <li key={item.src}>
                  <MediaCard
                    item={item}
                    selected={item.src === selectedSrc}
                    size={sizes[item.src]}
                    onMeasure={(w, h) =>
                      setSizes((s) => (s[item.src]?.w === w ? s : { ...s, [item.src]: { w, h } }))
                    }
                    onSelect={() => setSelectedSrc(item.src)}
                  />
                </li>
              ))}
          </ul>
        )}
      </div>

      {selected && (
        <>
          <div aria-hidden="true" className="fixed inset-0 z-30 bg-black/45 2xl:hidden" />
          <div className="fixed inset-y-0 right-0 z-40 w-full max-w-[30rem] shadow-2xl 2xl:sticky 2xl:top-[6.5rem] 2xl:z-auto 2xl:h-[calc(100dvh-8.5rem)] 2xl:max-w-none 2xl:overflow-hidden 2xl:rounded-2xl 2xl:border 2xl:border-border 2xl:shadow-sm">
            <MediaDetail
              key={selected.src}
              item={selected}
              size={sizes[selected.src]}
              onClose={() => setSelectedSrc(null)}
              onMessage={setMessage}
              onDeleted={(text) => {
                setSelectedSrc(null);
                setMessage(text);
              }}
            />
          </div>
        </>
      )}

      {uploading && (
        <UploadDialog
          folders={folders}
          defaultFolder={TABS.find((t) => t.id === tab)?.folders?.[0] ?? 'actualidad'}
          onClose={() => setUploading(false)}
          onUploaded={(src, text) => {
            setUploading(false);
            setMessage(text);
            setSelectedSrc(src);
          }}
        />
      )}
    </div>
  );
}

interface MediaCardProps {
  item: MediaItem;
  selected: boolean;
  size?: { w: number; h: number };
  onMeasure: (w: number, h: number) => void;
  onSelect: () => void;
}

function MediaCard({ item, selected, size, onMeasure, onSelect }: MediaCardProps) {
  const main = item.usages[0];
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'group relative block w-full cursor-pointer overflow-hidden rounded-xl border-2 bg-background text-left shadow-sm transition-colors',
        selected ? 'border-accent' : 'border-transparent hover:border-accent/40',
      )}
    >
      <span className="relative block aspect-[16/10] bg-surface">
        <img
          src={item.url}
          alt=""
          loading="lazy"
          onLoad={(e) => onMeasure(e.currentTarget.naturalWidth, e.currentTarget.naturalHeight)}
          className="size-full object-cover"
        />
        {selected && (
          <span className="absolute top-2.5 right-2.5 grid size-7 place-items-center rounded-full bg-accent text-on-accent ring-2 ring-white">
            <Check aria-hidden="true" className="size-4" strokeWidth={3} />
          </span>
        )}
      </span>
      <span className="block px-3.5 pt-3 pb-3.5">
        <span className="block truncate text-sm font-medium">{item.name}</span>
        <span className="mt-0.5 block text-xs text-muted">
          {size ? `${size.w} × ${size.h} · ` : ''}
          {formatBytes(item.size)}
        </span>
        <span
          className={cn(
            'mt-2 inline-block max-w-full truncate rounded-md px-2 py-1 text-xs font-medium',
            main ? 'bg-accent/12 text-accent-text' : 'bg-foreground/8 text-muted',
          )}
        >
          {main
            ? main.label.replace(/^(Noticia|Página de servicio): /, '')
            : `Sin usar · ${folderLabel(item.folder)}`}
          {item.usages.length > 1 && ` +${item.usages.length - 1}`}
        </span>
      </span>
    </button>
  );
}

interface MediaDetailProps {
  item: MediaItem;
  size?: { w: number; h: number };
  onClose: () => void;
  onMessage: (message: string) => void;
  onDeleted: (message: string) => void;
}

function MediaDetail({ item, size, onClose, onMessage, onDeleted }: MediaDetailProps) {
  const replace = useReplaceMedia();
  const remove = useDeleteMedia();
  const fileInput = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);
  const busy = replace.isPending || remove.isPending || preparing;
  const extension = item.name.split('.').pop()?.toUpperCase();

  const copy = async () => {
    await navigator.clipboard.writeText(item.src).catch(() => undefined);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const replaceWith = async (file: File | undefined) => {
    if (!file) return;
    const where = item.usages.length
      ? `\n\nSe usa en: ${item.usages.map((u) => u.label).join(', ')}.`
      : '';
    if (
      !window.confirm(
        `¿Reemplazar "${item.name}" por la foto nueva? Cambiará en todo el sitio.${where}`,
      )
    )
      return;
    setError(null);
    setPreparing(true);
    let image: PreparedImage;
    try {
      // Mismo formato y, como máximo, el mismo ancho que la imagen actual.
      image = await prepareImage(file, { mime: mimeFromPath(item.src), maxWidth: size?.w ?? 1920 });
    } catch (e) {
      setError(e instanceof ImageFileError ? e.message : 'No se pudo procesar la imagen');
      return;
    } finally {
      setPreparing(false);
    }
    replace.mutate(
      { src: item.src, mime: image.mime, data: image.data },
      { onSuccess: (result) => onMessage(savedMessage('Imagen reemplazada.', result.mode)) },
    );
  };

  const confirmDelete = () => {
    if (!window.confirm(`¿Eliminar "${item.name}"? Esta acción no se puede deshacer.`)) return;
    remove.mutate(item.src, {
      onSuccess: (result) => onDeleted(savedMessage('Imagen eliminada.', result.mode)),
    });
  };

  const requestError = replace.error ?? remove.error;

  return (
    <section aria-label="Detalle de la imagen" className="flex h-full flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border px-5 py-4">
        <FileText aria-hidden="true" className="size-6" strokeWidth={1.6} />
        <h2 className="flex-1 font-serif text-2xl font-semibold">Detalle de la imagen</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar detalle"
          className="grid size-10 cursor-pointer place-items-center rounded-lg text-muted hover:bg-foreground/5 hover:text-foreground"
        >
          <X aria-hidden="true" className="size-5" />
        </button>
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
        <div className="relative overflow-hidden rounded-xl bg-surface">
          <img src={item.url} alt="" className="max-h-72 w-full object-contain" />
          <button
            type="button"
            disabled={busy}
            onClick={() => fileInput.current?.click()}
            className="absolute right-3 bottom-3 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-ink/85 px-3.5 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-ink disabled:opacity-60"
          >
            {busy ? (
              <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              <ImageUp aria-hidden="true" className="size-4" />
            )}
            Cambiar foto
          </button>
        </div>

        <div>
          <span className={labelClass}>Textos en la web</span>
          <ImageTexts src={item.src} onSaved={onMessage} />
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-4">
          <div className="col-span-2 min-w-0 sm:col-span-4">
            <dt className="font-semibold">Nombre del archivo</dt>
            <dd className="truncate text-muted">{item.name}</dd>
          </div>
          <div>
            <dt className="font-semibold">Tamaño</dt>
            <dd className="text-muted">{formatBytes(item.size)}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="font-semibold">Dimensiones</dt>
            <dd className="text-muted">{size ? `${size.w} × ${size.h} px` : '—'}</dd>
          </div>
          <div>
            <dt className="font-semibold">Formato</dt>
            <dd className="text-muted">{extension}</dd>
          </div>
        </dl>

        <div>
          <span className={labelClass}>Ruta en el sitio</span>
          <div className="flex gap-2">
            <input
              readOnly
              value={item.src}
              aria-label="Ruta en el sitio"
              className={cn(fieldClass, 'font-mono text-xs')}
            />
            <button
              type="button"
              onClick={copy}
              className={cn(ghostClass, 'shrink-0 px-3')}
              aria-label="Copiar ruta"
            >
              {copied ? (
                <Check aria-hidden="true" className="size-4 text-success" />
              ) : (
                <Copy aria-hidden="true" className="size-4" />
              )}
            </button>
          </div>
        </div>

        <div>
          <span className={labelClass}>Dónde se usa</span>
          {item.usages.length ? (
            <ul className="space-y-1.5">
              {item.usages.map((u) => (
                <li
                  key={u.file}
                  className="flex items-center gap-2 rounded-lg bg-surface px-3 py-2 text-sm"
                >
                  <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-accent" />
                  {u.label}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">
              No se usa en ninguna página. Puedes elegirla como imagen de una noticia o eliminarla.
            </p>
          )}
        </div>

        {error && <Notice tone="error">{error}</Notice>}
        {requestError && (
          <Notice tone="error">
            {requestError instanceof ApiRequestError && requestError.code === 'IMAGE_IN_USE'
              ? 'No se puede eliminar: la imagen está en uso en la web.'
              : requestError instanceof ApiRequestError
                ? requestError.message
                : 'No se pudo guardar el cambio.'}
          </Notice>
        )}
      </div>

      <footer className="flex flex-wrap gap-2.5 border-t border-border px-5 py-4">
        <button
          type="button"
          onClick={confirmDelete}
          disabled={busy || item.usages.length > 0}
          title={item.usages.length ? 'Está en uso: reemplázala en lugar de borrarla' : undefined}
          className={dangerClass}
        >
          <Trash aria-hidden="true" className="size-4" /> Eliminar
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => fileInput.current?.click()}
          className={cn(primaryClass, 'ml-auto')}
        >
          {busy ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <ImageUp aria-hidden="true" className="size-4" />
          )}
          Cambiar foto
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => {
            void replaceWith(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </footer>
    </section>
  );
}

interface UploadDialogProps {
  folders: string[];
  defaultFolder: string;
  onClose: () => void;
  onUploaded: (src: string, message: string) => void;
}

function UploadDialog({ folders, defaultFolder, onClose, onUploaded }: UploadDialogProps) {
  const upload = useUploadMedia();
  const [folder, setFolder] = useState(
    folders.includes(defaultFolder) ? defaultFolder : (folders[0] ?? 'actualidad'),
  );
  const [image, setImage] = useState<PreparedImage | null>(null);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);

  const choose = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setPreparing(true);
    try {
      const prepared = await prepareImage(file);
      setImage(prepared);
      // Si ya escribió un nombre mientras se procesaba la foto, se respeta.
      setName((current) => current || file.name.replace(/\.[a-z0-9]+$/i, ''));
    } catch (e) {
      setError(e instanceof ImageFileError ? e.message : 'No se pudo procesar la imagen');
    } finally {
      setPreparing(false);
    }
  };

  const submit = () => {
    if (!image) return;
    upload.mutate(
      { folder, fileName: name || image.fileName, mime: image.mime, data: image.data },
      {
        onSuccess: (result) => onUploaded(result.src, savedMessage('Imagen subida.', result.mode)),
      },
    );
  };

  return (
    <Modal
      title="Subir imagen"
      onClose={onClose}
      className="max-w-xl"
      footer={
        <>
          <button type="button" onClick={onClose} className={ghostClass}>
            Cancelar
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!image || upload.isPending}
            className={primaryClass}
          >
            {upload.isPending ? (
              <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              <Upload aria-hidden="true" className="size-4" />
            )}
            Subir
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            void choose(e.dataTransfer.files[0]);
          }}
          className="flex cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border-2 border-dashed border-border p-4 text-center transition-colors hover:border-accent hover:bg-accent/5"
        >
          {image ? (
            <img src={image.previewUrl} alt="" className="max-h-56 rounded-lg object-contain" />
          ) : (
            <span className="flex flex-col items-center gap-3 py-8">
              {preparing ? (
                <LoaderCircle aria-hidden="true" className="size-9 animate-spin text-accent" />
              ) : (
                <ImageUp aria-hidden="true" className="size-9 text-accent" strokeWidth={1.5} />
              )}
              <span className="font-semibold">Arrastra una foto o haz clic para elegirla</span>
              <span className="text-sm text-muted">
                JPG, PNG o WebP. Se convierte a WebP y se optimiza sola.
              </span>
            </span>
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => void choose(e.target.files?.[0])}
          />
        </label>
        {image && (
          <p className="text-center text-sm text-muted">
            {image.width} × {image.height} px · {formatBytes(image.size)} (optimizada)
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className={labelClass}>Carpeta</span>
            <select
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              className={cn(fieldClass, 'cursor-pointer')}
            >
              {folders.map((f) => (
                <option key={f} value={f}>
                  {folderLabel(f)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className={labelClass}>Nombre del archivo</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={fieldClass}
              placeholder="foto-equipo"
            />
          </label>
        </div>

        {error && <Notice tone="error">{error}</Notice>}
        {upload.isError && (
          <Notice tone="error">
            {upload.error instanceof ApiRequestError
              ? upload.error.message
              : 'No se pudo subir la imagen.'}
          </Notice>
        )}
      </div>
    </Modal>
  );
}
