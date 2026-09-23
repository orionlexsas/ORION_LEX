import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Mail, MapPin, Phone } from 'lucide-react';
import type { SiteContent, ServiceItem } from '@orion-lex/shared';
import { Container } from '@/components/ui/Container';
import { SocialLinks } from '@/components/ui/SocialLinks';
import { cn } from '@/lib/cn';
import { FooterCta } from './FooterCta';
import { ShieldMark } from './Logo';

interface SiteFooterProps {
  site: SiteContent;
  services: ServiceItem[];
}

const fadeToCorner = {
  maskImage: 'linear-gradient(to top right, #000 45%, transparent 85%)',
};
const fadeToLeft = {
  maskImage:
    'linear-gradient(to left, #000 40%, transparent), linear-gradient(to bottom, transparent, #000 25%, #000 75%, transparent)',
  maskComposite: 'intersect',
};

/** Pie de página: marca, enlaces, servicios, contacto y datos legales. */
export function SiteFooter({ site, services }: SiteFooterProps) {
  const { t } = useTranslation();
  const { brand, footer, nav, contact } = site;

  return (
    <footer className="relative isolate overflow-hidden bg-background">
      <FooterCta cta={footer.cta} brand={brand} />

      <img
        src={footer.decorations.left.src}
        alt={footer.decorations.left.alt}
        loading="lazy"
        className="absolute bottom-0 left-0 -z-10 hidden w-56 xl:block light:opacity-60"
        style={fadeToCorner}
      />
      <img
        src={footer.decorations.right.src}
        alt={footer.decorations.right.alt}
        loading="lazy"
        className="absolute right-0 bottom-24 -z-10 hidden w-40 xl:block light:opacity-40"
        style={fadeToLeft}
      />

      <Container className="grid grid-cols-2 gap-x-6 gap-y-12 pt-14 lg:grid-cols-[1.15fr_1fr_1.1fr_1.2fr] lg:gap-0 lg:pt-14">
        <div className="flex flex-col items-center text-center col-span-2 lg:col-span-1 lg:pr-10">
          <Link
            to="/"
            aria-label={t('a11y.goHome', { name: brand.name })}
            className="flex flex-col items-center"
          >
            <ShieldMark className="h-24 w-auto" />
            <span className="mt-3 bg-gold-text-gradient bg-clip-text font-display text-[2.6rem] leading-none font-semibold text-transparent uppercase">
              {brand.name}
            </span>
            <span className="mt-1.5 font-display text-xs tracking-[0.35em] text-gold uppercase">
              {brand.tagline}
            </span>
          </Link>
          <span aria-hidden="true" className="mt-5 h-0.5 w-10 bg-gold" />
          <p className="mt-5 max-w-[14rem] text-lg leading-snug text-foreground/90">
            {footer.tagline}
          </p>
          <SocialLinks profiles={site.social} brandName={brand.name} className="mt-6" />
        </div>

        <FooterColumn title={footer.headings.explore}>
          <FooterLinks links={nav} />
        </FooterColumn>

        <FooterColumn title={footer.headings.services}>
          <FooterLinks
            links={services
              .slice(0, footer.servicesLimit)
              .map((s) => ({ label: s.title, href: s.href }))}
          />
        </FooterColumn>

        <FooterColumn title={footer.headings.contact} className="col-span-2 lg:col-span-1">
          <p className="flex items-start gap-4">
            <MapPin
              className="mt-0.5 size-8 shrink-0 fill-gold text-background"
              aria-hidden="true"
            />
            <span>
              <span className="block font-serif text-lg font-bold">{contact.city}</span>
              <span className="mt-1 block text-foreground/80">{contact.modality}</span>
            </span>
          </p>
          <a
            href={`tel:+${contact.whatsapp.number}`}
            className="mt-5 flex items-center gap-4 text-lg transition-colors hover:text-gold"
          >
            <Phone className="size-7 shrink-0 fill-gold text-background" aria-hidden="true" />
            {contact.phone}
          </a>
          <a
            href={`mailto:${contact.email}`}
            className="mt-9 inline-flex min-h-14 items-center gap-4 rounded-lg border-[1.5px] border-gold px-8 text-lg font-semibold text-gold transition-colors duration-300 hover:bg-gold hover:text-on-gold"
          >
            <Mail className="size-6" aria-hidden="true" />
            {footer.writeUsLabel}
            <ArrowRight className="size-5" aria-hidden="true" />
          </a>
        </FooterColumn>
      </Container>

      <Container>
        <div className="mt-14 flex flex-col gap-4 border-t border-border py-8 text-foreground/85 sm:flex-row sm:items-center sm:justify-between xl:ml-40">
          <p>
            © {new Date().getFullYear()} {brand.name}. {footer.rightsText}
          </p>
          <nav aria-label={t('a11y.legalNav')} className="flex items-center gap-4">
            {footer.legalLinks.map((link, i) => (
              <span key={link.href} className="flex items-center gap-4">
                {i > 0 && <span aria-hidden="true">·</span>}
                <Link to={link.href} className="transition-colors hover:text-gold">
                  {link.label}
                </Link>
              </span>
            ))}
            <span aria-hidden="true" className="ml-8 hidden h-0.5 w-20 bg-gold sm:block" />
          </nav>
        </div>
      </Container>
    </footer>
  );
}

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
    <div className={cn('lg:border-l lg:border-border lg:px-10 xl:px-16', className)}>
      <h2 className="font-serif text-[2rem] leading-none font-bold text-gold">{title}</h2>
      <span aria-hidden="true" className="mt-5 block h-0.5 w-10 bg-gold" />
      <div className="mt-9">{children}</div>
    </div>
  );
}

function FooterLinks({ links }: { links: { label: string; href: string }[] }) {
  return (
    <ul className="space-y-4 text-lg">
      {links.map((link) => (
        <li key={link.label}>
          <Link to={link.href} className="text-foreground/90 transition-colors hover:text-gold">
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
