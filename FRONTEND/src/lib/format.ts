/** Formatos de fechas y tamaños en español (panel de administración). */

const dateFormat = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

/** "2026-10-12" → "12 oct 2026" (sin "de" y sin desfase de zona horaria). */
export function formatDate(isoDate: string) {
  const [year, month, day] = isoDate.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return isoDate;
  const parts = dateFormat.formatToParts(new Date(year, month - 1, day));
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return `${part('day')} ${part('month').replace('.', '')} ${part('year')}`;
}

const relative = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });

/** "Hace 2 horas", "ayer"… */
export function timeAgo(isoDateTime: string, now = Date.now()) {
  const seconds = Math.round((new Date(isoDateTime).getTime() - now) / 1000);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31_536_000],
    ['month', 2_592_000],
    ['week', 604_800],
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
  ];
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit);
  }
  return 'hace un momento';
}

/** 1234567 → "1,2 MB" */
export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
}

/** Fecha de hoy en formato AAAA-MM-DD (hora local). */
export function todayIso() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
