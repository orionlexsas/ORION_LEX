import { useCallback, useEffect, useState } from 'react';

interface UseCarouselOptions {
  count: number;
  intervalMs: number;
  /** Si es false, el carrusel no avanza solo (pausa, hover, movimiento reducido…). */
  autoplay: boolean;
}

/** Estado de un carrusel circular con paso automático. */
export function useCarousel({ count, intervalMs, autoplay }: UseCarouselOptions) {
  const [active, setActive] = useState(0);

  const goTo = useCallback(
    (index: number) => setActive(((index % count) + count) % count),
    [count],
  );
  const next = useCallback(() => setActive((a) => (a + 1) % count), [count]);
  const previous = useCallback(() => setActive((a) => (a - 1 + count) % count), [count]);

  // Se usa un timeout que se rearma en cada cambio: si el usuario pasa una tarjeta a mano,
  // el conteo vuelve a empezar y no salta enseguida a la siguiente.
  useEffect(() => {
    if (!autoplay || count < 2) return;
    const id = window.setTimeout(next, intervalMs);
    return () => window.clearTimeout(id);
  }, [autoplay, count, intervalMs, next, active]);

  return { active, goTo, next, previous };
}

/** Posición circular de una tarjeta respecto a la activa: -1 izquierda, 0 centro, 1 derecha… */
export function circularOffset(index: number, active: number, count: number) {
  let offset = index - active;
  if (offset > count / 2) offset -= count;
  if (offset < -count / 2) offset += count;
  return offset;
}
