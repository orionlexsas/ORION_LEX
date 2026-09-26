import { Link } from 'react-router';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import type { ArticleContent, BlogContent } from '@orion-lex/shared';
import { CtaLink } from '@/components/cta/CtaLink';
import { StructuredData } from '@/components/seo/StructuredData';
import { Container } from '@/components/ui/Container';
import { Markdown } from '@/components/ui/Markdown';
import { MediaPanel } from '@/components/ui/MediaPanel';
import { ArticleMeta } from './ArticleMeta';
import { ShareButtons } from './ShareButtons';

interface ArticleViewProps {
  article: ArticleContent;
  blog: BlogContent;
  /** URL pública del artículo (para compartir y datos estructurados). */
  url: string;
  publisher: { name: string; logo: string };
}

/** Artículo completo: título, fecha, categoría, imagen, contenido, fuentes, compartir y llamado. */
export function ArticleView({ article, blog, url, publisher }: ArticleViewProps) {
  return (
    <article className="section-spacing">
      <Container className="max-w-3xl">
        <Link
          to="/actualidad"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {blog.backLabel}
        </Link>

        <header className="mt-8">
          {article.featured && (
            <p className="mb-4 inline-block rounded-sm bg-accent px-2.5 py-1 text-xs font-semibold tracking-wide text-on-accent uppercase">
              {blog.featuredLabel}
            </p>
          )}
          <ArticleMeta article={article} blog={blog} />
          <h1 className="mt-4 font-serif text-[2.1rem] leading-[1.12] font-semibold tracking-tight sm:text-5xl">
            {article.title}
          </h1>
          <p className="mt-5 text-xl leading-relaxed text-muted">{article.excerpt}</p>
        </header>

        <MediaPanel
          image={article.image}
          icon="file-text"
          tone="light"
          priority
          className="mt-10 aspect-[16/9] rounded-lg"
        />

        <Markdown className="mt-10">{article.body}</Markdown>

        {article.sources.length > 0 && (
          <aside className="mt-12 rounded-lg bg-surface p-6">
            <h2 className="text-sm font-semibold tracking-wide uppercase">{blog.sourcesLabel}</h2>
            <ul className="mt-3 space-y-2">
              {article.sources.map((source) => (
                <li key={source.url}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-start gap-2 text-accent-text underline underline-offset-4 hover:text-foreground"
                  >
                    {source.label}
                    <ExternalLink className="mt-1 size-3.5 shrink-0" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        )}

        <div className="mt-10 border-t border-border pt-8">
          <ShareButtons url={url} title={article.title} label={blog.shareLabel} />
        </div>

        <aside className="on-dark mt-12 rounded-lg bg-ink p-8 sm:p-10">
          <h2 className="font-serif text-2xl font-semibold sm:text-3xl">{blog.cta.title}</h2>
          <p className="mt-3 text-lg text-foreground/80">{blog.cta.text}</p>
          <CtaLink link={blog.cta.button} location="article" className="mt-6" />
        </aside>
      </Container>

      <StructuredData
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: article.title,
          description: article.excerpt,
          datePublished: article.date,
          mainEntityOfPage: url,
          ...(article.image && { image: new URL(article.image.src, url).href }),
          author: { '@type': 'Organization', name: publisher.name },
          publisher: {
            '@type': 'Organization',
            name: publisher.name,
            logo: { '@type': 'ImageObject', url: publisher.logo },
          },
        }}
      />
    </article>
  );
}
