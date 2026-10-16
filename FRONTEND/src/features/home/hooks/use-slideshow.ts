import { useEffect, useState } from 'react';

/** Tiempo que se ve cada foto de fondo de la portada (ms). */
export const SLIDE_MS = 6000;

/**
 * Índice de la foto de fondo que se ve (0 = la principal); pasa sola a la siguiente cada
 * `SLIDE_MS` y vuelve a empezar. Quieta con "reducir movimiento" o si solo hay una foto.
 */
export function useSlideshow(count: number) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (count < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {
      // Con la pestaña en segundo plano no avanza (al volver sigue donde iba).
      if (!document.hidden) setActive((i) => (i + 1) % count);
    }, SLIDE_MS);
    return () => window.clearInterval(timer);
  }, [count]);

  return active;
}
