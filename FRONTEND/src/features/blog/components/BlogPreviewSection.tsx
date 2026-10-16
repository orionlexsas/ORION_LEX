import { useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ArticleContent, BlogContent } from '@orion-lex/shared';
import { Container } from '@/components/ui/Container';
import { MediaPanel } from '@/components/ui/MediaPanel';
import { cn } from '@/lib/cn';
import { categoryName, formatShortDate } from '../lib/format';
import { ArticleMeta } from './ArticleMeta';

interface BlogPreviewSectionProps {
  id: string;
  blog: BlogContent;
  articles: ArticleContent[];
  className?: string;
}

/** Noticias que se ven a la vez en la lista de la derecha. */
const VISIBLE = 3;
/** Cuántas noticias recientes se pueden recorrer con las flechas. */
const RECENT_MAX = 8;

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Actualidad Jurídica en la portada (maqueta del usuario): encabezado con la frase manuscrita y
 * "Ver todos los artículos" a la derecha; debajo, la noticia destacada en una tarjeta grande
 * (foto con la categoría encima, fecha, título, extracto) y a la derecha "Novedades recientes":
 * tres noticias con miniatura y flechas para recorrer las demás (la primera, con línea naranja).
 */
export function BlogPreviewSection({ id, blog, articles, className }: BlogPreviewSectionProps) {
  const { t, i18n } = useTranslation();
  const titleId = `${id}-title`;
  const featured = articles.find((a) => a.featured) ?? articles[0];
  const recent = articles.filter((a) => a !== featured).slice(0, RECENT_MAX);
  const [start, setStart] = useState(0);
  const pages = Math.max(1, recent.length - VISIBLE + 1);
  const shown = recent.slice(start, start + VISIBLE);
  const language = i18n.resolvedLanguage ?? 'es';

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={cn('scroll-mt-20 section-spacing', className)}
    >
      <Container>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="eyebrow">{blog.eyebrow}</p>
            <h2
              id={titleId}
              className="mt-2 font-serif text-[2.5rem] leading-[1.02] font-semibold tracking-tight sm:text-5xl lg:text-[3.2rem]"
            >
              {blog.title}
            </h2>
            <span aria-hidden="true" className="mt-3 block h-0.5 w-12 bg-accent" />
            <p className="mt-3 text-lg leading-relaxed text-muted">{blog.description}</p>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-4 lg:items-end">
            {blog.script && (
              <p aria-hidden="true" className="w-fit max-lg:hidden">
                <span className="block -rotate-3 font-script text-[2rem] leading-none text-foreground/90">
                  {blog.script}
                </span>
                <svg viewBox="0 0 240 18" className="mt-1 ml-auto w-52 text-accent">
                  <path
                    d="M3 15C65 7 140 3 237 5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </p>
            )}
            {articles.length > 0 && (
              <Link
                to="/actualidad"
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-accent px-5 font-semibold transition-colors hover:bg-accent/10"
              >
                {blog.allLabel}
                <ArrowRight aria-hidden="true" className="size-4 text-accent-text" />
              </Link>
            )}
          </div>
        </div>

        {featured ? (
          <div className="mt-6 grid gap-5 lg:grid-cols-[1.12fr_1fr] lg:gap-6">
            {/* Destacada */}
            <article className="group relative flex flex-col overflow-hidden rounded-md border border-border bg-background shadow-[0_14px_36px_-26px_rgb(0_0_0/0.4)]">
              <div className="relative">
                <MediaPanel
                  image={featured.image}
                  icon="file-text"
                  tone="light"
                  className="aspect-[2/1] w-full transition-transform duration-700 ease-out-soft group-hover:scale-[1.02] lg:aspect-[2.4/1]"
                />
                <span className="absolute bottom-0 left-6 bg-accent px-3.5 py-1.5 text-[0.7rem] font-semibold tracking-[0.16em] text-on-accent uppercase">
                  {categoryName(blog, featured.category)}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6 lg:px-7 lg:py-5">
                <p className="flex flex-wrap items-center gap-x-3 text-[0.7rem] font-semibold tracking-[0.16em] text-foreground/70 uppercase">
                  <time dateTime={featured.date}>{formatShortDate(featured.date, language)}</time>
                  {featured.featured && (
                    <>
                      <span aria-hidden="true" className="text-accent">
                        |
                      </span>
                      {blog.featuredLabel}
                    </>
                  )}
                </p>
                <h3 className="mt-2.5 font-serif text-[1.9rem] leading-[1.08] font-semibold tracking-tight lg:text-[2.2rem]">
                  <Link
                    to={`/actualidad/${featured.slug}`}
                    className="after:absolute after:inset-0"
                  >
                    {featured.title}
                  </Link>
                </h3>
                <p className="mt-2 line-clamp-2 leading-relaxed text-muted">{featured.excerpt}</p>
                <span
                  aria-hidden="true"
                  className="mt-3 inline-flex items-center gap-2 font-semibold text-accent-text"
                >
                  {blog.featuredReadMore}
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </div>
            </article>

            {/* Novedades recientes */}
            {recent.length > 0 && (
              <div className="flex flex-col">
                <div className="flex items-center gap-4">
                  <p className="shrink-0 text-[0.7rem] font-semibold tracking-[0.18em] whitespace-nowrap uppercase sm:text-[0.75rem]">
                    {blog.recentLabel ?? blog.latestTitle}
                  </p>
                  <span aria-hidden="true" className="h-px flex-1 bg-border" />
                  {pages > 1 && (
                    <div className="flex items-center gap-1 text-sm text-muted">
                      <span className="mr-1 whitespace-nowrap tabular-nums">
                        {pad(start + 1)} / {pad(pages)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setStart((s) => Math.max(0, s - 1))}
                        disabled={start === 0}
                        aria-label={t('carousel.previous')}
                        className="grid size-8 cursor-pointer place-items-center rounded-full text-accent-text hover:bg-accent/10 disabled:cursor-default disabled:opacity-35"
                      >
                        <ChevronLeft aria-hidden="true" className="size-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setStart((s) => Math.min(pages - 1, s + 1))}
                        disabled={start === pages - 1}
                        aria-label={t('carousel.next')}
                        className="grid size-8 cursor-pointer place-items-center rounded-full text-accent-text hover:bg-accent/10 disabled:cursor-default disabled:opacity-35"
                      >
                        <ChevronRight aria-hidden="true" className="size-5" />
                      </button>
                    </div>
                  )}
                </div>
                <ul className="mt-3 flex flex-1 flex-col divide-y divide-border overflow-hidden rounded-md border border-border bg-background shadow-[0_14px_36px_-26px_rgb(0_0_0/0.4)]">
                  {shown.map((article, i) => (
                    <li
                      key={article.slug}
                      className={cn(
                        'group relative flex flex-1 items-center gap-4 p-3.5 transition-colors hover:bg-accent/5',
                        i === 0 && 'shadow-[inset_4px_0_0_var(--color-accent)]',
                      )}
                    >
                      <MediaPanel
                        image={article.image}
                        icon="file-text"
                        tone="light"
                        className="aspect-[4/3] w-28 shrink-0 rounded-sm sm:w-36"
                      />
                      <div className="flex min-w-0 flex-col">
                        <ArticleMeta article={article} blog={blog} />
                        <h3 className="mt-1.5 line-clamp-2 font-serif text-[1.15rem] leading-tight font-semibold sm:text-[1.3rem]">
                          <Link
                            to={`/actualidad/${article.slug}`}
                            className="after:absolute after:inset-0"
                          >
                            {article.title}
                          </Link>
                        </h3>
                        <span
                          aria-hidden="true"
                          className="mt-auto inline-flex items-center gap-2 pt-1.5 text-[0.95rem] font-semibold text-accent-text"
                        >
                          {blog.readMore}
                          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="mt-6 rounded-md border border-dashed border-border p-10 text-center text-muted">
            {blog.empty}
          </p>
        )}
      </Container>
    </section>
  );
}
