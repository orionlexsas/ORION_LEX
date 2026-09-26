import { useEffect, useState } from 'react';
import { useInView } from '@/hooks/use-in-view';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';

interface AnimatedCounterProps {
  /** Cifra final (viene del contenido; nunca se inventa ni se aumenta sola). */
  value: number;
  /** Idioma para el separador de miles. */
  locale: string;
  durationMs?: number;
  className?: string;
}

/** Suavizado: arranca rápido y frena al llegar a la cifra. */
const easeOut = (t: number) => 1 - (1 - t) ** 3;

/**
 * Número que sube de 0 a `value` una sola vez, cuando aparece en pantalla. Con movimiento
 * reducido se muestra directamente la cifra final. Los lectores de pantalla leen solo el valor final.
 */
export function AnimatedCounter({
  value,
  locale,
  durationMs = 1800,
  className,
}: AnimatedCounterProps) {
  const [ref, inView] = useInView<HTMLSpanElement>(0.4);
  const reducedMotion = usePrefersReducedMotion();
  const [current, setCurrent] = useState(0);
  const shown = reducedMotion ? value : current;

  useEffect(() => {
    if (!inView || reducedMotion) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      setCurrent(Math.round(easeOut(progress) * value));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reducedMotion, value, durationMs]);

  const format = (n: number) => n.toLocaleString(locale);

  return (
    <span ref={ref} className={className}>
      <span aria-hidden="true" className="tabular-nums">
        {format(shown)}
      </span>
      <span className="sr-only">{format(value)}</span>
    </span>
  );
}
