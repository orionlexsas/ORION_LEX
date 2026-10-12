import { useState } from 'react';
import { Link } from 'react-router';
import {
  AppWindow,
  ArrowUp,
  ChevronRight,
  Clock,
  ExternalLink,
  FileText,
  FilePen,
  Image,
  Calendar,
  Minus,
  type LucideIcon,
} from 'lucide-react';
import type { AdminActivity, AdminOverview } from '@orion-lex/shared';
import { AdminCard } from '@/components/admin/AdminCard';
import { Notice } from '@/components/admin/Notice';
import { PageHeader } from '@/components/admin/PageHeader';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { outlineAccentClass } from '@/components/admin/styles';
import { errorMessage } from '@/lib/api-client';
import { cn } from '@/lib/cn';
import { formatDate, timeAgo } from '@/lib/format';
import { useActivity, useOverview } from '../hooks/use-overview';

/** Página de inicio del panel: cifras, últimas noticias, vista previa y últimas acciones. */
export function DashboardView({ userName }: { userName: string }) {
  const { data, isPending, isError, error } = useOverview();
  const firstName = userName.split(' ')[0];

  return (
    <div className="grid grid-cols-1 gap-7 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,30rem)]">
      <div className="min-w-0 space-y-7">
        <PageHeader
          title="Panel administrativo"
          description={`Bienvenido/a, ${firstName}. Desde aquí puedes gestionar todo el contenido del sitio web de Orión Lex Servicios Jurídicos.`}
        />
        {isError && (
          <Notice tone="error">
            {errorMessage(error, 'No se pudo cargar el resumen. Recarga la página.')}
          </Notice>
        )}
        <Stats data={data} />
        <LatestNews data={data} loading={isPending} />
      </div>

      <div className="min-w-0 space-y-7">
        <SitePreview data={data} />
        <Activity items={data?.activity} />
        {data && (
          <Notice tone="info">
            {data.mode === 'local'
              ? 'Modo local: los cambios se guardan en los archivos del proyecto y se ven al instante en http://localhost:5173.'
              : 'Los cambios se publican en orionlex.co en 1 a 2 minutos después de guardarlos.'}
          </Notice>
        )}
      </div>
    </div>
  );
}

function Stats({ data }: { data?: AdminOverview }) {
  const stats = data?.stats;
  const cards: {
    icon: LucideIcon;
    label: string;
    value: string;
    trend: string;
    up?: boolean;
    tone: string;
  }[] = [
    {
      icon: FileText,
      label: 'Noticias publicadas',
      value: String(stats?.published ?? '–'),
      trend: stats?.publishedThisMonth
        ? `+${stats.publishedThisMonth} este mes`
        : 'Sin nuevas este mes',
      up: !!stats?.publishedThisMonth,
      tone: 'bg-accent/12 text-accent',
    },
    {
      icon: FilePen,
      label: 'Borradores',
      value: String(stats?.drafts ?? '–'),
      trend: 'Sin publicar',
      tone: 'bg-foreground/8 text-foreground',
    },
    {
      icon: Image,
      label: 'Fotos en la biblioteca',
      value: String(stats?.images ?? '–'),
      trend: stats ? `${stats.imagesInUse} en uso en la web` : '',
      tone: 'bg-accent/12 text-accent',
    },
    {
      icon: Calendar,
      label: 'Última publicación',
      value: stats?.lastPublished ? formatDate(stats.lastPublished) : '–',
      trend: stats?.lastPublished ? timeAgo(stats.lastPublished) : 'Aún no hay noticias',
      tone: 'bg-accent/12 text-accent',
    },
  ];

  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4 2xl:grid-cols-4">
      {cards.map(({ icon: Icon, label, value, trend, up, tone }) => (
        <li
          key={label}
          className="rounded-2xl border border-border bg-background p-4 shadow-sm sm:p-5"
        >
          <span className={cn('grid size-12 place-items-center rounded-xl', tone)}>
            <Icon aria-hidden="true" className="size-6" strokeWidth={1.6} />
          </span>
          <p className="mt-4 text-[0.8rem] font-semibold sm:text-sm">{label}</p>
          <p
            className={cn(
              'mt-1 font-semibold tabular-nums',
              value.length > 6 ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-4xl',
            )}
          >
            {value}
          </p>
          <p
            className={cn(
              'mt-2 flex items-center gap-1.5 text-sm',
              up ? 'text-success' : 'text-muted',
            )}
          >
            {up ? (
              <ArrowUp aria-hidden="true" className="size-4" />
            ) : (
              <Minus aria-hidden="true" className="size-4" />
            )}
            {trend}
          </p>
        </li>
      ))}
    </ul>
  );
}

function Thumb({ src }: { src?: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <span className="grid h-12 w-16 shrink-0 place-items-center rounded-md bg-ink text-accent">
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
      className="h-12 w-16 shrink-0 rounded-md object-cover"
    />
  );
}

