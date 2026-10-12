import { Activity, CalendarDays, FileText, FilePen, Image, Images, Info, Tags } from 'lucide-react';
import type { AdminStats } from '@orion-lex/shared';
import {
  BarList,
  ChartCard,
  ColumnChart,
  StatTile,
  type ChartDatum,
} from '@/components/admin/charts';
import { Notice } from '@/components/admin/Notice';
import { PageHeader } from '@/components/admin/PageHeader';
import { errorMessage } from '@/lib/api-client';
import { formatBytes } from '@/lib/format';
import { useStats } from '../hooks/use-stats';

const MONTHS = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sept',
  'oct',
  'nov',
  'dic',
];

/** "2026-10" → "oct" (y el año completo en el detalle). */
const monthLabel = (month: string) => MONTHS[Number(month.slice(5, 7)) - 1] ?? month;
const monthLong = (month: string) => `${monthLabel(month)} ${month.slice(0, 4)}`;
/** "2026-10-07" → "7 oct" */
const dayLabel = (day: string) => `${Number(day.slice(8, 10))} ${monthLabel(day.slice(0, 7))}`;
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** Nombre amable de cada carpeta de imágenes. */
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

function toCharts(stats: AdminStats) {
  const months: ChartDatum[] = stats.byMonth.map((m) => ({
    label: monthLabel(m.month),
    value: m.count,
    detail: `${monthLong(m.month)} · ${plural(m.count, 'noticia publicada', 'noticias publicadas')}`,
  }));
  const categories: ChartDatum[] = stats.byCategory.map((c) => ({
    label: c.name,
    value: c.published + c.drafts,
    detail: `${plural(c.published, 'publicada', 'publicadas')} · ${plural(c.drafts, 'borrador', 'borradores')}`,
  }));
  const folders: ChartDatum[] = stats.byFolder.map((f) => ({
    label: FOLDER_LABELS[f.folder] ?? f.folder,
    value: f.count,
    detail: `${f.inUse} en uso · ${formatBytes(f.bytes)}`,
  }));
  const days: ChartDatum[] = stats.activityByDay.map((d) => ({
    label: dayLabel(d.day),
    value: d.count,
    detail: `${dayLabel(d.day)} · ${plural(d.count, 'cambio', 'cambios')}`,
  }));
  return { months, categories, folders, days };
}

/** Estadísticas: cifras y gráficos de las noticias, las imágenes y el uso del panel. */
export function StatsView() {
  const { data, isPending, isError, error } = useStats();

  return (
    <div className="space-y-7">
      <PageHeader
        title="Estadísticas"
        description="Cómo crece el contenido del sitio: noticias publicadas, temas, imágenes y cambios hechos desde el panel."
      />
      {isError && (
        <Notice tone="error">
          {errorMessage(error, 'No se pudieron cargar las estadísticas. Recarga la página.')}
        </Notice>
      )}
      {isPending && <p className="text-sm text-muted">Cargando estadísticas…</p>}
      {data && <Charts stats={data} />}
    </div>
  );
}

function Charts({ stats }: { stats: AdminStats }) {
  const { months, categories, folders, days } = toCharts(stats);
  const { totals } = stats;
  const busiest = stats.byMonth.reduce((a, b) => (b.count > a.count ? b : a), stats.byMonth[0]!);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatTile
          icon={FileText}
          label="Noticias publicadas"
          value={String(totals.published)}
          note={`${totals.drafts} en borrador`}
        />
        <StatTile
          icon={CalendarDays}
          label="Mes con más noticias"
          value={busiest.count ? monthLong(busiest.month) : '–'}
          note={
            busiest.count ? plural(busiest.count, 'noticia', 'noticias') : 'Aún sin publicaciones'
          }
        />
        <StatTile
          icon={Images}
          label="Fotos en la biblioteca"
          value={String(totals.images)}
          note={`${formatBytes(totals.bytes)} en total`}
        />
        <StatTile
          icon={Activity}
          label="Cambios en 30 días"
          value={String(totals.actions30d)}
          note="Hechos desde el panel"
        />
      </div>

      <div className="grid gap-6 2xl:grid-cols-2">
        <ChartCard
          title="Noticias publicadas por mes"
          description="Últimos 12 meses, según la fecha de cada noticia."
          icon={FileText}
          data={months}
          valueLabel="Noticias"
        >
          <ColumnChart data={months} label="Noticias publicadas por mes" />
        </ChartCard>

        <ChartCard
          title="Noticias por categoría"
          description="Publicadas y borradores de cada tema."
          icon={Tags}
          data={categories}
          valueLabel="Noticias"
        >
          <BarList data={categories} label="Noticias por categoría" />
        </ChartCard>

        <ChartCard
          title="Fotos por sección"
          description="Cuántas imágenes hay en cada carpeta de la biblioteca."
          icon={Image}
          data={folders}
          valueLabel="Fotos"
        >
          <BarList data={folders} label="Fotos por sección" />
        </ChartCard>

        <ChartCard
          title="Actividad del panel"
          description="Cambios guardados por día en los últimos 30 días."
          icon={FilePen}
          data={days}
          valueLabel="Cambios"
        >
          <ColumnChart data={days} labelEvery={5} label="Cambios guardados por día" />
        </ChartCard>
      </div>

      <p className="flex items-center gap-2 text-xs text-muted">
        <Info aria-hidden="true" className="size-4" />
        Las visitas de la web se verán aquí cuando se conecte Google Analytics.
      </p>
    </>
  );
}
