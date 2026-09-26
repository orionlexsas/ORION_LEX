import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/cn';

/*
 * Logo oficial (manual de identidad). Los archivos salen del logo suministrado, sin redibujarlo:
 * - escudo + nombre en horizontal para la cabecera,
 * - versión apilada completa para el pie,
 * - versión negativa (blanco) sobre fondos oscuros.
 */

type Tone = 'auto' | 'light' | 'dark';

/** `auto`: según el tema; `dark`: siempre la versión negativa (sobre fondo negro). */
function useNegative(tone: Tone) {
  const { theme } = useTheme();
  return tone === 'dark' || (tone === 'auto' && theme === 'dark');
}

interface LogoProps {
  name: string;
  className?: string;
  tone?: Tone;
}

/** Escudo y nombre en horizontal, enlazado al inicio (cabecera). */
export function Logo({ name, className, tone = 'auto' }: LogoProps) {
  const { t } = useTranslation();
  const suffix = useNegative(tone) ? '-blanco' : '';

  return (
    <Link
      to="/"
      aria-label={t('a11y.goHome', { name })}
      className={cn('flex shrink-0 items-center gap-2.5 sm:gap-3', className)}
    >
      <img
        src={`/brand/escudo${suffix}.webp`}
        alt=""
        width={253}
        height={192}
        className="h-11 w-auto sm:h-12"
      />
      <img
        src={`/brand/wordmark${suffix}.webp`}
        alt=""
        width={474}
        height={120}
        className="h-7 w-auto sm:h-8"
      />
    </Link>
  );
}

/** Logo completo apilado (escudo sobre el nombre). */
export function StackedLogo({ name, className, tone = 'auto' }: LogoProps) {
  const suffix = useNegative(tone) ? '-blanco' : '';
  return (
    <img
      src={`/brand/logo${suffix}.webp`}
      alt={name}
      width={480}
      height={537}
      loading="lazy"
      className={cn('h-auto', className)}
    />
  );
}
