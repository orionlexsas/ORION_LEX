import { createBrowserRouter } from 'react-router';
import { SiteLayout } from '@/components/layout/SiteLayout';
import { HomePage } from '@/pages/public/HomePage';
import { ContactPage } from '@/pages/public/ContactPage';
import { NotFoundPage } from '@/pages/public/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: SiteLayout,
    children: [
      { index: true, Component: HomePage },
      { path: 'contacto', Component: ContactPage },
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
