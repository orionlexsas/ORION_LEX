import { useState } from 'react';
import type { ContentIcon as ContentIconName, ContentImage } from '@orion-lex/shared';
import { useThemedImage } from '@/hooks/use-themed-image';
import { cn } from '@/lib/cn';
import { ContentIcon } from './ContentIcon';

interface MediaPanelProps {
  image?: ContentImage;
  /** Ícono del panel de reemplazo (si no hay foto o no carga). */
  icon: ContentIconName;
  /** Carga inmediata (imágenes visibles al abrir la página). */
  priority?: boolean;
  /** Panel de reemplazo negro (servicios) o claro (artículos, más liviano en listados). */
  tone?: 'dark' | 'light';
  className?: string;
}

/**
 * Foto de un servicio o artículo. Si todavía no hay foto (o falla), muestra un panel negro con
 * el ícono en naranja: se ve intencional, no roto. El contenedor define el tamaño.
 */
export function MediaPanel({ image, icon, priority, tone = 'dark', className }: MediaPanelProps) {
  return image ? (
    <ThemedMedia image={image} icon={icon} priority={priority} tone={tone} className={className} />
  ) : (
    <IconPanel icon={icon} tone={tone} className={className} />
  );
}

function ThemedMedia({
  image,
  icon,
  priority,
  tone,
  className,
}: MediaPanelProps & { image: ContentImage }) {
  const { src, srcMobile, alt } = useThemedImage(image);
  // Se guarda qué ruta falló: si cambia el tema, la otra versión puede cargar bien.
  const [failedSrc, setFailedSrc] = useState<string>();
  if (failedSrc === src) return <IconPanel icon={icon} tone={tone} className={className} />;

  return (
    <div className={cn('overflow-hidden bg-surface', className)}>
      <picture>
        {srcMobile && <source media="(max-width: 767px)" srcSet={srcMobile} />}
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : undefined}
          decoding="async"
          onError={() => setFailedSrc(src)}
          className="size-full object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.04]"
        />
      </picture>
    </div>
  );
}

function IconPanel({
  icon,
  tone = 'dark',
  className,
}: {
  icon: ContentIconName;
  tone?: 'dark' | 'light';
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'relative grid place-items-center overflow-hidden',
        tone === 'dark' ? 'bg-ink' : 'bg-foreground/[0.04]',
        className,
      )}
    >
      {/* Línea curva naranja, como la del escudo */}
      <svg viewBox="0 0 200 120" className="absolute inset-0 size-full" preserveAspectRatio="none">
        <path
          d="M-10 118C60 110 150 70 210 4"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="1.2"
          opacity="0.55"
        />
      </svg>
      <ContentIcon
        name={icon}
        className="relative size-12 text-accent transition-transform duration-500 ease-out-soft group-hover:scale-110"
        strokeWidth={1.3}
      />
    </div>
  );
}
