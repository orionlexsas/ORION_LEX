import { useEffect, useRef, useState } from 'react';
import type { PenBox, PenScene } from '../lib/pen-scene';

/** La línea va sobre el borde inferior de la franja; el lienzo baja estos px para que quepa la punta. */
const BASELINE = 14;
/**
 * Recorrido con el scroll: empieza cuando la franja está al 90 % del alto de la pantalla y
 * termina (fuera por la derecha, línea completa) cuando llega al 20 %.
 */
const SCROLL_START = 0.9;
const SCROLL_END = 0.2;
/** Lo que hay que mover el dedo o el mouse (px) para que cuente como arrastre y no como toque. */
const DRAG_THRESHOLD = 4;

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
 * Bolígrafo 3D de Orión Lex sobre una franja (la de confianza; en celular, una franja crema).
 * Avanza de izquierda a derecha a medida que se baja la página (y retrocede al subir), girando
 * sobre su eje sin despegar la punta, y va dejando una línea naranja. Se puede tocar: al pasar el
 * mouse se balancea, con un toque o clic da vueltas y, manteniéndolo presionado, se arrastra a lo
 * largo de la línea (la punta sigue pegada). Al soltarlo se queda ahí hasta el siguiente scroll.
 * Va encima de la franja (que debe ser `relative`). El 3D (three.js + modelo) solo se descarga
 * cuando la franja está cerca y ya terminó la intro. Sin animaciones (preferencia del sistema) o
 * sin WebGL, solo aparece la línea completa.
 */
export function PenStroke() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const line = lineRef.current;
    const handle = handleRef.current;
    if (!wrap || !canvas || !line || !handle) return;

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
    let tipX = 0;

    // La zona que se puede tocar sigue al bolígrafo en cada cuadro.
    const onFrame = (progress: number, box: PenBox) => {
      drawLine(progress);
      tipX = progress * canvas.clientWidth;
      // La zona táctil nunca se sale de la franja: si sobresaliera por la derecha, la página se
      // haría más ancha un instante y el celular la reacomodaría (un salto al bajar).
      const left = Math.max(box.left, 0);
      const right = Math.min(box.right, canvas.clientWidth);
      const visible = right - left > 8;
      handle.style.display = visible ? 'block' : 'none';
      handle.style.left = `${left}px`;
      handle.style.bottom = `${box.bottom - BASELINE}px`;
      handle.style.width = `${right - left}px`;
      handle.style.height = `${box.top - box.bottom}px`;
    };

    // Alto de pantalla fijo: en el celular la barra de direcciones aparece y se esconde al hacer
    // scroll y cambia innerHeight; si se usara, el bolígrafo saltaría sin que nadie lo mueva.
    // Solo se vuelve a medir al girar el teléfono (cambia el ancho).
    let viewportWidth = window.innerWidth;
    let viewportHeight = document.documentElement.clientHeight;
    const scrollProgress = () => {
      if (window.innerWidth !== viewportWidth) {
        viewportWidth = window.innerWidth;
        viewportHeight = document.documentElement.clientHeight;
      }
      const { top } = wrap.getBoundingClientRect();
      const vh = viewportHeight;
      return (vh * SCROLL_START - top) / (vh * (SCROLL_START - SCROLL_END));
    };
    const onScroll = () => pen?.setTarget(scrollProgress());

    // Tocar, arrastrar y pasar el mouse.
    let press: { startX: number; grab: number; moved: boolean } | undefined;
    const onPointerEnter = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' && !press) pen?.poke('hover');
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!pen) return;
      handle.setPointerCapture(event.pointerId);
      const left = canvas.getBoundingClientRect().left;
      press = { startX: event.clientX, grab: event.clientX - left - tipX, moved: false };
      handle.dataset.dragging = '';
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!press || !pen) return;
      if (!press.moved && Math.abs(event.clientX - press.startX) < DRAG_THRESHOLD) return;
      press.moved = true;
      const left = canvas.getBoundingClientRect().left;
      pen.dragTipTo(event.clientX - left - press.grab);
    };
    const endPress = () => {
      press = undefined;
      delete handle.dataset.dragging;
    };
    const onPointerUp = () => {
      if (press && !press.moved) pen?.poke('tap');
      endPress();
    };
    // El navegador cancela el toque cuando el dedo se desliza en vertical (scroll): no es un toque.
    const onPointerCancel = endPress;

    const start = async () => {
      try {
        const { createPenScene } = await import('../lib/pen-scene');
        if (cancelled) return;
        // En celular, más pequeño: va sobre el final de la foto de portada.
        const penHeight =
          canvas.clientWidth < 640 ? 140 : Math.min(Math.max(canvas.clientWidth * 0.15, 170), 240);
        const scene = await createPenScene(canvas, { baseline: BASELINE, penHeight, onFrame });
        if (cancelled) return scene.dispose();
        pen = scene;
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
      } catch {
        // Sin WebGL o sin red para el modelo: queda la línea, que es lo importante.
        if (!cancelled) showFullLine();
      }
    };

    handle.addEventListener('pointerenter', onPointerEnter);
    handle.addEventListener('pointerdown', onPointerDown);
    handle.addEventListener('pointermove', onPointerMove);
    handle.addEventListener('pointerup', onPointerUp);
    handle.addEventListener('pointercancel', onPointerCancel);

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
      handle.removeEventListener('pointerenter', onPointerEnter);
      handle.removeEventListener('pointerdown', onPointerDown);
      handle.removeEventListener('pointermove', onPointerMove);
      handle.removeEventListener('pointerup', onPointerUp);
      handle.removeEventListener('pointercancel', onPointerCancel);
      pen?.dispose();
    };
  }, []);

  // overflow-anchor: none — la zona táctil se mueve en cada cuadro; si el navegador la tomara como
  // referencia para el scroll (scroll anchoring), corregiría la posición y la página daría un salto.
  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-20 overflow-x-clip [overflow-anchor:none]"
    >
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
      {/*
        Zona invisible sobre el bolígrafo: recibe el mouse y el dedo. Con el dedo, deslizar en
        vertical sigue bajando la página (touch-pan-y); en horizontal arrastra el bolígrafo.
      */}
      <div
        ref={handleRef}
        style={{ display: 'none' }}
        className="pointer-events-auto absolute cursor-grab touch-pan-y select-none data-dragging:cursor-grabbing"
      />
    </div>
  );
}
