import { useState } from 'react';
import { Check, Copy, ExternalLink, Pencil, Plus } from 'lucide-react';
import type { LandingContent } from '@orion-lex/shared';
import { RowActions } from '@/components/admin/ListField';
import { Notice } from '@/components/admin/Notice';
import { SITE_URL } from '@/components/admin/UrlField';
import { ghostClass, outlineAccentClass, primaryClass } from '@/components/admin/styles';
import { ContentIcon } from '@/components/ui/ContentIcon';
import { errorMessage } from '@/lib/api-client';
import { cn } from '@/lib/cn';
import { move } from '@/lib/move';
import { useDeleteLanding, useReorderLandings, useSaveLanding } from '../hooks/use-services';
import type { LandingDraft } from '../lib/drafts';
import { LandingEditor } from './LandingEditor';

interface LandingsTabProps {
  landings: LandingContent[];
  onMessage: (message: string) => void;
}

const when = (mode: 'local' | 'github') =>
  mode === 'github' ? ' La web se actualizará en 1–2 minutos.' : '';

/** Asuntos frecuentes: páginas completas para anuncios en orionlex.co/<url>. */
export function LandingsTab({ landings, onMessage }: LandingsTabProps) {
  const save = useSaveLanding();
  const remove = useDeleteLanding();
  const reorder = useReorderLandings();
  // undefined = cerrado; null = nuevo; texto = URL del asunto que se edita.
  const [editing, setEditing] = useState<string | null | undefined>(undefined);
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (slug: string) => {
    await navigator.clipboard.writeText(`${SITE_URL}/${slug}`).catch(() => undefined);
    setCopied(slug);
    setTimeout(() => setCopied(null), 1600);
  };

  const saveLanding = (landing: LandingDraft) =>
    save.mutate(
      { originalSlug: editing ?? null, landing },
      {
        onSuccess: (result) => {
          setEditing(undefined);
          onMessage(`${editing ? 'Asunto guardado.' : 'Asunto creado.'}${when(result.mode)}`);
        },
      },
    );

  const removeLanding = (landing: LandingContent) => {
    if (landings.length === 1) return window.alert('Debe quedar al menos un asunto frecuente.');
    if (
      !window.confirm(
        `¿Eliminar "${landing.title}"? La página orionlex.co/${landing.slug} dejará de existir.`,
      )
    )
      return;
    remove.mutate(landing.slug, {
      onSuccess: (result) => onMessage(`Asunto eliminado.${when(result.mode)}`),
    });
  };

  const current = editing ? landings.find((l) => l.slug === editing) : undefined;
  const requestError = remove.error ?? reorder.error;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-muted">
          Páginas completas pensadas para anuncios, en <strong>orionlex.co/…</strong>. En la web
          salen como tarjetas en este orden.
        </p>
        <button
          type="button"
          onClick={() => setEditing(null)}
          className={cn(primaryClass, 'min-h-11')}
        >
          <Plus aria-hidden="true" className="size-5" /> Nuevo asunto
        </button>
      </div>

      {requestError && (
        <Notice tone="error">{errorMessage(requestError, 'No se pudo guardar el cambio.')}</Notice>
      )}

      <ol className="space-y-3">
        {landings.map((landing, index) => (
          <li
            key={landing.slug}
            className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-background p-4 shadow-sm"
          >
            {landing.image ? (
              <img
                src={landing.image.src}
                alt=""
                className="h-16 w-20 shrink-0 rounded-lg bg-surface object-cover"
              />
            ) : (
              <span className="grid h-16 w-20 shrink-0 place-items-center rounded-lg bg-ink text-accent">
                <ContentIcon name={landing.icon} className="size-7" strokeWidth={1.5} />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-serif text-lg font-semibold">{landing.title}</h3>
              <p className="truncate font-mono text-xs text-muted">orionlex.co/{landing.slug}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => copy(landing.slug)}
                className={cn(ghostClass, 'min-h-8 px-2.5 text-xs')}
              >
                {copied === landing.slug ? (
                  <Check aria-hidden="true" className="size-3.5 text-success" />
                ) : (
                  <Copy aria-hidden="true" className="size-3.5" />
                )}
                {copied === landing.slug ? 'Copiado' : 'Copiar enlace'}
              </button>
              <a
                href={`/${landing.slug}`}
                target="_blank"
                rel="noreferrer"
                aria-label={`Ver ${landing.title} en la web`}
                className={cn(ghostClass, 'min-h-8 px-2.5 text-xs')}
              >
                <ExternalLink aria-hidden="true" className="size-3.5" />
              </a>
              <button
                type="button"
                onClick={() => setEditing(landing.slug)}
                className={cn(outlineAccentClass, 'min-h-8 px-3 text-xs')}
              >
                <Pencil aria-hidden="true" className="size-3.5" /> Editar
              </button>
              <RowActions
                index={index}
                count={landings.length}
                name={landing.title}
                onMove={(step) =>
                  reorder.mutate(
                    move(landings, index, step).map((l) => l.slug),
                    { onSuccess: (result) => onMessage(`Orden guardado.${when(result.mode)}`) },
                  )
                }
                onRemove={() => removeLanding(landing)}
              />
            </div>
          </li>
        ))}
      </ol>

      {editing !== undefined && (
        <LandingEditor
          landing={current}
          takenSlugs={landings.filter((l) => l.slug !== editing).map((l) => l.slug)}
          saving={save.isPending}
          error={save.isError ? errorMessage(save.error, 'No se pudo guardar.') : null}
          onSave={saveLanding}
          onClose={() => {
            save.reset();
            setEditing(undefined);
          }}
        />
      )}
    </div>
  );
}
