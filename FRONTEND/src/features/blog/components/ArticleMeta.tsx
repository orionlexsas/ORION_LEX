import { useTranslation } from 'react-i18next';
import type { ArticleContent, BlogContent } from '@orion-lex/shared';
import { cn } from '@/lib/cn';
import { categoryName, formatDate } from '../lib/format';

interface ArticleMetaProps {
  article: ArticleContent;
  blog: BlogContent;
  className?: string;
}

/** Categoría y fecha de un artículo. */
export function ArticleMeta({ article, blog, className }: ArticleMetaProps) {
  const { i18n } = useTranslation();
  return (
    <p className={cn('flex flex-wrap items-center gap-x-3 gap-y-1 text-sm', className)}>
      <span className="font-semibold tracking-wide text-accent-text uppercase">
        {categoryName(blog, article.category)}
      </span>
      <span aria-hidden="true" className="text-muted">
        ·
      </span>
      <time dateTime={article.date} className="text-muted">
        {formatDate(article.date, i18n.resolvedLanguage ?? 'es')}
      </time>
    </p>
  );
}
