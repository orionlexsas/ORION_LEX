import { Container } from '@/components/ui/Container';
import { useContent } from '@/content';
import { ArticleGrid, BlogCta, BlogHero } from '@/features/blog';
import { seoFor } from '@/seo/pages';
import { useSeo } from '@/seo/use-seo';

/** Actualidad Jurídica: encabezado, artículo de la semana, últimos artículos y llamado final. */
export function BlogPage() {
  const content = useContent();
  const { blog, articles } = content;
  useSeo(seoFor.blog(content));

  return (
    <>
      <BlogHero blog={blog} />
      <Container className="pb-16 lg:pb-20">
        <ArticleGrid articles={articles} blog={blog} headingLevel="h2" showLatestTitle />
        <div className="mt-14">
          <BlogCta cta={blog.cta} location="blog" />
        </div>
      </Container>
    </>
  );
}
