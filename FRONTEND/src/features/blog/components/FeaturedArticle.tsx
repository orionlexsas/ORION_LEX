import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import type { ArticleContent, BlogContent } from '@orion-lex/shared';
import { MediaPanel } from '@/components/ui/MediaPanel';
import { cn } from '@/lib/cn';
import { ArticleMeta } from './ArticleMeta';

interface FeaturedArticleProps {
  article: ArticleContent;
  blog: BlogContent;
  headingLevel?: 'h2' | 'h3';
  /** Portada en computador: foto arriba y texto debajo, más pequeño (va en una columna). */
  compact?: boolean;
}

/** "Actualidad jurídica de la semana": foto a la izquierda y texto grande a la derecha, sin recuadro. */
export function FeaturedArticle({
  article,
  blog,
  headingLevel: Heading = 'h2',
  compact,
}: FeaturedArticleProps) {
  return (
    <article
      className={cn(
        'group relative grid items-center gap-7 md:grid-cols-2 lg:gap-10',
        compact && 'lg:grid-cols-1 lg:gap-5',
      )}
    >
      <MediaPanel
        image={article.image}
        icon="file-text"
        tone="light"
        priority
        className={cn('aspect-[1.54/1] rounded-md', compact && 'lg:aspect-[2.75/1]')}
      />
      <div>
        <ArticleMeta article={article} blog={blog} />
        <p className="mt-2 text-xs font-semibold tracking-[0.14em] text-muted uppercase sm:text-[0.7rem] sm:tracking-[0.16em]">
          {blog.featuredLabel}
        </p>
        <Heading
          className={cn(
            'mt-4 font-serif text-3xl leading-[1.1] font-semibold tracking-tight sm:text-4xl lg:text-[2.6rem]',
            compact && 'lg:mt-3 lg:text-[2rem]',
          )}
        >
          <Link to={`/actualidad/${article.slug}`} className="after:absolute after:inset-0">
            {article.title}
          </Link>
        </Heading>
        <p
          className={cn(
            'mt-4 max-w-xl text-lg leading-relaxed text-muted',
            compact && 'lg:mt-2 lg:line-clamp-2 lg:text-base',
          )}
        >
          {article.excerpt}
        </p>
        <span
          aria-hidden="true"
          className={cn(
            'mt-6 inline-flex items-center gap-2 font-semibold text-accent-text',
            compact && 'lg:mt-3',
          )}
        >
          {blog.featuredReadMore}
          <ArrowRight className="size-4 transition-transform duration-300 ease-out-soft group-hover:translate-x-1" />
        </span>
      </div>
    </article>
  );
}
