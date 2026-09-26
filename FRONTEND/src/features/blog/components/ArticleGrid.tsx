import type { ArticleContent, BlogContent } from '@orion-lex/shared';
import { cn } from '@/lib/cn';
import { ArticleCard } from './ArticleCard';
import { FeaturedArticle } from './FeaturedArticle';

interface ArticleGridProps {
  articles: ArticleContent[];
  blog: BlogContent;
  /** Nivel del título de cada artículo (h2 si la página solo tiene el H1 encima). */
  headingLevel?: 'h2' | 'h3';
  /** Muestra "Últimos artículos" con una línea entre el destacado y la cuadrícula. */
  showLatestTitle?: boolean;
}

/**
 * El artículo destacado ("Actualidad jurídica de la semana") entre dos líneas, y el resto en
 * una cuadrícula de tres columnas. Si ninguno está destacado, todos van en la cuadrícula.
 */
export function ArticleGrid({ articles, blog, headingLevel, showLatestTitle }: ArticleGridProps) {
  if (articles.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border p-10 text-center text-muted">
        {blog.empty}
      </p>
    );
  }
  const featured = articles.find((a) => a.featured);
  const rest = articles.filter((a) => a !== featured);
  const cardHeading = showLatestTitle ? 'h3' : headingLevel;

  return (
    <div>
      {featured && (
        <div className="border-y border-border py-8 lg:py-10">
          <FeaturedArticle article={featured} blog={blog} headingLevel={headingLevel} />
        </div>
      )}
      {rest.length > 0 && (
        <>
          {showLatestTitle && (
            <div className="mt-10 flex items-center gap-6 lg:mt-12">
              <h2 className="shrink-0 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                {blog.latestTitle}
              </h2>
              <span aria-hidden="true" className="h-px flex-1 bg-border" />
            </div>
          )}
          <ul
            className={cn(
              'mt-8 grid gap-4 sm:grid-cols-2 lg:gap-5',
              rest.length >= 3 && 'lg:grid-cols-3',
            )}
          >
            {rest.map((article) => (
              <li key={article.slug}>
                <ArticleCard article={article} blog={blog} headingLevel={cardHeading} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
