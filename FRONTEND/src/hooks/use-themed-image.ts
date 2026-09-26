import type { ContentImage } from '@orion-lex/shared';
import { useTheme } from './use-theme';

/** Fuentes de la imagen para el tema activo: usa `dark` en tema oscuro si existe. */
export function useThemedImage(image: ContentImage): Omit<ContentImage, 'dark'> {
  const { theme } = useTheme();
  const source = (theme === 'dark' && image.dark) || image;
  return { src: source.src, srcMobile: source.srcMobile, alt: image.alt };
}
