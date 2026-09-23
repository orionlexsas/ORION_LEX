import { useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ChevronRight } from 'lucide-react';
import type { ContentIcon as ContentIconName, ContentImage } from '@orion-lex/shared';
import { ContentIcon } from '@/components/ui/ContentIcon';
import { useThemedImage } from '@/hooks/use-themed-image';
import { cn } from '@/lib/cn';

/** Círculo dorado con el ícono del servicio. */
export function ServiceIconBadge({
  icon,
  className,
}: {
  icon: ContentIconName;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'grid size-14 shrink-0 place-items-center rounded-full border-[1.5px] border-gold/90 text-gold lg:size-[4.25rem]',
        className,
      )}
    >
      <ContentIcon name={icon} className="size-7 lg:size-8" strokeWidth={1.4} />
    </span>
  );
}

/**
 * Foto del servicio a la derecha de la tarjeta, fundida con el fondo hacia la izquierda.
 * Si la imagen no existe o falla, se oculta y la tarjeta sigue viéndose bien.
 */
export function ServiceImage({ image, className }: { image?: ContentImage; className?: string }) {
  return image ? <ThemedServiceImage image={image} className={className} /> : null;
}

function ThemedServiceImage({ image, className }: { image: ContentImage; className?: string }) {
  const { src, alt } = useThemedImage(image);
  // Se guarda qué ruta falló: si cambia el tema, la otra versión puede cargar bien.
  const [failedSrc, setFailedSrc] = useState<string>();
  if (failedSrc === src) return null;

  return (
    <div
      aria-hidden={alt ? undefined : true}
      className={cn('absolute inset-y-0 right-0 -z-10', className)}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={() => setFailedSrc(src)}
        className="size-full object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.05]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/35 to-transparent" />
    </div>
  );
}

/**
 * Enlace "Ver más". Su área se extiende a toda la tarjeta, así que toda la tarjeta es clicable
 * y solo hay un enlace por servicio para lectores de pantalla.
 */
export function ServiceMoreLink({
  href,
  label,
  serviceTitle,
  className,
}: {
  href: string;
  label: string;
  serviceTitle: string;
  className?: string;
}) {
  const { t } = useTranslation();
  return (
    <Link
      to={href}
      className={cn(
        'inline-flex items-center gap-4 text-[0.95rem] text-foreground/90 after:absolute after:inset-0 after:content-[""]',
        className,
      )}
    >
      <span className="grid size-9 place-items-center rounded-full border-[1.5px] border-gold/90 text-gold transition-colors duration-300 group-hover:bg-gold group-hover:text-on-gold">
        <ChevronRight className="size-4" aria-hidden="true" />
      </span>
      {label}
      <span className="sr-only"> {t('a11y.moreAbout', { title: serviceTitle })}</span>
      <ArrowRight
        className="size-4 text-gold transition-transform duration-300 ease-out-soft group-hover:translate-x-1"
        aria-hidden="true"
      />
    </Link>
  );
}
