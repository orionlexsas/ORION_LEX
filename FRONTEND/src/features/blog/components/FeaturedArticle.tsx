import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import type { ArticleContent, BlogContent } from '@orion-lex/shared';
import { MediaPanel } from '@/components/ui/MediaPanel';
import { ArticleMeta } from './ArticleMeta';

interface FeaturedArticleProps {
  article: ArticleContent;
  blog: BlogContent;
  headingLevel?: 'h2' | 'h3';
}

/** "Actualidad jurídica de la semana": foto a la izquierda y texto grande a la derecha, sin recuadro. */
export function FeaturedArticle({
  article,
  blog,
  headingLevel: Heading = 'h2',
}: FeaturedArticleProps) {
  return (
    <article className="group relative grid items-center gap-7 md:grid-cols-2 lg:gap-10">
      <MediaPanel
        image={article.image}
        icon="file-text"
        tone="light"
        priority
        className="aspect-[1.54/1] rounded-md"
      />
      <div>
        <ArticleMeta article={article} blog={blog} />
        <p className="mt-2 text-[0.7rem] font-semibold tracking-[0.16em] text-muted uppercase">
          {blog.featuredLabel}
        </p>
        <Heading className="mt-4 font-serif text-3xl leading-[1.1] font-semibold tracking-tight sm:text-4xl lg:text-[2.6rem]">
          <Link to={`/actualidad/${article.slug}`} className="after:absolute after:inset-0">
            {article.title}
          </Link>
        </Heading>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">{article.excerpt}</p>
        <span
          aria-hidden="true"
          className="mt-6 inline-flex items-center gap-2 font-semibold text-accent-text"
        >
          {blog.featuredReadMore}
          <ArrowRight className="size-4 transition-transform duration-300 ease-out-soft group-hover:translate-x-1" />
        </span>
      </div>
    </article>
  );
}
