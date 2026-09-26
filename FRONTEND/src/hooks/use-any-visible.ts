import { useEffect, useState } from 'react';

/**
 * true mientras algún elemento que cumpla `selector` esté visible en pantalla. Sigue los
 * elementos que aparecen o desaparecen al cambiar de página (incluidas partes que cargan tarde).
 */
export function useAnyVisible(selector: string) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observed = new Set<Element>();
    const onScreen = new Set<Element>();
    const intersection = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) onScreen.add(entry.target);
        else onScreen.delete(entry.target);
      }
      setVisible(onScreen.size > 0);
    });

    // Solo observa los nuevos y suelta los que ya no están; no hace nada si no cambió la lista.
    const sync = () => {
      const current = new Set(document.querySelectorAll(selector));
      for (const el of observed) {
        if (!current.has(el)) {
          intersection.unobserve(el);
          observed.delete(el);
          onScreen.delete(el);
        }
      }
      for (const el of current) {
        if (!observed.has(el)) {
          intersection.observe(el);
          observed.add(el);
        }
      }
      setVisible(onScreen.size > 0);
    };
    sync();

    const mutation = new MutationObserver(sync);
    mutation.observe(document.body, { childList: true, subtree: true });
    return () => {
      mutation.disconnect();
      intersection.disconnect();
    };
  }, [selector]);

  return visible;
}
