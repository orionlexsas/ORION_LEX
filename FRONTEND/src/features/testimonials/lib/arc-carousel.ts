/*
 * Carrusel en arco para los testimonios (adaptado de carrusel-celular.html del usuario).
 * - Arranca solo cuando la sección se ve al 50 % (una sola vez): todas las tarjetas entran juntas
 *   desde la derecha, cada una con un pequeño retraso, y se acomodan en un arco suave (la del
 *   centro grande y recta; las de los lados más pequeñas, más abajo e inclinadas).
 * - Luego avanzan una posición a la izquierda, se detienen y vuelven a avanzar, sin fin: la que
 *   sale por la izquierda se teletransporta (sin animación y fuera de la pantalla) al final de la
 *   fila por la derecha. Quien llama debe pasar el set repetido hasta tener al menos visibles + 3.
 * - Solo transform y opacity (CSS); se recalcula al cambiar el tamaño y se pausa fuera de pantalla.
 */

// ---- AJUSTES ----
/** Lo que tarda cada paso (ms). */
export const MOVE_MS = 800;
/** Pausa entre un paso y el siguiente (ms). */
export const PAUSE_MS = 900;
/** Duración de la entrada inicial (ms). */
export const INTRO_MS = 2500;
/** Retraso entre una tarjeta y la siguiente en la entrada (ms). */
const INTRO_STAGGER_MS = 60;
/** Espera entre el final de la entrada y el primer paso (ms). */
const LOOP_DELAY_MS = 1000;
/** Frenado suave al final de cada movimiento. */
const EASE = 'cubic-bezier(.22,1,.36,1)';
/** Escala de las tarjetas que no están en el centro. */
const SIDE_SCALE = 0.82;

/** Tarjetas visibles, separación entre centros (px), caída del arco (px) e inclinación (°). */
function settings(width: number) {
  if (width < 768) return { visible: 5, gap: width * 0.36, arc: 40, tilt: 3 };
  if (width < 1200) return { visible: 7, gap: width * 0.17, arc: 90, tilt: 4 };
  return { visible: 7, gap: Math.min(width, 2000) * 0.15, arc: 120, tilt: 5 };
}

/** Tarjetas necesarias para que el bucle no deje huecos (visibles + 3, con 7 visibles). */
export const MIN_CARDS = 10;

export function startArcCarousel(stage: HTMLElement, cards: HTMLElement[]): () => void {
  const total = cards.length;
  if (total === 0) return () => {};
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let s = settings(stage.clientWidth);
  let step = 0;
  let started = false;
  let onScreen = false;
  let timer: number | undefined;

  const transition = (ms: number, delay = 0) =>
    `transform ${ms}ms ${EASE} ${delay}ms, opacity 400ms`;

  // Posición según el "slot" (0 = extremo izquierdo visible); `extra` la corre en slots.
  const place = (card: HTMLElement, slot: number, extra = 0) => {
    const center = (s.visible - 1) / 2;
    const d = slot - center;
    const e = d + extra;
    const x = stage.clientWidth / 2 + e * s.gap;
    const y = (e / center) ** 2 * s.arc;
    const isCenter = Math.abs(d) < 0.01;
    card.style.transform = `translate(${x}px, ${y}px) rotate(${e * s.tilt}deg) scale(${isCenter ? 1 : SIDE_SCALE})`;
    card.style.zIndex = String(40 - Math.round(Math.abs(d) * 2));
    card.dataset.center = String(isCenter);
  };

  // Slot de cada tarjeta en un paso: de -1 (saliendo por la izquierda) a total - 2.
  const slotOf = (i: number, at: number) => ((((i - at) % total) + total) % total) - 1;

  const layout = (animate: boolean) => {
    cards.forEach((card, i) => {
      const slot = slotOf(i, step);
      // Dio la vuelta (de la izquierda al final de la fila): se mueve sin animación.
      const wrapped = slotOf(i, step - 1) === -1 && slot === total - 2;
      card.style.transition = animate && !wrapped ? transition(MOVE_MS) : 'none';
      place(card, slot);
      card.style.opacity = slot >= 0 && slot <= s.visible ? '1' : '0';
    });
  };

  const loop = () => {
    timer = undefined;
    if (!onScreen) return; // se reanuda al volver a verse
    step += 1;
    layout(true);
    timer = window.setTimeout(loop, MOVE_MS + PAUSE_MS);
  };

  const intro = () => {
    started = true;
    // 1) Todas fuera de la pantalla, a la derecha.
    cards.forEach((card, i) => {
      card.style.transition = 'none';
      place(card, slotOf(i, 0), s.visible + 2);
      card.style.opacity = '1';
    });
    void stage.offsetHeight; // fuerza el repintado antes de animar
    // 2) Entran juntas, cada una un poco después de la anterior.
    cards.forEach((card, i) => {
      const slot = slotOf(i, 0);
      card.style.transition = transition(INTRO_MS, i * INTRO_STAGGER_MS);
      place(card, slot);
      card.style.opacity = slot >= 0 && slot < s.visible ? '1' : '0';
    });
    // 3) Después, los pasos sin fin.
    timer = window.setTimeout(loop, INTRO_MS + LOOP_DELAY_MS);
  };

  // Sin animaciones (preferencia del sistema): quietas en su lugar.
  if (reduceMotion) {
    layout(false);
    started = true;
  } else {
    cards.forEach((card) => (card.style.opacity = '0'));
  }

  const trigger = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting || started) return;
      trigger.disconnect();
      intro();
    },
    { threshold: 0.5 },
  );
  if (!reduceMotion) trigger.observe(stage.closest('section') ?? stage);

  // Fuera de pantalla no se mueve nada; al volver, sigue donde iba.
  const visibility = new IntersectionObserver(([entry]) => {
    onScreen = !!entry?.isIntersecting;
    if (onScreen && started && !reduceMotion && timer === undefined) {
      timer = window.setTimeout(loop, PAUSE_MS);
    }
  });
  visibility.observe(stage);

  const resize = new ResizeObserver(() => {
    s = settings(stage.clientWidth);
    if (started) layout(false);
  });
  resize.observe(stage);

  return () => {
    window.clearTimeout(timer);
    trigger.disconnect();
    visibility.disconnect();
    resize.disconnect();
  };
}
