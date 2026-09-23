import type { ContentImage } from '@orion-lex/shared';
import { useTheme } from './use-theme';

/** Fuentes de la imagen para el tema activo: usa `light` en tema claro si existe. */
export function useThemedImage(image: ContentImage): Omit<ContentImage, 'light'> {
  const { theme } = useTheme();
  const source = (theme === 'light' && image.light) || image;
  return { src: source.src, srcMobile: source.srcMobile, alt: image.alt };
}
