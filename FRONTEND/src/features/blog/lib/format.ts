import type { BlogContent } from '@orion-lex/shared';

const MONTHS: Record<string, string[]> = {
  es: ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'],
  en: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
};

/** Fecha corta en mayúsculas ("25 SEP 2026") a partir de AAAA-MM-DD, sin desfase de zona horaria. */
export function formatShortDate(date: string, language: string) {
  const [year, month, day] = date.split('-');
  const months = MONTHS[language] ?? MONTHS.es!;
  return `${day} ${months[Number(month) - 1]} ${year}`;
}

/** Nombre visible de una categoría (slug → nombre de blog.json). */
export function categoryName(blog: BlogContent, slug: string) {
  return blog.categories.find((c) => c.slug === slug)?.name ?? slug;
}
