import { useState, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

/*
 * Gráficos sencillos del panel (sin librerías): una sola serie en el color `chart`.
 * Barras finas (máx. 24 px) con la punta redondeada, guías de 1 px, valor en el máximo y el
 * último dato, detalle al pasar el mouse o con el teclado, y siempre una vista de tabla.
 */

export interface ChartDatum {
  label: string;
  value: number;
  /** Texto del detalle al pasar el mouse (por defecto "label: value"). */
  detail?: string;
}

interface ChartCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  data: ChartDatum[];
  /** Nombre de la columna de valores en la vista de tabla. */
  valueLabel: string;
  formatValue?: (value: number) => string;
  children: ReactNode;
  className?: string;
}

/** Tarjeta con título, el gráfico y un botón para verlo como tabla. */
export function ChartCard({
  title,
  description,
  icon: Icon,
  data,
  valueLabel,
  formatValue = String,
  children,
  className,
}: ChartCardProps) {
  const [table, setTable] = useState(false);
  return (
    <section
      className={cn(
        'rounded-2xl border border-border bg-background p-5 shadow-sm sm:p-6',
        className,
      )}
    >
      <header className="mb-5 flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <Icon aria-hidden="true" className="mt-1 size-6 shrink-0 text-accent" strokeWidth={1.6} />
          <div>
            <h2 className="font-serif text-xl font-semibold sm:text-2xl">{title}</h2>
            <p className="mt-0.5 text-sm text-muted">{description}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setTable((v) => !v)}
          aria-pressed={table}
          className="shrink-0 cursor-pointer rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted hover:bg-foreground/5 hover:text-foreground"
        >
          {table ? 'Ver gráfico' : 'Ver tabla'}
        </button>
      </header>
      {table ? (
        <div className="max-h-80 overflow-y-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="py-2 font-semibold">Dato</th>
                <th className="py-2 text-right font-semibold">{valueLabel}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.label} className="border-b border-border last:border-0">
                  <td className="py-2">{d.label}</td>
                  <td className="py-2 text-right tabular-nums">{formatValue(d.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        children
      )}
    </section>
  );
}

/** Máximo "redondo" del eje (1, 2, 5, 10, 20…), nunca menor que el dato más alto. */
function niceMax(max: number) {
  if (max <= 4) return Math.max(1, max);
  const power = 10 ** Math.floor(Math.log10(max));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * power >= max) ?? 10;
  return step * power;
}

interface ColumnChartProps {
  data: ChartDatum[];
  /** Cada cuántas columnas se escribe la etiqueta del eje (1 = todas). */
  labelEvery?: number;
  formatValue?: (value: number) => string;
  /** Nombre del gráfico para lectores de pantalla. */
  label: string;
}

