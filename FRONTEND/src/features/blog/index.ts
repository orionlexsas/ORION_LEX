import { lazy } from 'react';

// API pública de la feature: el resto de la app solo importa desde aquí.
export { ArticleGrid } from './components/ArticleGrid';
export { BlogPreviewSection } from './components/BlogPreviewSection';

/**
 * Vista completa del artículo: se carga aparte (usa el lector de Markdown), así no pesa en la
 * portada ni en las landings. Envolver en <Suspense>.
 */
export const ArticleView = lazy(() =>
  import('./components/ArticleView').then((m) => ({ default: m.ArticleView })),
);
