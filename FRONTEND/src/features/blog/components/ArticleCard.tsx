import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import type { ArticleContent, BlogContent } from '@orion-lex/shared';
import { MediaPanel } from '@/components/ui/MediaPanel';
import { cn } from '@/lib/cn';
import { ArticleMeta } from './ArticleMeta';

interface ArticleCardProps {
  article: ArticleContent;
  blog: BlogContent;
  headingLevel?: 'h2' | 'h3';
  /** Portada en computador: fila compacta (foto a la izquierda, sin extracto). */
  compact?: boolean;
}

/**
 * Tarjeta de artículo: foto arriba, categoría y fecha, título, extracto y "Leer más".
 * El enlace del título se extiende a toda la tarjeta, así que toda es clicable.
 */
export function ArticleCard({
  article,
  blog,
  headingLevel: Heading = 'h3',
  compact,
}: ArticleCardProps) {
  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-md border border-border bg-background transition-[border-color,box-shadow] duration-300 ease-out-soft hover:border-accent hover:shadow-[0_18px_40px_-26px_rgb(0_0_0/0.35)]',
        compact && 'lg:flex-row',
      )}
    >
      <MediaPanel
        image={article.image}
        icon="file-text"
        tone="light"
        className={cn(
          'aspect-[1.95/1] w-full',
          compact && 'lg:aspect-auto lg:w-[11rem] lg:shrink-0 lg:self-stretch',
        )}
      />
      <div className={cn('flex flex-1 flex-col px-5 pt-5 pb-6', compact && 'lg:py-4')}>
        <ArticleMeta article={article} blog={blog} />
        <Heading
          className={cn(
            'mt-3 font-serif text-[1.45rem] leading-[1.15] font-semibold',
            compact && 'lg:mt-2 lg:text-[1.2rem]',
          )}
        >
          <Link to={`/actualidad/${article.slug}`} className="after:absolute after:inset-0">
            {article.title}
          </Link>
        </Heading>
        <p
          className={cn(
            'mt-3 flex-1 text-[0.95rem] leading-relaxed text-muted',
            compact && 'lg:hidden',
          )}
        >
          {article.excerpt}
        </p>
        <span
          aria-hidden="true"
          className={cn(
            'mt-5 inline-flex items-center gap-2 text-[0.95rem] font-semibold text-accent-text',
            compact && 'lg:mt-2',
          )}
        >
          {blog.readMore}
          <ArrowRight className="size-4 transition-transform duration-300 ease-out-soft group-hover:translate-x-1" />
        </span>
      </div>
    </article>
  );
}
