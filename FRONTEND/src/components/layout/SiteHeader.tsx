import { useState } from 'react';
import { NavLink, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { House, Mail, Menu, Newspaper, Scale, Users, X, type LucideIcon } from 'lucide-react';
import type { SiteContent } from '@orion-lex/shared';
import { CtaLink } from '@/components/cta/CtaLink';
import { AdminLoginButton } from '@/components/ui/AdminLoginButton';
import { Container } from '@/components/ui/Container';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useHideOnScroll } from '@/hooks/use-hide-on-scroll';
import { cn } from '@/lib/cn';
import { Logo } from './Logo';

interface SiteHeaderProps {
  brand: SiteContent['brand'];
  nav: SiteContent['nav'];
  cta: SiteContent['cta'];
}

/** Ícono y nombre corto de cada sección en la barra de íconos del celular (estilo Facebook). */
const TABS: Record<
  string,
  { icon: LucideIcon; label: 'home' | 'services' | 'about' | 'blog' | 'contact' }
> = {
  '/': { icon: House, label: 'home' },
  '/servicios': { icon: Scale, label: 'services' },
  '/nosotros': { icon: Users, label: 'about' },
  '/actualidad': { icon: Newspaper, label: 'blog' },
  '/contacto': { icon: Mail, label: 'contact' },
};

/** ¿El enlace del menú corresponde a la página actual? (incluye subpáginas, p. ej. artículos) */
function isActive(href: string, pathname: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Cabecera fija con logo, menú, idioma, tema y botón principal.
 * Por debajo de xl (1280 px) el menú se despliega; en móvil, idioma y tema van dentro del menú.
 * También por debajo de xl hay una barra fija de íconos (Inicio, Servicios, Equipo, Noticias,
 * Contacto) como la de Facebook: al bajar se esconde la fila del logo y queda solo la barra.
 */
export function SiteHeader({ brand, nav, cta }: SiteHeaderProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const close = () => setOpen(false);
  const hideTop = useHideOnScroll();

  const linkClass = (href: string) =>
    cn(
      'relative py-2 transition-colors hover:text-accent-text',
      isActive(href, pathname) &&
        'font-semibold after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:bg-accent',
    );

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur transition-transform duration-300 ease-out-soft',
        // Al bajar se esconde la fila del logo (4,5 rem) y queda visible la barra de íconos.
        hideTop && !open && 'max-xl:-translate-y-[4.5rem]',
      )}
    >
      <Container className="flex h-[4.5rem] items-center gap-3">
        <Logo name={brand.name} />

        <nav
          aria-label={t('a11y.mainNav')}
          className="ml-auto hidden items-center gap-8 text-[0.95rem] xl:flex"
        >
          {nav.map((item) => (
            <NavLink key={item.href} to={item.href} className={linkClass(item.href)}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex xl:ml-6">
          <LanguageSwitcher />
          <ThemeToggle />
          <AdminLoginButton />
        </div>

        <CtaLink link={cta} location="header" className="hidden md:inline-flex xl:ml-2" />

        <button
          type="button"
          className="ml-auto inline-flex size-11 items-center justify-center rounded-md border border-border md:ml-0 xl:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? t('a11y.closeMenu') : t('a11y.openMenu')}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <X className="size-5" aria-hidden="true" />
          ) : (
            <Menu className="size-5" aria-hidden="true" />
          )}
        </button>
      </Container>

      <nav aria-label={t('tabs.label')} className="border-t border-border xl:hidden">
        <ul className="mx-auto flex max-w-2xl">
          {nav.map((item) => {
            const tab = TABS[item.href];
            const Icon = tab?.icon ?? House;
            const active = isActive(item.href, pathname);
            return (
              <li key={item.href} className="flex-1">
                <NavLink
                  to={item.href}
                  onClick={close}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative flex h-14 flex-col items-center justify-center gap-0.5 text-[0.68rem] font-medium transition-colors',
                    active ? 'text-accent-text' : 'text-foreground/70 hover:text-foreground',
                  )}
                >
                  <Icon
                    aria-hidden="true"
                    className="size-[1.35rem]"
                    strokeWidth={active ? 2.2 : 1.7}
                  />
                  {tab ? t(`tabs.${tab.label}`) : item.label}
                  {/* Línea naranja bajo la sección actual, como la azul de Facebook */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute inset-x-3 bottom-0 h-[3px] rounded-t-full bg-accent transition-opacity',
                      active ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {open && (
        <nav
          id="mobile-menu"
          aria-label={t('a11y.mainNav')}
          className="max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-border xl:hidden"
        >
          <Container className="flex flex-col py-3 text-lg">
            {nav.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={close}
                className={cn(linkClass(item.href), 'py-3 after:hidden')}
              >
                {item.label}
              </NavLink>
            ))}
            <div className="mt-3 flex items-center gap-2 md:hidden">
              <LanguageSwitcher />
              <ThemeToggle />
              <AdminLoginButton />
            </div>
            <CtaLink
              link={cta}
              location="mobile_menu"
              onClick={close}
              className="mt-4 mb-2 md:hidden"
            />
          </Container>
        </nav>
      )}
    </header>
  );
}
