import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import type { ArticleContent, BlogContent } from '@orion-lex/shared';
import { buttonStyles } from '@/components/ui/button-styles';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { cn } from '@/lib/cn';
import { ArticleGrid } from './ArticleGrid';

interface BlogPreviewSectionProps {
  id: string;
  blog: BlogContent;
  articles: ArticleContent[];
  className?: string;
}

/** Actualidad Jurídica en la portada: el artículo destacado y los más recientes. */
export function BlogPreviewSection({ id, blog, articles, className }: BlogPreviewSectionProps) {
  const titleId = `${id}-title`;
  // El destacado siempre entra, aunque no sea de los más recientes.
  const featured = articles.find((a) => a.featured);
  const latest = articles
    .filter((a) => a !== featured)
    .slice(0, blog.homeLimit - (featured ? 1 : 0));
  const shown = featured ? [featured, ...latest] : latest;

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={cn('scroll-mt-20 section-spacing', className)}
    >
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            id={titleId}
            eyebrow={blog.eyebrow}
            title={blog.title}
            description={blog.description}
          />
          {articles.length > 0 && (
            <Link
              to="/actualidad"
              className={cn(buttonStyles({ variant: 'outline' }), 'self-start lg:self-auto')}
            >
              {blog.allLabel}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          )}
        </div>
        <div className="mt-10 lg:mt-12">
          <ArticleGrid articles={shown} blog={blog} />
        </div>
      </Container>
    </section>
  );
}
