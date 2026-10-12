import { useState } from 'react';
import { Check, Copy, Pencil, Plus, Star } from 'lucide-react';
import type { PracticeService, ServiceItem } from '@orion-lex/shared';
import { RowActions } from '@/components/admin/ListField';
import { Notice } from '@/components/admin/Notice';
import { SITE_URL } from '@/components/admin/UrlField';
import { ghostClass, outlineAccentClass, primaryClass } from '@/components/admin/styles';
import { ContentIcon } from '@/components/ui/ContentIcon';
import { errorMessage } from '@/lib/api-client';
import { cn } from '@/lib/cn';
import { move } from '@/lib/move';
import { useSaveAreas } from '../hooks/use-services';
import { AreaEditor } from './AreaEditor';
import { ServiceEditor } from './ServiceEditor';

type Editing =
  | { kind: 'area'; slug: string | null }
  | { kind: 'service'; area: string; slug: string | null }
  | null;

interface AreasTabProps {
  items: ServiceItem[];
  onMessage: (message: string) => void;
}

/** Botón que copia el enlace completo de una página (para pegarlo en un anuncio). */
function CopyLink({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(`${SITE_URL}${path}`).catch(() => undefined);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
      title={`${SITE_URL}${path}`}
      className={cn(ghostClass, 'min-h-8 px-2.5 text-xs')}
    >
      {copied ? (
        <Check aria-hidden="true" className="size-3.5 text-success" />
      ) : (
        <Copy aria-hidden="true" className="size-3.5" />
      )}
      {copied ? 'Copiado' : 'Copiar enlace'}
    </button>
  );
}

