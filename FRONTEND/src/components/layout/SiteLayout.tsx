import { Outlet } from 'react-router';
import { siteContent } from '@/content';
import { Container } from '@/components/ui/Container';
import { useScrollToHash } from '@/hooks/use-scroll-to-hash';
import { SiteHeader } from './SiteHeader';
import { TopBar } from './TopBar';

/** Estructura común de la web pública: barra superior, cabecera, contenido y pie. */
export function SiteLayout() {
  const { brand, topBar, nav, cta } = siteContent;
  useScrollToHash();

  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar topBar={topBar} />
      <SiteHeader brand={brand} nav={nav} cta={cta} />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border py-8 text-sm text-muted">
        <Container className="text-center">
          © {new Date().getFullYear()} {brand.name} · {brand.tagline}
        </Container>
      </footer>
    </div>
  );
}
