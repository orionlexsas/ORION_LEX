import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useContent } from '@/content';
import { ArticleGrid } from '@/features/blog';
import { seoFor } from '@/seo/pages';
import { useSeo } from '@/seo/use-seo';

/** Actualidad Jurídica: listado de artículos, con el de la semana primero. */
export function BlogPage() {
  const content = useContent();
  const { blog, articles } = content;
  useSeo(seoFor.blog(content));

  return (
    <section aria-labelledby="blog-title" className="section-spacing">
      <Container>
        <SectionHeading id="blog-title" as="h1" title={blog.title} description={blog.description} />
        <div className="mt-10 lg:mt-12">
          <ArticleGrid articles={articles} blog={blog} headingLevel="h2" />
        </div>
      </Container>
    </section>
  );
}
