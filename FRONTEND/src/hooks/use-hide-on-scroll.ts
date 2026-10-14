import { useEffect, useState } from 'react';

/**
 * true en cuanto la persona baja más de `offset` px y false solo al volver al inicio de la página
 * (subir un poco no lo cambia): la fila del logo solo se ve arriba del todo.
 */
export function useHideOnScroll(offset = 80) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onScroll = () => setHidden(window.scrollY > offset);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [offset]);

  return hidden;
}
