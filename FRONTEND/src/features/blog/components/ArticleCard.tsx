import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import type { ArticleContent, BlogContent } from '@orion-lex/shared';
import { MediaPanel } from '@/components/ui/MediaPanel';
import { ArticleMeta } from './ArticleMeta';

interface ArticleCardProps {
  article: ArticleContent;
  blog: BlogContent;
  headingLevel?: 'h2' | 'h3';
}

/**
 * Tarjeta de artículo: foto arriba, categoría y fecha, título, extracto y "Leer más".
 * El enlace del título se extiende a toda la tarjeta, así que toda es clicable.
 */
export function ArticleCard({ article, blog, headingLevel: Heading = 'h3' }: ArticleCardProps) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-md border border-border bg-background transition-[border-color,box-shadow] duration-300 ease-out-soft hover:border-accent hover:shadow-[0_18px_40px_-26px_rgb(0_0_0/0.35)]">
      <MediaPanel
        image={article.image}
        icon="file-text"
        tone="light"
        className="aspect-[1.95/1] w-full"
      />
      <div className="flex flex-1 flex-col px-5 pt-5 pb-6">
        <ArticleMeta article={article} blog={blog} />
        <Heading className="mt-3 font-serif text-[1.45rem] leading-[1.15] font-semibold">
          <Link to={`/actualidad/${article.slug}`} className="after:absolute after:inset-0">
            {article.title}
          </Link>
        </Heading>
        <p className="mt-3 flex-1 text-[0.95rem] leading-relaxed text-muted">{article.excerpt}</p>
        <span
          aria-hidden="true"
          className="mt-5 inline-flex items-center gap-2 text-[0.95rem] font-semibold text-accent-text"
        >
          {blog.readMore}
          <ArrowRight className="size-4 transition-transform duration-300 ease-out-soft group-hover:translate-x-1" />
        </span>
      </div>
    </article>
  );
}
