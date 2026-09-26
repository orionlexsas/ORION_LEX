import { useEffect } from 'react';
import { Outlet, ScrollRestoration, useLocation, useMatches } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useContent } from '@/content';
import { trackPageView } from '@/lib/analytics';
import { FloatingActions } from './FloatingActions';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

/** Opciones que una ruta puede declarar en su `handle` (ver app/router.tsx). */
export interface RouteHandle {
  /** false = sin la franja "Hablemos de su caso" (la página ya tiene su llamado final). */
  footerCta?: boolean;
}

/** Estructura común de la web pública: cabecera, contenido, pie y botones flotantes. */
export function SiteLayout() {
  const { t } = useTranslation();
  const { site, landings } = useContent();
  const { pathname } = useLocation();
  const matches = useMatches();
  const showFooterCta = matches.every(
    (m) => (m.handle as RouteHandle | undefined)?.footerCta !== false,
  );

  // Página vista para la analítica en cada cambio de ruta (es una SPA).
  useEffect(() => trackPageView(pathname), [pathname]);

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Al cambiar de página sube al inicio, respeta #anclas y restaura la posición al volver atrás. */}
      <ScrollRestoration />
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
      >
        {t('a11y.skipToContent')}
      </a>
      <SiteHeader brand={site.brand} nav={site.nav} cta={site.cta} />
      <main id="contenido" className="flex-1">
        <Outlet />
      </main>
      <SiteFooter
        site={site}
        services={landings.map((l) => ({ title: l.title, href: `/${l.slug}` }))}
        showCta={showFooterCta}
      />
      <FloatingActions whatsapp={site.contact.whatsapp} />
    </div>
  );
}
