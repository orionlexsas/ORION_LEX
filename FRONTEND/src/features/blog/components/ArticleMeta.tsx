import { useTranslation } from 'react-i18next';
import type { ArticleContent, BlogContent } from '@orion-lex/shared';
import { cn } from '@/lib/cn';
import { categoryName, formatShortDate } from '../lib/format';

interface ArticleMetaProps {
  article: ArticleContent;
  blog: BlogContent;
  className?: string;
}

/** Categoría (naranja) y fecha corta ("25 SEP 2026") en versalitas espaciadas. */
export function ArticleMeta({ article, blog, className }: ArticleMetaProps) {
  const { i18n } = useTranslation();
  return (
    <p
      className={cn(
        'flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.7rem] font-semibold tracking-[0.16em] uppercase',
        className,
      )}
    >
      <span className="text-accent-text">{categoryName(blog, article.category)}</span>
      <span aria-hidden="true" className="text-muted">
        ·
      </span>
      <time dateTime={article.date} className="text-muted">
        {formatShortDate(article.date, i18n.resolvedLanguage ?? 'es')}
      </time>
    </p>
  );
}