function LatestNews({ data, loading }: { data?: AdminOverview; loading: boolean }) {
  const categoryName = (slug: string) =>
    data?.categories.find((c) => c.slug === slug)?.name ?? slug;

  return (
    <AdminCard
      title="Últimas noticias"
      icon={FileText}
      action={
        <Link to="/admin/noticias" className={outlineAccentClass}>
          Ver todas <ChevronRight aria-hidden="true" className="size-4" />
        </Link>
      }
      bodyClassName="px-0 pb-2 sm:px-0"
    >
      {loading ? (
        <p className="px-6 py-8 text-sm text-muted">Cargando…</p>
      ) : !data?.latestArticles.length ? (
        <p className="px-6 py-8 text-sm text-muted">
          Aún no hay noticias. Crea la primera desde Noticias.
        </p>
      ) : (
        <div className="relative overflow-x-auto">
          <table className="w-full min-w-[40rem] text-sm">
            <thead>
              <tr className="bg-surface text-left text-[0.8rem] font-semibold">
                <th className="px-6 py-3">Título</th>
                <th className="px-3 py-3">Fecha</th>
                <th className="px-3 py-3">Estado</th>
                <th className="px-3 py-3">Categoría</th>
                <th className="px-6 py-3 text-right">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.latestArticles.map((article) => (
                <tr key={article.slug} className="border-b border-border last:border-0">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-4">
                      <Thumb src={article.image?.src} />
                      <span className="line-clamp-2 font-medium">{article.title}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-muted">
                    {formatDate(article.date)}
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge published={article.published} />
                  </td>
                  <td className="px-3 py-3 text-muted">{categoryName(article.category)}</td>
                  <td className="px-6 py-3 text-right">
                    <Link
                      to={`/admin/noticias?editar=${article.slug}`}
                      className="font-semibold text-accent-text hover:underline"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminCard>
  );
}

function SitePreview({ data }: { data?: AdminOverview }) {
  const [first, ...rest] = (data?.hero.title ?? '').split(' ');
  const last = rest.pop();

  return (
    <AdminCard
      title="Vista previa del sitio web"
      icon={AppWindow}
      action={
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          aria-label="Abrir el sitio web en otra pestaña"
          className="grid size-10 place-items-center rounded-lg text-muted hover:bg-foreground/5 hover:text-foreground"
        >
          <ExternalLink aria-hidden="true" className="size-5" />
        </a>
      }
      bodyClassName="pt-4"
    >
      <a
        href="/"
        target="_blank"
        rel="noreferrer"
        className="on-dark relative block aspect-[16/10] overflow-hidden rounded-xl bg-ink"
      >
        {data?.hero.image && (
          <img
            src={data.hero.image}
            alt=""
            className="absolute inset-0 size-full object-cover opacity-70"
          />
        )}
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/50 to-transparent"
        />
        <span className="absolute inset-x-4 top-3 flex items-center justify-between">
          <img src="/brand/wordmark-blanco.webp" alt="" className="h-5 w-auto" />
          <span className="hidden gap-3 text-[0.6rem] text-white/80 sm:flex">
            <span>Inicio</span>
            <span>Servicios</span>
            <span>Actualidad</span>
            <span>Contacto</span>
          </span>
        </span>
        <span className="absolute bottom-5 left-5 max-w-[65%]">
          <span className="block font-serif text-xl leading-tight font-semibold sm:text-2xl">
            {first} {rest.join(' ')} <span className="text-accent">{last}</span>
          </span>
          <span className="mt-3 inline-flex items-center gap-1.5 rounded bg-accent px-2.5 py-1 text-[0.65rem] font-semibold text-on-accent">
            Ver el sitio <ChevronRight aria-hidden="true" className="size-3" />
          </span>
        </span>
      </a>
    </AdminCard>
  );
}

const dotColor = (message: string) =>
  message.startsWith('Se publicó')
    ? 'bg-success'
    : /^Se (subió|reemplazó)/.test(message)
      ? 'bg-accent'
      : 'bg-muted/60';

function Activity({ items }: { items?: AdminActivity[] }) {
  const [showAll, setShowAll] = useState(false);
  const all = useActivity(showAll);
  const list = showAll && all.data ? all.data : items;

  return (
    <AdminCard
      title="Últimas acciones"
      icon={Clock}
      action={
        !showAll && (items?.length ?? 0) >= 5 ? (
          <button type="button" onClick={() => setShowAll(true)} className={outlineAccentClass}>
            Ver todas <ChevronRight aria-hidden="true" className="size-4" />
          </button>
        ) : undefined
      }
    >
      {!list?.length ? (
        <p className="text-sm text-muted">Todavía no hay cambios hechos desde el panel.</p>
      ) : (
        <ol className="relative space-y-5 before:absolute before:top-2 before:bottom-2 before:left-[5px] before:w-px before:bg-border">
          {list.map((item, index) => {
            const [action, detail] = item.message.split(/ (?=«)/);
            return (
              <li key={`${item.date}-${index}`} className="relative flex gap-4">
                <span
                  aria-hidden="true"
                  className={cn(
                    'relative mt-1.5 size-[11px] shrink-0 rounded-full ring-4 ring-background',
                    dotColor(item.message),
                  )}
                />
                <div className="min-w-0 text-sm">
                  <p className="font-semibold">{action}</p>
                  {detail && <p className="truncate">{detail.replace(/[«»]/g, '"')}</p>}
                  <p className="mt-0.5 text-xs text-muted">
                    {timeAgo(item.date)} · {item.author}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </AdminCard>
  );
}
