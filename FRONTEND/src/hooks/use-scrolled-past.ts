import { useSyncExternalStore } from 'react';

function subscribe(onChange: () => void) {
  window.addEventListener('scroll', onChange, { passive: true });
  window.addEventListener('resize', onChange);
  return () => {
    window.removeEventListener('scroll', onChange);
    window.removeEventListener('resize', onChange);
  };
}

/** true cuando se bajó más de `screens` alturas de pantalla (p. ej. 1 = una pantalla completa). */
export function useScrolledPast(screens: number) {
  return useSyncExternalStore(
    subscribe,
    () => window.scrollY > window.innerHeight * screens,
    () => false,
  );
}
