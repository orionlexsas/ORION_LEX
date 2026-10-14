import { useEffect, useState } from 'react';

/**
 * true mientras la persona baja por la página (después de `offset` px) y false en cuanto sube,
 * como la barra de Facebook: al bajar se esconde la fila del logo y al subir vuelve.
 */
export function useHideOnScroll(offset = 120) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      // Pequeños movimientos (menos de 6 px) no cambian nada: evita parpadeos.
      if (Math.abs(y - last) < 6) return;
      setHidden(y > offset && y > last);
      last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [offset]);

  return hidden;
}
