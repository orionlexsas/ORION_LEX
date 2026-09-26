import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import type { ArticleContent, BlogContent } from '@orion-lex/shared';
import { MediaPanel } from '@/components/ui/MediaPanel';
import { cn } from '@/lib/cn';
import { ArticleMeta } from './ArticleMeta';

interface ArticleCardProps {
  article: ArticleContent;
  blog: BlogContent;
  /** Tarjeta grande horizontal ("Actualidad jurídica de la semana"). */
  featured?: boolean;
  headingLevel?: 'h2' | 'h3';
}

/**
 * Tarjeta de artículo: imagen, categoría, fecha, título, extracto y "Leer más".
 * El enlace del título se extiende a toda la tarjeta, así que toda es clicable.
 */
export function ArticleCard({
  article,
  blog,
  featured,
  headingLevel: Heading = 'h3',
}: ArticleCardProps) {
  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-lg border border-border bg-background transition-[border-color,box-shadow] duration-300 ease-out-soft hover:border-accent hover:shadow-[0_18px_40px_-26px_rgb(0_0_0/0.35)]',
        featured && 'lg:flex-row',
      )}
    >
      <MediaPanel
        image={article.image}
        icon="file-text"
        tone="light"
        className={cn('aspect-[16/9] w-full', featured && 'lg:aspect-auto lg:w-1/2')}
      />
      <div className={cn('flex flex-1 flex-col p-6', featured && 'lg:p-10')}>
        {featured && (
          <p className="mb-4 self-start rounded-sm bg-accent px-2.5 py-1 text-xs font-semibold tracking-wide text-on-accent uppercase">
            {blog.featuredLabel}
          </p>
        )}
        <ArticleMeta article={article} blog={blog} />
        <Heading
          className={cn(
            'mt-3 font-serif leading-snug font-semibold',
            featured ? 'text-2xl sm:text-3xl' : 'text-xl',
          )}
        >
          <Link to={`/actualidad/${article.slug}`} className="after:absolute after:inset-0">
            {article.title}
          </Link>
        </Heading>
        <p className="mt-3 flex-1 leading-relaxed text-muted">{article.excerpt}</p>
        <span
          aria-hidden="true"
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent-text"
        >
          {blog.readMore}
          <ArrowRight className="size-4 transition-transform duration-300 ease-out-soft group-hover:translate-x-1" />
        </span>
      </div>
    </article>
  );
}