/** Columnas verticales (cambio en el tiempo: meses, días). */
export function ColumnChart({
  data,
  labelEvery = 1,
  formatValue = String,
  label,
}: ColumnChartProps) {
  const [active, setActive] = useState<number | null>(null);
  const max = niceMax(Math.max(0, ...data.map((d) => d.value)));
  const ticks = max % 2 === 0 ? [max, max / 2, 0] : [max, 0];
  const top = data.reduce((best, d, i) => (d.value > (data[best]?.value ?? 0) ? i : best), 0);
  const last = data.length - 1;

  return (
    <figure aria-label={label} className="relative">
      <div className="flex gap-3">
        {/* Eje Y */}
        <div className="flex h-52 flex-col justify-between pb-px text-right text-xs text-muted tabular-nums">
          {ticks.map((t) => (
            <span key={t} className="-translate-y-1/2 leading-none last:translate-y-1/2">
              {formatValue(t)}
            </span>
          ))}
        </div>
        <div className="relative flex-1">
          {/* Guías */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 flex h-52 flex-col justify-between"
          >
            {ticks.map((t) => (
              <span key={t} className="h-px bg-chart-grid" />
            ))}
          </div>
          <ol className="relative flex h-52 items-end" onMouseLeave={() => setActive(null)}>
            {data.map((d, i) => {
              const showValue = d.value > 0 && (i === top || i === last);
              return (
                <li
                  key={d.label}
                  tabIndex={0}
                  aria-label={d.detail ?? `${d.label}: ${formatValue(d.value)}`}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  className="group relative flex h-full flex-1 cursor-default flex-col items-center justify-end px-px focus:outline-none"
                >
                  {showValue && (
                    <span className="mb-1 text-xs font-semibold tabular-nums">
                      {formatValue(d.value)}
                    </span>
                  )}
                  <span
                    className={cn(
                      'block w-full max-w-6 rounded-t-[4px] bg-chart transition-opacity',
                      active !== null && active !== i && 'opacity-45',
                      'group-focus-visible:ring-2 group-focus-visible:ring-foreground',
                    )}
                    style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value > 0 ? 3 : 0 }}
                  />
                  {active === i && (
                    <span
                      role="tooltip"
                      className={cn(
                        'pointer-events-none absolute bottom-full z-10 mb-2 rounded-lg bg-ink px-3 py-2 text-xs whitespace-nowrap text-white shadow-lg',
                        i > data.length * 0.7
                          ? 'right-0'
                          : i < data.length * 0.3
                            ? 'left-0'
                            : 'left-1/2 -translate-x-1/2',
                      )}
                    >
                      {d.detail ?? `${d.label}: ${formatValue(d.value)}`}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
          {/* Eje X */}
          <div aria-hidden="true" className="mt-2 flex text-[0.7rem] text-muted">
            {data.map((d, i) => (
              <span
                key={d.label}
                className={cn(
                  'flex-1 text-center whitespace-nowrap',
                  // En pantallas pequeñas, una etiqueta sí y una no para que no se monten.
                  labelEvery === 1 && i % 2 === 1 && i !== last && 'max-sm:invisible',
                )}
              >
                {i % labelEvery === 0 || i === last ? d.label : ''}
              </span>
            ))}
          </div>
        </div>
      </div>
    </figure>
  );
}

interface BarListProps {
  data: ChartDatum[];
  formatValue?: (value: number) => string;
  label: string;
}

/** Barras horizontales ordenadas (comparar categorías o secciones). */
export function BarList({ data, formatValue = String, label }: BarListProps) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));

  if (data.length === 0) return <p className="text-sm text-muted">Todavía no hay datos.</p>;
  return (
    <ol aria-label={label} className="space-y-3" onMouseLeave={() => setActive(null)}>
      {data.map((d, i) => (
        <li
          key={d.label}
          tabIndex={0}
          aria-label={d.detail ?? `${d.label}: ${formatValue(d.value)}`}
          onMouseEnter={() => setActive(i)}
          onFocus={() => setActive(i)}
          onBlur={() => setActive(null)}
          className="relative grid grid-cols-[minmax(7rem,11rem)_1fr] items-center gap-3 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
        >
          <span className="truncate text-sm">{d.label}</span>
          <span className="flex items-center gap-2">
            <span
              className={cn(
                'block h-5 max-h-6 rounded-r-[4px] bg-chart transition-opacity',
                active !== null && active !== i && 'opacity-45',
              )}
              style={{ width: `${(d.value / max) * 100}%`, minWidth: d.value > 0 ? 3 : 0 }}
            />
            <span className="shrink-0 text-xs font-semibold tabular-nums">
              {formatValue(d.value)}
            </span>
          </span>
          {active === i && d.detail && (
            <span
              role="tooltip"
              className="pointer-events-none absolute right-0 bottom-full z-10 mb-1 rounded-lg bg-ink px-3 py-2 text-xs whitespace-nowrap text-white shadow-lg"
            >
              {d.detail}
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

interface StatTileProps {
  label: string;
  value: string;
  note?: string;
  icon: LucideIcon;
}

/** Cifra destacada (sin gráfico). */
export function StatTile({ label, value, note, icon: Icon }: StatTileProps) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4 shadow-sm sm:p-5">
      <span className="grid size-11 place-items-center rounded-xl bg-accent/12 text-accent">
        <Icon aria-hidden="true" className="size-5.5" strokeWidth={1.6} />
      </span>
      <p className="mt-4 text-[0.8rem] font-semibold sm:text-sm">{label}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums">{value}</p>
      {note && <p className="mt-1 text-xs text-muted sm:text-sm">{note}</p>}
    </div>
  );
}
