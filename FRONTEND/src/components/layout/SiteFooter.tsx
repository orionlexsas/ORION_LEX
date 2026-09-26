import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Globe, Mail, Phone } from 'lucide-react';
import type { SiteContent } from '@orion-lex/shared';
import { Container } from '@/components/ui/Container';
import { SocialLinks } from '@/components/ui/SocialLinks';
import { track } from '@/lib/analytics';
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

/** Pie de página sobre negro de marca: logo, navegación, servicios, contacto y enlaces legales. */
export function SiteFooter({ site, services, showCta }: SiteFooterProps) {
  const { t } = useTranslation();
  const { brand, footer, nav, contact } = site;

  return (
    <footer className="on-dark bg-ink">
      {showCta && <FooterCta cta={footer.cta} />}

      <Container className="grid gap-x-10 gap-y-12 pt-14 pb-12 sm:grid-cols-2 lg:grid-cols-[1.1fr_0.8fr_1.1fr_1.3fr] lg:pt-16">
        <div className="flex flex-col items-start">
          <Link to="/" aria-label={t('a11y.goHome', { name: brand.name })}>
            <StackedLogo name={brand.legalName} tone="dark" className="w-36" />
          </Link>
          <p className="mt-6 max-w-[16rem] font-serif text-lg leading-snug">{footer.tagline}</p>
          <SocialLinks profiles={site.social} brandName={brand.name} className="mt-6" />
        </div>

        <FooterColumn title={footer.headings.explore}>
          <FooterLinks links={nav} />
        </FooterColumn>

        <FooterColumn title={footer.headings.services}>
          <FooterLinks links={services.map((s) => ({ label: s.title, href: s.href }))} />
        </FooterColumn>

        <FooterColumn title={footer.headings.contact}>
          <ul className="space-y-4">
            <li>
              <a
                href={whatsappUrl(contact.whatsapp.number, contact.whatsapp.message)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('whatsapp_click', { location: 'footer_phone' })}
                className="flex items-center gap-3 transition-colors hover:text-accent-text"
              >
                <Phone className="size-5 shrink-0 text-accent" aria-hidden="true" />
                {contact.phone}
                <span className="sr-only"> {t('a11y.opensWhatsApp')}</span>
              </a>
            </li>
            <li>
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-3 break-all transition-colors hover:text-accent-text"
              >
                <Mail className="size-5 shrink-0 text-accent" aria-hidden="true" />
                {contact.email}
              </a>
            </li>
            <li className="flex items-start gap-3 text-muted">
              <Globe className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
              <span className="text-sm leading-relaxed">{contact.coverage}</span>
            </li>
          </ul>
        </FooterColumn>
      </Container>

      <Container>
        <div className="flex flex-col gap-4 border-t border-border pt-7 pb-24 text-sm text-muted sm:flex-row sm:pb-7 lg:pr-24 sm:items-center sm:justify-between">
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

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="text-xs font-semibold tracking-[0.22em] text-accent-text uppercase">
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function FooterLinks({ links }: { links: { label: string; href: string }[] }) {
  return (
    <ul className="space-y-3">
      {links.map((link) => (
        <li key={link.href}>
          <Link
            to={link.href}
            className="text-foreground/85 transition-colors hover:text-accent-text"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