/** Categorías (áreas del derecho) con sus servicios. */
export function AreasTab({ items, onMessage }: AreasTabProps) {
  const save = useSaveAreas();
  const [editing, setEditing] = useState<Editing>(null);

  const persist = (next: ServiceItem[], message: string, after?: () => void) =>
    save.mutate(
      { items: next },
      {
        onSuccess: (result) => {
          after?.();
          onMessage(
            `${message}${result.mode === 'github' ? ' La web se actualizará en 1–2 minutos.' : ''}`,
          );
        },
      },
    );

  const saveArea = (area: ServiceItem) => {
    const original = editing?.kind === 'area' ? editing.slug : null;
    // Solo una destacada: al destacar esta se le quita la marca a las demás.
    const clean = (i: ServiceItem) => (area.featured ? { ...i, featured: false } : i);
    const next = original
      ? items.map((i) => (i.slug === original ? area : clean(i)))
      : [...items.map(clean), area];
    persist(next, original ? 'Categoría guardada.' : 'Categoría creada.', () => setEditing(null));
  };

  const saveService = (areaSlug: string, service: PracticeService) => {
    const original = editing?.kind === 'service' ? editing.slug : null;
    const next = items.map((i) =>
      i.slug !== areaSlug
        ? i
        : {
            ...i,
            services: original
              ? i.services.map((s) => (s.slug === original ? service : s))
              : [...i.services, service],
          },
    );
    persist(next, original ? 'Servicio guardado.' : 'Servicio creado.', () => setEditing(null));
  };

  const removeArea = (area: ServiceItem) => {
    if (items.length === 1) return window.alert('Debe quedar al menos una categoría.');
    const extra = area.services.length
      ? ` También se borrarán sus ${area.services.length} servicios.`
      : '';
    if (
      !window.confirm(
        `¿Eliminar la categoría "${area.title}"?${extra} Su página dejará de existir.`,
      )
    )
      return;
    persist(
      items.filter((i) => i.slug !== area.slug),
      'Categoría eliminada.',
    );
  };

  const removeService = (area: ServiceItem, service: PracticeService) => {
    if (!window.confirm(`¿Eliminar el servicio "${service.title}"? Su página dejará de existir.`))
      return;
    persist(
      items.map((i) =>
        i.slug === area.slug
          ? { ...i, services: i.services.filter((s) => s.slug !== service.slug) }
          : i,
      ),
      'Servicio eliminado.',
    );
  };

  const editingArea =
    editing?.kind === 'area' && editing.slug
      ? items.find((i) => i.slug === editing.slug)
      : undefined;
  const serviceArea =
    editing?.kind === 'service' ? items.find((i) => i.slug === editing.area) : undefined;
  const editingService =
    editing?.kind === 'service' && editing.slug
      ? serviceArea?.services.find((s) => s.slug === editing.slug)
      : undefined;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-muted">
          Cada categoría tiene su página en <strong>orionlex.co/servicios/…</strong> y cada servicio
          la suya dentro de la categoría. Usa <strong>Copiar enlace</strong> para pegarlo en
          Facebook.
        </p>
        <button
          type="button"
          onClick={() => setEditing({ kind: 'area', slug: null })}
          className={cn(primaryClass, 'min-h-11')}
        >
          <Plus aria-hidden="true" className="size-5" /> Nueva categoría
        </button>
      </div>

      {save.isError && !editing && (
        <Notice tone="error">{errorMessage(save.error, 'No se pudo guardar el cambio.')}</Notice>
      )}

      <ol className="space-y-4">
        {items.map((area, index) => (
          <li key={area.slug} className="rounded-2xl border border-border bg-background shadow-sm">
            <div className="flex flex-wrap items-center gap-4 p-4 sm:p-5">
              <img
                src={area.image.src}
                alt=""
                className="h-16 w-20 shrink-0 rounded-lg bg-surface object-cover"
              />
              <div className="min-w-0 flex-1">
                <h3 className="flex flex-wrap items-center gap-2 font-serif text-xl font-semibold">
                  <ContentIcon name={area.icon} className="size-5 text-accent" strokeWidth={1.6} />
                  {area.title}
                  {area.featured && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-accent/12 px-2 py-0.5 font-sans text-xs font-semibold text-accent-text">
                      <Star aria-hidden="true" className="size-3 fill-current" /> Destacada
                    </span>
                  )}
                </h3>
                <p className="mt-1 truncate font-mono text-xs text-muted">
                  orionlex.co/servicios/{area.slug}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <CopyLink path={`/servicios/${area.slug}`} />
                <button
                  type="button"
                  onClick={() => setEditing({ kind: 'area', slug: area.slug })}
                  className={cn(outlineAccentClass, 'min-h-8 px-3 text-xs')}
                >
                  <Pencil aria-hidden="true" className="size-3.5" /> Editar
                </button>
                <RowActions
                  index={index}
                  count={items.length}
                  name={`categoría ${area.title}`}
                  onMove={(step) => persist(move(items, index, step), 'Orden guardado.')}
                  onRemove={() => removeArea(area)}
                />
              </div>
            </div>

            <div className="border-t border-border px-4 py-3 sm:px-5">
              {area.services.length === 0 ? (
                <p className="py-1 text-sm text-muted">Esta categoría aún no tiene servicios.</p>
              ) : (
                <ol className="divide-y divide-border">
                  {area.services.map((service, serviceIndex) => (
                    <li key={service.slug} className="flex flex-wrap items-center gap-3 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{service.title}</p>
                        <p className="truncate font-mono text-xs text-muted">
                          orionlex.co/servicios/{area.slug}/{service.slug}
                        </p>
                      </div>
                      <CopyLink path={`/servicios/${area.slug}/${service.slug}`} />
                      <button
                        type="button"
                        onClick={() =>
                          setEditing({ kind: 'service', area: area.slug, slug: service.slug })
                        }
                        className={cn(ghostClass, 'min-h-8 px-3 text-xs')}
                      >
                        <Pencil aria-hidden="true" className="size-3.5" /> Editar
                      </button>
                      <RowActions
                        index={serviceIndex}
                        count={area.services.length}
                        name={`servicio ${service.title}`}
                        onMove={(step) =>
                          persist(
                            items.map((i) =>
                              i.slug === area.slug
                                ? { ...i, services: move(i.services, serviceIndex, step) }
                                : i,
                            ),
                            'Orden guardado.',
                          )
                        }
                        onRemove={() => removeService(area, service)}
                      />
                    </li>
                  ))}
                </ol>
              )}
              <button
                type="button"
                onClick={() => setEditing({ kind: 'service', area: area.slug, slug: null })}
                className="mt-2 inline-flex min-h-9 cursor-pointer items-center gap-1.5 text-sm font-semibold text-accent-text hover:underline"
              >
                <Plus aria-hidden="true" className="size-4" /> Agregar servicio
              </button>
            </div>
          </li>
        ))}
      </ol>

      {editing?.kind === 'area' && (
        <AreaEditor
          area={editingArea}
          takenSlugs={items.filter((i) => i.slug !== editing.slug).map((i) => i.slug)}
          saving={save.isPending}
          error={save.isError ? errorMessage(save.error, 'No se pudo guardar.') : null}
          onSave={saveArea}
          onClose={() => {
            save.reset();
            setEditing(null);
          }}
        />
      )}
      {editing?.kind === 'service' && serviceArea && (
        <ServiceEditor
          area={serviceArea}
          service={editingService}
          saving={save.isPending}
          error={save.isError ? errorMessage(save.error, 'No se pudo guardar.') : null}
          onSave={(service) => saveService(serviceArea.slug, service)}
          onClose={() => {
            save.reset();
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
