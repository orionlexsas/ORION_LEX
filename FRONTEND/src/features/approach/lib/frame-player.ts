/*
 * Reproductor de una secuencia de fotogramas en un canvas, controlada por el scroll (misma
 * mecánica que el proyecto del restaurante, sin GSAP):
 * - El progreso (0→1) elige el fotograma; el que se muestra lo *persigue* con suavidad, así un
 *   golpe de rueda no da un tirón.
 * - Los fotogramas se descargan por grupos; nunca se dibuja un hueco: si el exacto aún no está,
 *   se dibuja el más cercano ya cargado.
 * - Se dibuja "a lo object-fit: cover".
 */

/** Cuánto se acerca el fotograma mostrado al pedido en cada cuadro (0→1). */
const SMOOTHING = 0.14;
/** Fotogramas que se cargan primero (lo que se ve al llegar). */
const FIRST = 8;
/** Tamaño de cada grupo de descarga posterior. */
const GROUP = 12;

export interface FramePlayer {
  /** Progreso pedido por el scroll (0→1). */
  setProgress: (progress: number) => void;
  dispose: () => void;
}

const loadImage = (src: string) =>
  new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

export function createFramePlayer(
  canvas: HTMLCanvasElement,
  frameUrl: (index: number) => string,
  total: number,
): FramePlayer {
  const ctx = canvas.getContext('2d', { alpha: false });
  const images: (HTMLImageElement | null)[] = new Array(total).fill(null);
  let cancelled = false;
  let target = 0;
  let shown = 0;
  let drawn = -1;
  let raf = 0;
  let running = false;

  const nearestLoaded = (wanted: number) => {
    if (images[wanted]) return wanted;
    for (let d = 1; d < total; d += 1) {
      if (wanted - d >= 0 && images[wanted - d]) return wanted - d;
      if (wanted + d < total && images[wanted + d]) return wanted + d;
    }
    return -1;
  };

  const paint = (index: number) => {
    const img = images[index];
    if (!img || !ctx) return;
    const { width: cw, height: ch } = canvas;
    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    drawn = index;
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(canvas.clientWidth * dpr);
    const h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width === w && canvas.height === h) return;
    canvas.width = w;
    canvas.height = h;
    if (drawn >= 0) paint(drawn);
  };

  const step = () => {
    const diff = target - shown;
    if (Math.abs(diff) < 0.0004) {
      shown = target;
      running = false;
    } else {
      shown += diff * SMOOTHING;
    }
    const index = nearestLoaded(Math.min(total - 1, Math.round(shown * (total - 1))));
    if (index >= 0 && index !== drawn) paint(index);
    if (running) raf = requestAnimationFrame(step);
  };

  const wake = () => {
    if (running) return;
    running = true;
    raf = requestAnimationFrame(step);
  };

  const loadRange = async (from: number, to: number) => {
    await Promise.all(
      Array.from({ length: Math.max(0, Math.min(to, total) - from) }, async (_, k) => {
        const i = from + k;
        if (images[i]) return;
        const img = await loadImage(frameUrl(i));
        if (!cancelled) images[i] = img;
      }),
    );
  };

  void (async () => {
    await loadRange(0, FIRST);
    if (cancelled) return;
    wake();
    // El resto por grupos, uno tras otro: no satura la red ni bloquea la página.
    for (let from = FIRST; from < total && !cancelled; from += GROUP) {
      await loadRange(from, from + GROUP);
      if (!cancelled) wake(); // afina la imagen si el exacto acaba de llegar
    }
  })();

  resize();
  const observer = new ResizeObserver(() => {
    resize();
    wake();
  });
  observer.observe(canvas);

  return {
    setProgress: (progress) => {
      target = Math.min(1, Math.max(0, progress));
      wake();
    },
    dispose: () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      images.length = 0;
    },
  };
}
