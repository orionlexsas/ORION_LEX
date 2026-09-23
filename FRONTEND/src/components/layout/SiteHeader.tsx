import { useState } from 'react';
import { NavLink, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { CalendarDays, Menu, X } from 'lucide-react';
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

/**
 * Cabecera fija con logo, menú, idioma, tema y botón principal.
 * Por debajo de xl el menú se despliega; en móvil, idioma y tema van dentro del menú.
 */
export function SiteHeader({ brand, nav, cta }: SiteHeaderProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { pathname, hash } = useLocation();
  const close = () => setOpen(false);

  const linkClass = (href: string) => {
    // Los enlaces a secciones (/#x) no marcan "Inicio"; solo la ruta exacta.
    const active = href.includes('#') ? `${pathname}${hash}` === href : pathname === href && !hash;
    return cn(
      'relative py-2 transition-colors hover:text-gold',
      active &&
        'text-gold after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-gold',
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <Container className="flex h-20 items-center gap-3 lg:h-[5.5rem]">
        <Logo name={brand.name} tagline={brand.tagline} />

        <nav
          aria-label={t('a11y.mainNav')}
          className="ml-auto hidden items-center gap-8 text-[1.05rem] xl:flex 2xl:gap-12"
        >
          {nav.map((item) => (
            <NavLink key={item.href} to={item.href} className={linkClass(item.href)}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 sm:flex xl:ml-8">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        <CtaLink
          link={cta}
          className="hidden sm:inline-flex xl:ml-4"
          leadingIcon={<CalendarDays className="size-5" aria-hidden="true" />}
        />

        <button
          type="button"
          className="ml-auto inline-flex size-11 items-center justify-center rounded-md border border-border sm:ml-0 xl:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? t('a11y.closeMenu') : t('a11y.openMenu')}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </Container>

      {open && (
        <nav
          id="mobile-menu"
          aria-label={t('a11y.mainNav')}
          className="border-t border-border xl:hidden"
        >
          <Container className="flex flex-col py-3 text-lg">
            {nav.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={close}
                className={cn(linkClass(item.href), 'py-3')}
              >
                {item.label}
              </NavLink>
            ))}
            <div className="mt-3 flex items-center gap-2 sm:hidden">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
            <CtaLink
              link={cta}
              onClick={close}
              className="mt-4 sm:hidden"
              leadingIcon={<CalendarDays className="size-5" aria-hidden="true" />}
            />
          </Container>
        </nav>
      )}
    </header>
  );
}
