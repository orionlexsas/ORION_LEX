import { useEffect } from 'react';
import { useLocation } from 'react-router';

/** Al navegar a una URL con #ancla (p. ej. /#servicios), desplaza hasta esa sección. */
export function useScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
  }, [pathname, hash]);
}
