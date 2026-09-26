import { Suspense } from 'react';
import { useParams } from 'react-router';
import { useContent } from '@/content';
import { ArticleView } from '@/features/blog';
import { absoluteUrl, seoFor } from '@/seo/pages';
import { useSeo } from '@/seo/use-seo';
import { NotFoundPage } from './NotFoundPage';

/** Artículo de Actualidad Jurídica (/actualidad/:slug). Se carga aparte (lazy). */
export function ArticlePage() {
  const { slug = '' } = useParams();
  const content = useContent();
  const article = content.articles.find((a) => a.slug === slug);
  useSeo(seoFor.article(content, slug));

  if (!article) return <NotFoundPage />;
  const { site } = content;
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <ArticleView
        article={article}
        blog={content.blog}
        url={absoluteUrl(site.siteUrl, `/actualidad/${article.slug}`)}
        publisher={{ name: site.brand.legalName, logo: `${site.siteUrl}/brand/logo.webp` }}
      />
    </Suspense>
  );
}
