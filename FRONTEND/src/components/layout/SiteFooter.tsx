import { useRef, type MouseEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Globe, Mail, Phone } from 'lucide-react';
import type { SiteContent } from '@orion-lex/shared';
import { Container } from '@/components/ui/Container';
import { SocialLinks } from '@/components/ui/SocialLinks';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/cn';
import { whatsappUrl } from '@/lib/whatsapp';
import { FooterCta } from './FooterCta';
import { StackedLogo } from './Logo';

interface SiteFooterProps {
  site: SiteContent;
  /** Servicios frecuentes (landings) que se listan en el pie. */
  services: { title: string; href: string }[];
  /** Franja "Hablemos de su caso" encima del pie (se oculta donde ya hay un llamado final). */
  showCta: boolean;
}

/**
 * Pie de página sobre negro de marca: logo, navegación, servicios, contacto y enlaces legales.
 * En celular es compacto: logo en fila con las redes, sin "Navegación" (ya está la barra de íconos
 * de arriba), servicios como etiquetas y teléfono y correo como dos botones.
 */
export function SiteFooter({ site, services, showCta }: SiteFooterProps) {
  const { t } = useTranslation();
  const { brand, footer, nav, contact } = site;
  const secretTaps = useSecretTaps();

  return (
    <footer className="on-dark bg-ink">
      {showCta && <FooterCta cta={footer.cta} />}

      <Container className="grid gap-x-10 gap-y-8 pt-9 pb-8 sm:grid-cols-2 sm:gap-y-10 sm:pt-12 sm:pb-10 lg:grid-cols-[1.1fr_0.8fr_1.1fr_1.3fr] lg:pt-12">
        <div className="flex flex-wrap items-center justify-between gap-4 sm:flex-col sm:items-start sm:justify-start">
          <Link
            to="/"
            onClick={secretTaps}
            aria-label={t('a11y.goHome', { name: brand.name })}
            className="select-none [-webkit-tap-highlight-color:transparent]"
          >
            {/* Celular: escudo y nombre en una fila; desde 640 px, el logo apilado. */}
            <span className="flex items-center gap-2.5 sm:hidden">
              <img
                src="/brand/escudo-blanco.webp"
                alt=""
                width={253}
                height={192}
                className="h-10 w-auto"
              />
              <img
                src="/brand/wordmark-blanco.webp"
                alt=""
                width={474}
                height={120}
                className="h-7 w-auto"
              />
            </span>
            <StackedLogo name={brand.legalName} tone="dark" className="w-28 max-sm:hidden" />
          </Link>
          <p className="mt-5 max-w-[16rem] font-serif text-lg leading-snug max-sm:hidden">
            {footer.tagline}
          </p>
          <SocialLinks profiles={site.social} brandName={brand.name} className="sm:mt-5" />
        </div>

        <FooterColumn title={footer.headings.explore} className="max-sm:hidden">
          <FooterLinks links={nav} />
        </FooterColumn>

        <FooterColumn title={footer.headings.services}>
          <FooterLinks
            links={services.map((s) => ({ label: s.title, href: s.href }))}
            chipsOnMobile
          />
        </FooterColumn>

        <FooterColumn title={footer.headings.contact}>
          <ul className="space-y-4 max-sm:flex max-sm:flex-wrap max-sm:gap-2.5 max-sm:space-y-0 max-sm:[&>li]:flex-auto">
            <li>
              <a
                href={whatsappUrl(contact.whatsapp.number, contact.whatsapp.message)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('whatsapp_click', { location: 'footer_phone' })}
                className={cn(
                  'flex items-center gap-3 transition-colors hover:text-accent-text',
                  CONTACT_BUTTON,
                )}
              >
                <Phone className="size-5 shrink-0 text-accent" aria-hidden="true" />
                {contact.phone}
                <span className="sr-only"> {t('a11y.opensWhatsApp')}</span>
              </a>
            </li>
            <li>
              <a
                href={`mailto:${contact.email}`}
                className={cn(
                  'flex items-center gap-3 break-all transition-colors max-sm:break-normal hover:text-accent-text',
                  CONTACT_BUTTON,
                )}
              >
                <Mail className="size-5 shrink-0 text-accent" aria-hidden="true" />
                {contact.email}
              </a>
            </li>
            <li className="flex items-start gap-3 text-muted max-sm:hidden">
              <Globe className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
              <span className="text-sm leading-relaxed">{contact.coverage}</span>
            </li>
          </ul>
        </FooterColumn>
      </Container>

      <Container>
        <div className="flex flex-col gap-3 border-t border-border pt-5 pb-24 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:pt-6 sm:pb-6 sm:text-sm lg:pr-24">
          <p>
            © {new Date().getFullYear()} {brand.legalName}. {footer.rightsText}
          </p>
          <nav aria-label={t('a11y.legalNav')}>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {footer.legalLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Container>
    </footer>
  );
}

/** Teléfono y correo en celular: dos botones con borde, uno al lado del otro. */
const CONTACT_BUTTON =
  'max-sm:min-h-11 max-sm:justify-center max-sm:whitespace-nowrap max-sm:gap-2 max-sm:rounded-lg max-sm:border max-sm:border-border max-sm:px-3 max-sm:text-[0.8rem]';

function FooterColumn({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <h2 className="text-xs font-semibold tracking-[0.22em] text-accent-text uppercase">
        {title}
      </h2>
      <div className="mt-4 sm:mt-5">{children}</div>
    </div>
  );
}

function FooterLinks({
  links,
  chipsOnMobile,
}: {
  links: { label: string; href: string }[];
  /** En celular, los enlaces van como etiquetas juntas en vez de uno por línea. */
  chipsOnMobile?: boolean;
}) {
  return (
    <ul
      className={cn(
        'space-y-3',
        chipsOnMobile && 'max-sm:flex max-sm:flex-wrap max-sm:gap-2 max-sm:space-y-0',
      )}
    >
      {links.map((link) => (
        <li key={link.href}>
          <Link
            to={link.href}
            className={cn(
              'text-foreground/85 transition-colors hover:text-accent-text',
              chipsOnMobile &&
                'max-sm:inline-flex max-sm:min-h-9 max-sm:items-center max-sm:rounded-full max-sm:border max-sm:border-border max-sm:px-3 max-sm:text-[0.8rem]',
            )}
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Toques seguidos sobre el logo del pie que abren el acceso al panel. */
const SECRET_TAPS = 3;
/** Tiempo máximo entre un toque y el siguiente (ms). */
const TAP_WINDOW = 600;

/**
 * Acceso escondido al panel: no hay botón visible; tocar el logo del pie 3 veces seguidas lleva a
 * /admin/login. Un solo toque sigue llevando al inicio, pero espera un instante por si llegan más.
 */
function useSecretTaps() {
  const navigate = useNavigate();
  const taps = useRef(0);
  const timer = useRef<number | undefined>(undefined);

  return (event: MouseEvent<HTMLAnchorElement>) => {
    // Ctrl/Cmd + clic (abrir en otra pestaña) funciona como un enlace normal.
    if (event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    window.clearTimeout(timer.current);
    taps.current += 1;
    if (taps.current >= SECRET_TAPS) {
      taps.current = 0;
      void navigate('/admin/login');
      return;
    }
    timer.current = window.setTimeout(() => {
      taps.current = 0;
      void navigate('/');
    }, TAP_WINDOW);
  };
}
