import { useEffect, useState } from 'react';

/** Lo que hay que mover la página (px) para que cuente como "bajar" o "subir" (evita temblores). */
const DIRECTION_THRESHOLD = 6;

/**
 * Estado de la cabecera según el scroll:
 * - `pastTop`: la persona ya bajó más de `offset` px (en celular se esconde la fila del logo).
 * - `hidden`: está bajando: la cabecera se esconde entera para dejar más espacio; al subir un
 *   poco (o al volver arriba) reaparece.
 */
export function useHideOnScroll(offset = 80) {
  const [state, setState] = useState({ pastTop: false, hidden: false });

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      if (Math.abs(delta) < DIRECTION_THRESHOLD && y > offset) return;
      lastY = y;
      const pastTop = y > offset;
      const hidden = pastTop && delta > 0;
      setState((prev) =>
        prev.pastTop === pastTop && prev.hidden === hidden ? prev : { pastTop, hidden },
      );
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [offset]);

  return state;
}
