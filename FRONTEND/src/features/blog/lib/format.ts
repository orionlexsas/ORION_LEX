import type { BlogContent } from '@orion-lex/shared';

/** Fecha legible ("18 de septiembre de 2026") a partir de AAAA-MM-DD, sin desfase de zona horaria. */
export function formatDate(date: string, language: string) {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year!, month! - 1, day!).toLocaleDateString(
    language === 'en' ? 'en-US' : 'es-CO',
    { day: 'numeric', month: 'long', year: 'numeric' },
  );
}

/** Nombre visible de una categoría (slug → nombre de blog.json). */
export function categoryName(blog: BlogContent, slug: string) {
  return blog.categories.find((c) => c.slug === slug)?.name ?? slug;
}
