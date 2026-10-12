import { useState } from 'react';
import { Check, Copy, ExternalLink, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/cn';
import { slugify } from '@/lib/slug';
import { ghostClass } from './styles';

/** Dominio público: las URLs que se copian para los anuncios. */
export const SITE_URL = 'https://orionlex.co';

interface UrlFieldProps {
  /** Parte fija de la ruta, p. ej. "/servicios/derecho-laboral/" o "/". */
  prefix: string;
  value: string;
  onChange: (slug: string) => void;
  /** URL guardada actualmente (null si es nuevo): para avisar si se cambia. */
  saved: string | null;
  error?: string;
}

/**
 * Final editable de la URL (lo que se comparte en Facebook) con botones para copiar el enlace
 * completo y abrirlo. Si se cambia la de algo ya publicado, avisa que el enlace viejo dejará de servir.
 */
export function UrlField({ prefix, value, onChange, saved, error }: UrlFieldProps) {
  const [copied, setCopied] = useState(false);
  const full = `${SITE_URL}${prefix}${value}`;
  const changed = saved !== null && value !== saved;

  const copy = async () => {
    await navigator.clipboard.writeText(full).catch(() => undefined);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div>
      <span className="mb-1.5 block text-sm font-semibold">
        Dirección (URL) para compartir <span className="text-danger">*</span>
      </span>
      <div
        className={cn(
          'flex overflow-hidden rounded-lg border focus-within:ring-2 focus-within:ring-accent/25',
          error ? 'border-danger' : 'border-border focus-within:border-accent',
        )}
      >
        <span className="hidden max-w-[55%] items-center truncate bg-surface px-3 text-sm text-muted sm:flex">
          orionlex.co{prefix}
        </span>
        <input
          value={value}
          // Solo minúsculas, números y guiones; los espacios y tildes se convierten solos.
          onChange={(e) => onChange(slugify(e.target.value) || e.target.value.toLowerCase())}
          onBlur={(e) => onChange(slugify(e.target.value))}
          aria-label="Final de la dirección (URL)"
          aria-invalid={!!error || undefined}
          placeholder="ej-nombre-del-servicio"
          className="min-w-0 flex-1 bg-background px-3.5 py-2.5 text-[0.92rem] focus:outline-none"
        />
      </div>
      {error && (
        <p role="alert" className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-md bg-surface px-2.5 py-1.5 text-xs">
          {full}
        </code>
        <button type="button" onClick={copy} className={cn(ghostClass, 'min-h-8 px-3 text-xs')}>
          {copied ? (
            <Check aria-hidden="true" className="size-3.5 text-success" />
          ) : (
            <Copy aria-hidden="true" className="size-3.5" />
          )}
          {copied ? 'Copiado' : 'Copiar enlace'}
        </button>
        {saved !== null && !changed && (
          <a
            href={`${prefix}${saved}`}
            target="_blank"
            rel="noreferrer"
            className={cn(ghostClass, 'min-h-8 px-3 text-xs')}
          >
            <ExternalLink aria-hidden="true" className="size-3.5" /> Abrir
          </a>
        )}
      </div>
      {changed && (
        <p className="mt-2 flex items-start gap-2 rounded-lg bg-accent/10 px-3 py-2 text-xs text-foreground/85">
          <TriangleAlert aria-hidden="true" className="mt-px size-4 shrink-0 text-accent-text" />
          Al guardar, la dirección anterior (orionlex.co{prefix}
          {saved}) dejará de funcionar. Actualiza los anuncios que la usen.
        </p>
      )}
      {saved === null && (
        <p className="mt-1.5 text-xs text-muted">
          Se arma sola con el nombre; puedes cambiarla. La página existirá 1–2 minutos después de
          guardar.
        </p>
      )}
    </div>
  );
}
