import { useState } from 'react';
import { NavLink, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Menu, X } from 'lucide-react';
import type { SiteContent } from '@orion-lex/shared';
import { CtaLink } from '@/components/cta/CtaLink';
import { Container } from '@/components/ui/Container';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { cn } from '@/lib/cn';
import { Logo } from './Logo';

interface SiteHeaderProps {
  brand: SiteContent['brand'];
  nav: SiteContent['nav'];
  cta: SiteContent['cta'];
}

/** ¿El enlace del menú corresponde a la página actual? (incluye subpáginas, p. ej. artículos) */
function isActive(href: string, pathname: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Cabecera fija con logo, menú, idioma, tema y botón principal.
 * Por debajo de xl (1280 px) el menú se despliega; en móvil, idioma y tema van dentro del menú.
 */
export function SiteHeader({ brand, nav, cta }: SiteHeaderProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const close = () => setOpen(false);

  const linkClass = (href: string) =>
    cn(
      'relative py-2 transition-colors hover:text-accent-text',
      isActive(href, pathname) &&
        'font-semibold after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:bg-accent',
    );

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
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
