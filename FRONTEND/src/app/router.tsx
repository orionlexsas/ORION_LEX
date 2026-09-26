import { createBrowserRouter, type RouteObject } from 'react-router';
import { SiteLayout, type RouteHandle } from '@/components/layout/SiteLayout';
import { getContent } from '@/content';
import { defaultLanguage } from '@/i18n';
import { AboutPage } from '@/pages/public/AboutPage';
import { BlogPage } from '@/pages/public/BlogPage';
import { ContactPage } from '@/pages/public/ContactPage';
import { HomePage } from '@/pages/public/HomePage';
import { LandingPage } from '@/pages/public/LandingPage';
import { NotFoundPage } from '@/pages/public/NotFoundPage';
import { ServicesPage } from '@/pages/public/ServicesPage';

/** Páginas que ya cierran con su propio llamado: sin la franja "Hablemos de su caso". */
const noFooterCta: RouteHandle = { footerCta: false };

/*
 * Una ruta por landing (/eliminacion-comparendos…), generada desde el contenido: los slugs son
 * iguales en todos los idiomas. Así cada tarjeta tiene su URL y no quedan rutas sin página.
 */
const landingRoutes: RouteObject[] = getContent(defaultLanguage).landings.map((landing) => ({
  path: landing.slug,
  element: <LandingPage slug={landing.slug} />,
  handle: noFooterCta,
}));

export const router = createBrowserRouter([
  {
    path: '/',
    Component: SiteLayout,
    // Mientras carga una página diferida (artículo, páginas legales) al entrar directo a ella.
    HydrateFallback: () => <div className="min-h-dvh" />,
    children: [
      { index: true, Component: HomePage, handle: noFooterCta },
      { path: 'servicios', Component: ServicesPage },
      { path: 'nosotros', Component: AboutPage },
      { path: 'actualidad', Component: BlogPage, handle: noFooterCta },
      {
        // Los artículos y las páginas legales usan Markdown: se cargan aparte.
        path: 'actualidad/:slug',
        handle: noFooterCta,
        lazy: async () => ({
          Component: (await import('@/pages/public/ArticlePage')).ArticlePage,
        }),
      },
      { path: 'contacto', Component: ContactPage, handle: noFooterCta },
      {
        path: 'privacidad',
        lazy: async () => {
          const { LegalPage } = await import('@/pages/public/LegalPage');
          return { element: <LegalPage kind="privacy" /> };
        },
      },
      {
        path: 'terminos',
        lazy: async () => {
          const { LegalPage } = await import('@/pages/public/LegalPage');
          return { element: <LegalPage kind="terms" /> };
        },
      },
      ...landingRoutes,
      { path: '*', Component: NotFoundPage },
    ],
  },
  {
    // El panel se carga aparte (lazy) para que los visitantes de la web no descarguen su código.
    path: '/admin',
    lazy: async () => ({
      Component: (await import('@/components/layout/AdminLayout')).AdminLayout,
    }),
    children: [
      {
        index: true,
        lazy: async () => ({
          Component: (await import('@/pages/admin/DashboardPage')).DashboardPage,
        }),
      },
    ],
  },
]);
