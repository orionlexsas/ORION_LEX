import type { ArticleContent, BlogContent } from '@orion-lex/shared';
import { CarouselNav } from '@/components/ui/CarouselNav';
import { carouselItem, carouselTrack, useCarousel } from '@/hooks/use-carousel';
import { cn } from '@/lib/cn';
import { ArticleCard } from './ArticleCard';
import { FeaturedArticle } from './FeaturedArticle';

interface ArticleGridProps {
  articles: ArticleContent[];
  blog: BlogContent;
  /** Nivel del título de cada artículo (h2 si la página solo tiene el H1 encima). */
  headingLevel?: 'h2' | 'h3';
  /** Muestra "Últimos artículos" con una línea entre el destacado y la cuadrícula. */
  showLatestTitle?: boolean;
  /** En celular, los artículos se deslizan de lado en vez de apilarse (portada). */
  carouselOnMobile?: boolean;
  /**
   * Portada en computador: el destacado a la izquierda y los demás en una lista compacta a la
   * derecha, para que la sección quepa en la pantalla sin bajar.
   */
  compact?: boolean;
}

/**
 * El artículo destacado ("Actualidad jurídica de la semana") entre dos líneas, y el resto en
 * una cuadrícula de tres columnas. Si ninguno está destacado, todos van en la cuadrícula.
 */
export function ArticleGrid({
  articles,
  blog,
  headingLevel,
  showLatestTitle,
  carouselOnMobile,
  compact,
}: ArticleGridProps) {
  const { ref: carouselRef, nav: carouselNav } = useCarousel();
  if (articles.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border p-10 text-center text-muted">
        {blog.empty}
      </p>
    );
  }
  const featured = articles.find((a) => a.featured);
  const rest = articles.filter((a) => a !== featured);
  const cardHeading = showLatestTitle ? 'h3' : headingLevel;

  return (
    <div
      className={cn(
        compact && featured && 'lg:grid lg:grid-cols-[1.15fr_1fr] lg:items-start lg:gap-8',
      )}
    >
      {featured && (
        <div
          className={cn('border-y border-border py-8 lg:py-10', compact && 'lg:border-0 lg:py-0')}
        >
          <FeaturedArticle
            article={featured}
            blog={blog}
            headingLevel={headingLevel}
            compact={compact}
          />
        </div>
      )}
      {rest.length > 0 && (
        <>
          {showLatestTitle && (
            <div className="mt-10 flex items-center gap-6 max-sm:mt-7 lg:mt-12">
              <h2 className="shrink-0 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                {blog.latestTitle}
              </h2>
              <span aria-hidden="true" className="h-px flex-1 bg-border" />
            </div>
          )}
          <ul
            ref={carouselRef}
            className={cn(
              'mt-8 grid gap-4 sm:grid-cols-2 lg:gap-5',
              rest.length >= 3 && !compact && 'lg:grid-cols-3',
              compact && 'lg:mt-0 lg:grid-cols-1 lg:gap-3',
              carouselOnMobile && carouselTrack,
            )}
          >
            {rest.map((article) => (
              <li key={article.slug} className={cn(carouselOnMobile && carouselItem)}>
                <ArticleCard
                  article={article}
                  blog={blog}
                  headingLevel={cardHeading}
                  compact={compact}
                />
              </li>
            ))}
          </ul>
          {carouselOnMobile && <CarouselNav {...carouselNav} />}
        </>
      )}
    </div>
  );
}
