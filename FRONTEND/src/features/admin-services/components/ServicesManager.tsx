import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Briefcase, Megaphone } from 'lucide-react';
import { Notice } from '@/components/admin/Notice';
import { PageHeader } from '@/components/admin/PageHeader';
import { errorMessage } from '@/lib/api-client';
import { cn } from '@/lib/cn';
import { setFlash, takeFlash } from '@/lib/flash';
import { useServices } from '../hooks/use-services';
import { AreasTab } from './AreasTab';
import { LandingsTab } from './LandingsTab';

const TABS = [
  { id: 'areas', label: 'Áreas y servicios', icon: Briefcase },
  { id: 'asuntos', label: 'Asuntos frecuentes', icon: Megaphone },
] as const;

/** Servicios: categorías con sus servicios y asuntos frecuentes (páginas para anuncios). */
export function ServicesManager() {
  const { data, isPending, isError, error } = useServices();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'asuntos' ? 'asuntos' : 'areas';
  const [message, setMessageState] = useState<string | null>(() => takeFlash());
  const setMessage = (text: string) => {
    setFlash(text); // por si Vite recarga la página en local
    setMessageState(text);
  };

  // El respaldo del mensaje solo sirve para una recarga inmediata; luego se borra.
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setFlash(null), 5000);
    return () => clearTimeout(timer);
  }, [message]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Servicios"
        description="Crea y edita las categorías, sus servicios y los asuntos frecuentes. Cada uno tiene su propia URL para compartir en Facebook."
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
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={tab === id}
            onClick={() => setParams(id === 'areas' ? {} : { tab: id }, { replace: true })}
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
        ))}
      </div>

      {isError ? (
        <Notice tone="error">
          {errorMessage(error, 'No se pudieron cargar los servicios. Recarga la página.')}
        </Notice>
      ) : isPending ? (
        <p className="text-sm text-muted">Cargando servicios…</p>
      ) : tab === 'areas' ? (
        <AreasTab items={data.areas.items} onMessage={setMessage} />
      ) : (
        <LandingsTab landings={data.landings} onMessage={setMessage} />
      )}
    </div>
  );
}
