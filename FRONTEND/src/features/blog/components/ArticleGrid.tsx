import type { ArticleContent, BlogContent } from '@orion-lex/shared';
import { cn } from '@/lib/cn';
import { ArticleCard } from './ArticleCard';

interface ArticleGridProps {
  articles: ArticleContent[];
  blog: BlogContent;
  headingLevel?: 'h2' | 'h3';
}

/**
 * El artículo destacado ("Actualidad jurídica de la semana") arriba y el resto en cuadrícula.
 * Si ninguno está marcado como destacado, todos van en la cuadrícula.
 */
export function ArticleGrid({ articles, blog, headingLevel }: ArticleGridProps) {
  if (articles.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-10 text-center text-muted">
        {blog.empty}
      </p>
    );
  }
  const featured = articles.find((a) => a.featured);
  const rest = articles.filter((a) => a !== featured);

  return (
    <div className="grid gap-6">
      {featured && (
        <ArticleCard article={featured} blog={blog} featured headingLevel={headingLevel} />
      )}
      {rest.length > 0 && (
        <ul className={cn('grid gap-6 md:grid-cols-2', rest.length >= 3 && 'lg:grid-cols-3')}>
          {rest.map((article) => (
            <li key={article.slug} className="grid">
              <ArticleCard article={article} blog={blog} headingLevel={headingLevel} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
