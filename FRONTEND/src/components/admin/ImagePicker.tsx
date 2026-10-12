import { useMemo, useState } from 'react';
import { Check, ImagePlus, LoaderCircle, Search } from 'lucide-react';
import type { MediaItem } from '@orion-lex/shared';
import { Modal } from '@/components/admin/Modal';
import { Notice } from '@/components/admin/Notice';
import { fieldClass, ghostClass } from '@/components/admin/styles';
import { cn } from '@/lib/cn';
import { ImageFileError, prepareImage, type PreparedImage } from '@/lib/image-file';

export type PickedImage =
  { kind: 'upload'; image: PreparedImage } | { kind: 'library'; src: string; url: string };

interface ImagePickerProps {
  /** Imágenes de la biblioteca (las carga quien abre el selector). */
  choices: { data?: MediaItem[]; isPending: boolean; isError: boolean };
  onPick: (picked: PickedImage) => void;
  onClose: () => void;
  title?: string;
  /** Ancho máximo al optimizar una foto subida. */
  maxWidth?: number;
}

/** Elegir una imagen: subir una desde el equipo o usar una de la biblioteca. */
export function ImagePicker({
  choices,
  onPick,
  onClose,
  title = 'Imagen destacada',
  maxWidth = 1600,
}: ImagePickerProps) {
  const [tab, setTab] = useState<'upload' | 'library'>('upload');
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(
    () =>
      (choices.data ?? []).filter((item) =>
        `${item.folder} ${item.name}`.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [choices.data, query],
  );

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setProcessing(true);
    try {
      onPick({ kind: 'upload', image: await prepareImage(file, { maxWidth }) });
    } catch (e) {
      setError(e instanceof ImageFileError ? e.message : 'No se pudo procesar la imagen');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Modal title={title} onClose={onClose}>
      <div role="tablist" className="mb-5 flex gap-1 border-b border-border">
        {(
          [
            ['upload', 'Subir desde tu equipo'],
            ['library', 'Elegir de la biblioteca'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            role="tab"
            type="button"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={cn(
              '-mb-px cursor-pointer border-b-2 px-4 py-2.5 text-sm font-semibold',
              tab === value
                ? 'border-accent text-accent-text'
                : 'border-transparent text-muted hover:text-foreground',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'upload' ? (
        <div className="space-y-4">
          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              void handleFile(e.dataTransfer.files[0]);
            }}
            className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border px-6 py-14 text-center transition-colors hover:border-accent hover:bg-accent/5"
          >
            {processing ? (
              <LoaderCircle aria-hidden="true" className="size-9 animate-spin text-accent" />
            ) : (
              <ImagePlus aria-hidden="true" className="size-9 text-accent" strokeWidth={1.5} />
            )}
            <span className="font-semibold">
              {processing ? 'Preparando la imagen…' : 'Arrastra una foto o haz clic para elegirla'}
            </span>
            <span className="text-sm text-muted">
              JPG, PNG o WebP. Se optimiza sola (recomendado: 1200 × 630 px o más).
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(e) => void handleFile(e.target.files?.[0])}
            />
          </label>
          {error && <Notice tone="error">{error}</Notice>}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar imágenes…"
              aria-label="Buscar imágenes"
              className={cn(fieldClass, 'pl-10')}
            />
          </div>
          {choices.isPending ? (
            <p className="py-8 text-center text-sm text-muted">Cargando imágenes…</p>
          ) : choices.isError ? (
            <Notice tone="error">No se pudo cargar la biblioteca.</Notice>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {filtered.map((item) => (
                <li key={item.src}>
                  <button
                    type="button"
                    onClick={() => onPick({ kind: 'library', src: item.src, url: item.url })}
                    className="group w-full cursor-pointer overflow-hidden rounded-xl border border-border text-left hover:border-accent"
                  >
                    <span className="relative block aspect-[4/3] bg-surface">
                      <img
                        src={item.url}
                        alt=""
                        loading="lazy"
                        className="size-full object-cover"
                      />
                      <span className="absolute top-2 right-2 hidden size-7 place-items-center rounded-full bg-accent text-on-accent group-hover:grid">
                        <Check aria-hidden="true" className="size-4" />
                      </span>
                    </span>
                    <span className="block truncate px-3 py-2 text-xs">
                      <span className="text-muted">{item.folder}/</span>
                      {item.name}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <div className="mt-6 flex justify-end">
        <button type="button" onClick={onClose} className={ghostClass}>
          Cancelar
        </button>
      </div>
    </Modal>
  );
}
