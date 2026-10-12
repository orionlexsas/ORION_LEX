import type { AdminStats } from '../../../SHARED/src/schemas/admin.schema.js';
import { listArticles, readCategories } from './articles.js';
import { listMedia } from './media.js';
import type { ContentStore } from './store.js';

/** Cifras de la sección Estadísticas: noticias, imágenes y uso del panel. */

const pad = (n: number) => String(n).padStart(2, '0');

/** Los últimos `count` meses (AAAA-MM), del más antiguo al actual. */
function lastMonths(now: Date, count: number) {
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
  });
}

/** Los últimos `count` días (AAAA-MM-DD, hora de Colombia), del más antiguo a hoy. */
function lastDays(now: Date, count: number) {
  return Array.from({ length: count }, (_, i) =>
    dayOf(new Date(now.getTime() - (count - 1 - i) * 86_400_000)),
  );
}

/** Fecha del día en Colombia (UTC−5), para agrupar las acciones. */
const dayOf = (date: Date) => new Date(date.getTime() - 5 * 3_600_000).toISOString().slice(0, 10);

export async function computeStats(store: ContentStore, now: Date): Promise<AdminStats> {
  const [articles, categories, media, activity] = await Promise.all([
    listArticles(store),
    readCategories(store),
    listMedia(store),
    store.activity(100),
  ]);
  const published = articles.filter((a) => a.published);

  const byMonth = lastMonths(now, 12).map((month) => ({
    month,
    count: published.filter((a) => a.date.startsWith(month)).length,
  }));

  const byCategory = categories
    .map((c) => ({
      name: c.name,
      published: published.filter((a) => a.category === c.slug).length,
      drafts: articles.filter((a) => !a.published && a.category === c.slug).length,
    }))
    .filter((c) => c.published + c.drafts > 0)
    .sort((a, b) => b.published + b.drafts - (a.published + a.drafts));

  const folders = new Map<string, AdminStats['byFolder'][number]>();
  for (const item of media) {
    const entry = folders.get(item.folder) ?? { folder: item.folder, count: 0, bytes: 0, inUse: 0 };
    entry.count += 1;
    entry.bytes += item.size;
    if (item.usages.length > 0) entry.inUse += 1;
    folders.set(item.folder, entry);
  }

  const days = lastDays(now, 30);
  const activityByDay = days.map((day) => ({
    day,
    count: activity.filter((a) => dayOf(new Date(a.date)) === day).length,
  }));

  return {
    byMonth,
    byCategory,
    byFolder: [...folders.values()].sort((a, b) => b.count - a.count),
    activityByDay,
    totals: {
      published: published.length,
      drafts: articles.length - published.length,
      images: media.length,
      bytes: media.reduce((sum, m) => sum + m.size, 0),
      actions30d: activityByDay.reduce((sum, d) => sum + d.count, 0),
    },
  };
}
