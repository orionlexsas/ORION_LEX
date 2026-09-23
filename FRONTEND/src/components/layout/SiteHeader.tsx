import { useState } from 'react';
import { NavLink, useLocation } from 'react-router';
import { CalendarDays, Menu, X } from 'lucide-react';
import type { SiteContent } from '@orion-lex/shared';
import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { cn } from '@/lib/cn';
import { Logo } from './Logo';

interface SiteHeaderProps {
  brand: SiteContent['brand'];
  nav: SiteContent['nav'];
  cta: SiteContent['cta'];
}

/** Cabecera fija con logo, menú y botón principal. En móvil el menú se despliega. */
export function SiteHeader({ brand, nav, cta }: SiteHeaderProps) {
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
      <Container className="flex h-20 items-center gap-4 lg:h-[5.5rem]">
        <Logo name={brand.name} tagline={brand.tagline} />

        <nav
          aria-label="Principal"
          className="ml-auto hidden items-center gap-10 text-[1.05rem] lg:flex xl:gap-16"
        >
          {nav.map((item) => (
            <NavLink key={item.href} to={item.href} className={linkClass(item.href)}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <ButtonLink to={cta.href} className="ml-auto hidden sm:inline-flex lg:ml-10 xl:ml-14">
          <CalendarDays className="size-5" aria-hidden="true" />
          {cta.label}
        </ButtonLink>

        <button
          type="button"
          className="ml-auto inline-flex size-11 items-center justify-center rounded-md border border-border sm:ml-0 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </Container>

      {open && (
        <nav id="mobile-menu" aria-label="Principal" className="border-t border-border lg:hidden">
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
            <ButtonLink to={cta.href} onClick={close} className="mt-3 sm:hidden">
              <CalendarDays className="size-5" aria-hidden="true" />
              {cta.label}
            </ButtonLink>
          </Container>
        </nav>
      )}
    </header>
  );
}
