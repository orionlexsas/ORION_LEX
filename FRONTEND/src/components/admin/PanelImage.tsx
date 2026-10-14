import { useState, type ImgHTMLAttributes, type ReactNode } from 'react';

/*
 * Imagen del sitio vista desde el panel. Una foto recién subida tarda 1–2 minutos en estar en la
 * web (Vercel republica); mientras tanto se pide a la API del panel, que la trae de GitHub.
 */

/** Cambia en cada carga del panel para no reutilizar una versión vieja guardada en caché. */
const loadedAt = Date.now();

const viaApi = (src: string) =>
  `/api/v1/admin/media/file?src=${encodeURIComponent(src.split('?')[0]!)}&v=${loadedAt}`;

interface PanelImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'onError'> {
  src: string;
  /** Lo que se muestra si la imagen no se puede cargar de ninguna forma. */
  fallback?: ReactNode;
}

export function PanelImage({ src, fallback = null, alt = '', ...props }: PanelImageProps) {
  const [attempt, setAttempt] = useState({ src, step: 0 });
  // Si cambia la imagen, se vuelve a empezar.
  const current = attempt.src === src ? attempt : { src, step: 0 };
  const canUseApi = src.startsWith('/images/');

  if (current.step === 2 || (current.step === 1 && !canUseApi)) return <>{fallback}</>;
  return (
    <img
      {...props}
      src={current.step === 0 ? src : viaApi(src)}
      alt={alt}
      onError={() => setAttempt({ src, step: current.step + 1 })}
    />
  );
}
