import { useEffect, useRef, useState } from 'react';
import type { PenScene } from '../lib/pen-scene';

/** La línea va sobre el borde inferior de la franja; el lienzo baja estos px para que quepa la punta. */
const BASELINE = 14;
/**
 * Recorrido con el scroll: empieza cuando la franja está al 90 % del alto de la pantalla y
 * termina (fuera por la derecha, línea completa) cuando llega al 20 %.
 */
const SCROLL_START = 0.9;
const SCROLL_END = 0.2;

/** Mientras corre el video de intro (ver IntroCurtain) no se carga ni se anima nada debajo. */
const introRunning = () => {
  const { classList } = document.documentElement;
  return classList.contains('intro-pending') || classList.contains('intro-playing');
};

const whenIntroEnds = (callback: () => void) => {
  if (!introRunning()) {
    callback();
    return () => {};
  }
  const observer = new MutationObserver(() => {
    if (introRunning()) return;
    observer.disconnect();
    callback();
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
};

/**
 * Bolígrafo 3D de Orión Lex sobre la franja de confianza. Avanza de izquierda a derecha a medida
 * que se baja la página (y retrocede al subir), girando sobre su eje sin despegar la punta, y va
 * dejando una línea naranja. Al pasar el mouse se balancea; al hacer clic o tocarlo da vueltas.
 * Va encima de la franja (que debe ser `relative`). El 3D (three.js + modelo) solo se descarga
 * cuando la franja está cerca y ya terminó la intro. Sin animaciones (preferencia del sistema) o
 * sin WebGL, solo aparece la línea completa.
 */
export function PenStroke() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const line = lineRef.current;
    if (!wrap || !canvas || !line) return;

    const drawLine = (progress: number) => {
      // Tailwind escala con la propiedad `scale` (no `transform`).
      line.style.scale = `${progress} 1`;
    };
    const showFullLine = () => {
      drawLine(1);
      setFallback(true);
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      showFullLine();
      return;
    }

    let cancelled = false;
    let pen: PenScene | undefined;
    let hovering = false;

    const scrollProgress = () => {
      const { top } = wrap.getBoundingClientRect();
      const vh = window.innerHeight;
      return (vh * SCROLL_START - top) / (vh * (SCROLL_START - SCROLL_END));
    };
    const onScroll = () => pen?.setTarget(scrollProgress());
    const setHover = (value: boolean) => {
      if (hovering === value) return;
      hovering = value;
      document.documentElement.style.cursor = value ? 'pointer' : '';
      if (value) pen?.poke('hover');
    };
    const onPointerMove = (event: PointerEvent) =>
      setHover(!!pen?.hitTest(event.clientX, event.clientY));
    const onPointerDown = (event: PointerEvent) => {
      if (pen?.hitTest(event.clientX, event.clientY)) pen.poke('tap');
    };

    const start = async () => {
      try {
        const { createPenScene } = await import('../lib/pen-scene');
        if (cancelled) return;
        const penHeight = Math.min(Math.max(canvas.clientWidth * 0.15, 170), 240);
        const scene = await createPenScene(canvas, {
          baseline: BASELINE,
          penHeight,
          onProgress: drawLine,
        });
        if (cancelled) return scene.dispose();
        pen = scene;
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('pointermove', onPointerMove, { passive: true });
        window.addEventListener('pointerdown', onPointerDown, { passive: true });
      } catch {
        // Sin WebGL o sin red para el modelo: queda la línea, que es lo importante.
        if (!cancelled) showFullLine();
      }
    };

    let stopWaiting = () => {};
    const nearby = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        nearby.disconnect();
        stopWaiting = whenIntroEnds(() => void start());
      },
      { rootMargin: '400px 0px' },
    );
    nearby.observe(wrap);

    return () => {
      cancelled = true;
      nearby.disconnect();
      stopWaiting();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      document.documentElement.style.cursor = '';
      pen?.dispose();
    };
  }, []);

  return (
    <div ref={wrapRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-20">
      <span
        ref={lineRef}
        className="absolute inset-x-0 -bottom-px h-0.5 origin-left scale-x-0 bg-accent"
      />
      {!fallback && (
        <canvas
          ref={canvasRef}
          style={{ bottom: -BASELINE }}
          className="absolute inset-x-0 h-80 w-full"
        />
      )}
    </div>
  );
}
