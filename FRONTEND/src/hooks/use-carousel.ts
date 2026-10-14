import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

/*
 * Carrusel solo para celular (< 640 px): las listas de tarjetas que en computador son una
 * cuadrícula, en el celular se deslizan de lado en vez de apilarse.
 * - Se ve un pedazo de la tarjeta siguiente (así se nota que hay más).
 * - Avanza solo cada pocos segundos mientras está en pantalla; en cuanto la persona lo toca,
 *   se detiene para siempre y lo maneja ella. Con "reducir movimiento" no avanza solo.
 * - Debajo: puntos (en cuál va) y el aviso "Desliza para ver más" hasta que la persona desliza.
 *
 * Uso: const { ref, nav } = useCarousel(); <ul ref={ref} className={cn(grid, carouselTrack)}>
 * con cada <li className={carouselItem}> y debajo <CarouselNav {...nav} />.
 */

/** Clases de la lista: fila deslizable en celular, sin cambiar la cuadrícula desde 640 px. */
export const carouselTrack =
  'max-sm:relative max-sm:-mx-5 max-sm:flex max-sm:snap-x max-sm:snap-mandatory max-sm:overflow-x-auto max-sm:scroll-px-5 max-sm:px-5 max-sm:pb-3 max-sm:[scrollbar-width:none] max-sm:[&::-webkit-scrollbar]:hidden';

/** Clases de cada tarjeta en el carrusel (84 % del ancho: asoma la siguiente). */
export const carouselItem = 'max-sm:w-[84%] max-sm:shrink-0 max-sm:snap-start';

const AUTOPLAY_MS = 4500;
const MOBILE = '(max-width: 639px)';
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

/** Lo que necesitan los puntos y el aviso bajo el carrusel. */
export interface CarouselNavState {
  active: number;
  count: number;
  /** true cuando la persona ya tocó o deslizó el carrusel. */
  touched: boolean;
  goTo: (index: number) => void;
}

export interface CarouselState<T extends HTMLElement> {
  ref: RefObject<T | null>;
  nav: CarouselNavState;
}

export function useCarousel<T extends HTMLElement = HTMLUListElement>(): CarouselState<T> {
  const ref = useRef<T | null>(null);
  const [active, setActive] = useState(0);
  const [count, setCount] = useState(0);
  const [touched, setTouched] = useState(false);
  const touchedRef = useRef(false);

  const goTo = useCallback((index: number) => {
    const track = ref.current;
    const item = track?.children[index] as HTMLElement | undefined;
    if (!track || !item) return;
    // La lista es relative: offsetLeft es la posición dentro de ella; 20 px = margen del texto.
    track.scrollTo({ left: item.offsetLeft - 20, behavior: 'smooth' });
  }, []);

  // Tarjeta visible según el desplazamiento.
  useEffect(() => {
    const track = ref.current;
    if (!track) return;
    setCount(track.children.length);
    const onScroll = () => {
      const first = track.children[0] as HTMLElement | undefined;
      const second = track.children[1] as HTMLElement | undefined;
      if (!first) return;
      const step = second ? second.offsetLeft - first.offsetLeft : first.offsetWidth;
      setActive(Math.min(track.children.length - 1, Math.round(track.scrollLeft / step)));
    };
    const markTouched = () => {
      touchedRef.current = true;
      setTouched(true);
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    track.addEventListener('pointerdown', markTouched, { passive: true });
    track.addEventListener('touchstart', markTouched, { passive: true });
    track.addEventListener('wheel', markTouched, { passive: true });
    return () => {
      track.removeEventListener('scroll', onScroll);
      track.removeEventListener('pointerdown', markTouched);
      track.removeEventListener('touchstart', markTouched);
      track.removeEventListener('wheel', markTouched);
    };
  }, []);

  // Avance automático: solo en celular, visible en pantalla y mientras nadie lo haya tocado.
  useEffect(() => {
    const track = ref.current;
    if (!track || !window.matchMedia(MOBILE).matches || window.matchMedia(REDUCED_MOTION).matches) {
      return;
    }
    let timer: number | undefined;
    let index = 0;
    const stop = () => window.clearInterval(timer);
    const start = () => {
      stop();
      timer = window.setInterval(() => {
        if (touchedRef.current) return stop();
        index = (index + 1) % track.children.length;
        goTo(index);
      }, AUTOPLAY_MS);
    };
    const observer = new IntersectionObserver(
      ([entry]) => (entry?.isIntersecting && !touchedRef.current ? start() : stop()),
      { threshold: 0.6 },
    );
    observer.observe(track);
    return () => {
      stop();
      observer.disconnect();
    };
  }, [goTo]);

  return { ref, nav: { active, count, touched, goTo } };
}
