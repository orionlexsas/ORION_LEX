import { useTranslation } from 'react-i18next';
import { siFacebook, siInstagram, siTiktok, siX, siYoutube, type SimpleIcon } from 'simple-icons';
import type { SiteContent, SocialNetwork } from '@orion-lex/shared';
import { cn } from '@/lib/cn';

/** Logo oficial de cada red (simple-icons, CC0). */
const icons: Record<SocialNetwork, SimpleIcon> = {
  tiktok: siTiktok,
  facebook: siFacebook,
  instagram: siInstagram,
  youtube: siYoutube,
  x: siX,
};

interface SocialLinksProps {
  profiles: SiteContent['social'];
  brandName: string;
  className?: string;
}

/** Íconos circulares que llevan a los perfiles del despacho en redes sociales. */
export function SocialLinks({ profiles, brandName, className }: SocialLinksProps) {
  const { t } = useTranslation();
  if (profiles.length === 0) return null;

  return (
    <nav aria-label={t('a11y.socialNav')} className={className}>
      <ul className="flex items-center gap-3">
        {profiles.map(({ network, url }) => {
          const icon = icons[network];
          const label = t('a11y.socialProfile', { brand: brandName, network: icon.title });
          return (
            <li key={network}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${label} ${t('a11y.opensNewTab')}`}
                title={label}
                className={cn(
                  'grid size-11 place-items-center rounded-full border border-border text-foreground',
                  'transition-[background-color,color,border-color,translate] duration-300 ease-out-soft',
                  'hover:-translate-y-0.5 hover:border-accent hover:bg-accent hover:text-on-accent',
                )}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-5">
                  <path d={icon.path} />
                </svg>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
