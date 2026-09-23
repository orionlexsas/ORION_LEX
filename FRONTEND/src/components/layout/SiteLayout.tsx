import { Outlet, ScrollRestoration } from 'react-router';
import { useContent } from '@/content';
import { FloatingActions } from './FloatingActions';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

/** Estructura común de la web pública: cabecera, contenido, pie y botones flotantes. */
export function SiteLayout() {
  const { site, services } = useContent();

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Al cambiar de página sube al inicio, respeta #anclas y restaura la posición al volver atrás. */}
      <ScrollRestoration />
      <SiteHeader brand={site.brand} nav={site.nav} cta={site.cta} />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter site={site} services={services.items} />
      <FloatingActions whatsapp={site.contact.whatsapp} />
    </div>
  );
}
