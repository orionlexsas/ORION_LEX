import { useEffect, useRef, useState } from 'react';

/** La línea va sobre el borde inferior de la franja; el lienzo baja estos px para que quepa la punta. */
const BASELINE = 14;
const DURATION_MS = 3800;

/** Mientras corre el video de intro (ver IntroCurtain) no se anima nada debajo. */
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
 * Bolígrafo 3D de Orión Lex que cruza la franja de confianza de izquierda a derecha, girando
 * sobre su eje sin despegar la punta, y deja una línea naranja (como el video del cliente).
 * Va encima de la franja (que debe ser `relative`). El 3D (three.js + modelo) solo se descarga
 * cuando la franja está a la vista y ya terminó la intro. Sin animaciones (preferencia del
 * sistema) o sin WebGL, solo aparece la línea completa.
 */
export function PenStroke() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const [finished, setFinished] = useState(false);

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
      setFinished(true);
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      showFullLine();
      return;
    }

    let cancelled = false;
    let dispose: (() => void) | undefined;

    const start = async () => {
      try {
        const { createPenScene } = await import('../lib/pen-scene');
        if (cancelled) return;
        const penHeight = Math.min(Math.max(canvas.clientWidth * 0.12, 130), 190);
        const scene = await createPenScene(canvas, {
          baseline: BASELINE,
          penHeight,
          onProgress: drawLine,
        });
        dispose = scene.dispose;
        if (cancelled) return scene.dispose();
        await scene.play(DURATION_MS);
        if (!cancelled) showFullLine();
      } catch {
        // Sin WebGL o sin red para el modelo: queda la línea, que es lo importante.
        if (!cancelled) showFullLine();
      } finally {
        dispose?.();
        dispose = undefined;
      }
    };

    let stopWaiting = () => {};
    const visibility = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        visibility.disconnect();
        stopWaiting = whenIntroEnds(() => void start());
      },
      { threshold: 0.6 },
    );
    visibility.observe(wrap);

    return () => {
      cancelled = true;
      visibility.disconnect();
      stopWaiting();
      dispose?.();
    };
  }, []);

  return (
    <div ref={wrapRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-20">
      <span
        ref={lineRef}
        className="absolute inset-x-0 -bottom-px h-0.5 origin-left scale-x-0 bg-accent"
      />
      {!finished && (
        <canvas
          ref={canvasRef}
          style={{ bottom: -BASELINE }}
          className="absolute inset-x-0 h-64 w-full"
        />
      )}
    </div>
  );
}
