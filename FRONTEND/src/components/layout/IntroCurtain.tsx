import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

/** Claves compartidas con el script de index.html, que decide si mostrar la intro antes de pintar. */
const SEEN_KEY = 'orion-lex-intro';
const PENDING_CLASS = 'intro-pending';
const PLAYING_CLASS = 'intro-playing';
/** Si por algo el video no termina (red lenta, bloqueo), el telón sube igual tras este tiempo. */
const MAX_DURATION_MS = 8_000;

type Phase = 'playing' | 'lifting' | 'done';

/**
 * Video de introducción a pantalla completa. Nunca debe ser una barrera: solo sale en la portada
 * y en la primera visita (no en las landings de anuncios ni al volver), dura como máximo 8 s,
 * se puede saltar y no aparece si el usuario prefiere menos movimiento. El botón de WhatsApp
 * queda por encima. Mientras corre, la web ya se carga debajo; al terminar, sube como un telón.
 */
export function IntroCurtain({ src }: { src?: string }) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<Phase>(() =>
    src && document.documentElement.classList.contains(PENDING_CLASS) ? 'playing' : 'done',
  );
  const startedPlaying = useRef(phase === 'playing');

  const lift = useCallback(() => setPhase((p) => (p === 'playing' ? 'lifting' : p)), []);

  // Al montar: quita la cortina estática de index.html (ya la reemplaza este componente)
  // y arranca el video; si el navegador bloquea la reproducción, se salta la intro.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove(PENDING_CLASS);
    if (!startedPlaying.current) return;
    root.classList.add(PLAYING_CLASS);
    videoRef.current?.play().catch(lift);
    const timeout = window.setTimeout(lift, MAX_DURATION_MS);
    return () => window.clearTimeout(timeout);
  }, [lift]);

  // Al empezar a subir: se libera el scroll, arrancan las animaciones de la página
  // y se recuerda en este navegador que ya se vio (no vuelve a salir en otras visitas).
  useEffect(() => {
    if (phase !== 'lifting') return;
    document.documentElement.classList.remove(PLAYING_CLASS);
    try {
      localStorage.setItem(SEEN_KEY, '1');
    } catch {
      // Sin almacenamiento: la intro volvería a salir al recargar, nada más.
    }
  }, [phase]);

  if (phase === 'done') return null;

  return (
    <div
      aria-label={t('intro.label')}
      role="region"
      onTransitionEnd={(e) => e.target === e.currentTarget && setPhase('done')}
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center bg-intro transition-transform duration-[1100ms] ease-[cubic-bezier(0.76,0,0.24,1)]',
        phase === 'lifting' && '-translate-y-full',
      )}
    >
      <video
        ref={videoRef}
        src={src}
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        onEnded={lift}
        onError={lift}
        className="size-full object-contain"
      />
      <button
        type="button"
        onClick={lift}
        autoFocus
        className="absolute bottom-6 left-1/2 inline-flex min-h-12 -translate-x-1/2 items-center gap-2 rounded-full bg-ink px-6 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-ink/85"
      >
        {t('intro.skip')}
        <X className="size-4" aria-hidden="true" />
      </button>
      {/* Sombra bajo el borde del telón mientras sube */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-full h-20 bg-gradient-to-b from-ink/20 to-transparent"
      />
    </div>
  );
}
