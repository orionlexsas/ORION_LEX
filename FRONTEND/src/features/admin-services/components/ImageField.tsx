import { useState } from 'react';
import { Image as ImageIcon, LoaderCircle } from 'lucide-react';
import type { ContentImage } from '@orion-lex/shared';
import { ImagePicker, type PickedImage } from '@/components/admin/ImagePicker';
import { Notice } from '@/components/admin/Notice';
import { fieldClass, labelClass, outlineAccentClass } from '@/components/admin/styles';
import { errorMessage } from '@/lib/api-client';
import { cn } from '@/lib/cn';
import { useImageChoices, useUploadImage } from '../hooks/use-services';

interface ImageFieldProps {
  label: string;
  value: ContentImage | undefined;
  onChange: (image: ContentImage | undefined) => void;
  /** Carpeta de la biblioteca donde se guardan las fotos nuevas. */
  folder: string;
  /** Nombre sugerido para la foto nueva (la URL del elemento). */
  fileName: string;
  required?: boolean;
  hint?: string;
}

/**
 * Foto de una categoría, servicio o asunto. Una foto nueva se sube a la biblioteca en ese
 * momento (queda en /images/<carpeta>/) y luego se guarda junto con lo demás.
 */
export function ImageField({
  label,
  value,
  onChange,
  folder,
  fileName,
  required,
  hint,
}: ImageFieldProps) {
  const [picking, setPicking] = useState(false);
  // Vista previa de una foto recién elegida (aún no está publicada en la web).
  const [preview, setPreview] = useState<string | null>(null);
  const choices = useImageChoices(picking);
  const upload = useUploadImage();

  const pick = (picked: PickedImage) => {
    setPicking(false);
    if (picked.kind === 'library') {
      setPreview(picked.url);
      onChange({ src: picked.src, alt: value?.alt ?? '' });
      return;
    }
    const { image } = picked;
    upload.mutate(
      { folder, fileName: fileName || image.fileName, mime: image.mime, data: image.data },
      {
        onSuccess: ({ src }) => {
          setPreview(image.previewUrl);
          onChange({ src, alt: value?.alt ?? '' });
        },
      },
    );
  };

  const shown = preview ?? value?.src;

  return (
    <div>
      <span className={labelClass}>
        {label}
        {required && <span className="text-danger"> *</span>}
      </span>
      <div className="flex flex-wrap items-start gap-4">
        <span className="relative block aspect-[4/3] w-full max-w-[12rem] overflow-hidden rounded-lg bg-surface">
          {shown ? (
            <img src={shown} alt="" className="size-full object-cover" />
          ) : (
            <span className="grid size-full place-items-center text-muted">
              <ImageIcon aria-hidden="true" className="size-8" strokeWidth={1.4} />
            </span>
          )}
          {upload.isPending && (
            <span className="absolute inset-0 grid place-items-center bg-black/40">
              <LoaderCircle aria-hidden="true" className="size-7 animate-spin text-white" />
            </span>
          )}
        </span>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setPicking(true)}
            disabled={upload.isPending}
            className={outlineAccentClass}
          >
            <ImageIcon aria-hidden="true" className="size-4" />
            {shown ? 'Cambiar foto' : 'Elegir foto'}
          </button>
          {shown && !required && (
            <button
              type="button"
              onClick={() => {
                setPreview(null);
                onChange(undefined);
              }}
              className="block cursor-pointer text-sm text-muted hover:text-danger"
            >
              Quitar foto
            </button>
          )}
          {hint && <p className="max-w-[16rem] text-xs text-muted">{hint}</p>}
        </div>
      </div>
      {value && (
        <input
          value={value.alt}
          onChange={(e) => onChange({ ...value, alt: e.target.value })}
          maxLength={200}
          className={cn(fieldClass, 'mt-3')}
          placeholder="Describe la foto (para personas con discapacidad visual y Google)"
          aria-label="Descripción de la foto"
        />
      )}
      {upload.isError && (
        <Notice tone="error" className="mt-3">
          {errorMessage(upload.error, 'No se pudo subir la foto.')}
        </Notice>
      )}
      {picking && (
        <ImagePicker
          title={label}
          choices={choices}
          maxWidth={1600}
          onPick={pick}
          onClose={() => setPicking(false)}
        />
      )}
    </div>
  );
}
