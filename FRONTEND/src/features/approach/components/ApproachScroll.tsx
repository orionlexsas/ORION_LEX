import { useEffect, useRef } from 'react';
import type { ApproachContent } from '@orion-lex/shared';
import { CtaLink } from '@/components/cta/CtaLink';
import { Container } from '@/components/ui/Container';
import { cn } from '@/lib/cn';
import { createFramePlayer } from '../lib/frame-player';

type Sequence = NonNullable<ApproachContent['sequence']>;

interface ApproachScrollProps {
  id: string;
  content: ApproachContent;
  sequence: Sequence;
}

/** Alto del recorrido (en pantallas): cuanto más, más despacio avanza el video. */
const SCREENS = 4.2;
/** Parte de la ventana de cada texto que dura su entrada y su salida. */
const FADE_IN = 0.3;
const FADE_OUT = 0.22;
/** Lo que se desliza cada texto al entrar o salir (px). */
const SLIDE = 70;
/** Pantallas angostas: fotogramas pequeños. */
const SMALL = '(max-width: 767px)';

const pad = (n: number) => String(n).padStart(4, '0');

/**
 * "Cómo trabajamos" con el video del Palacio de Justicia (portada). La sección mide varias
 * pantallas y el video queda fijo (sticky) mientras se baja: el scroll elige el fotograma (como en
 * el proyecto del restaurante). Encima van apareciendo los textos, uno a la vez y alternando de
 * lado: el encabezado a la izquierda, la etapa 1 a la derecha, la 2 a la izquierda y la 3 a la
 * derecha. Abajo, una línea marca el avance.
 */
export function ApproachScroll({ id, content, sequence }: ApproachScrollProps) {
  const titleId = `${id}-title`;
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);
  const barRef = useRef<HTMLSpanElement>(null);
  const panelCount = content.steps.length + 1;

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const small = window.matchMedia(SMALL).matches;
    const variant = small ? 'sm' : 'lg';
    const total = sequence.frames[variant];
    let player: ReturnType<typeof createFramePlayer> | undefined;

    // Alto de pantalla fijo (la barra del navegador del celular no hace saltar el progreso).
    let width = window.innerWidth;
    let height = document.documentElement.clientHeight;

    const update = () => {
      if (window.innerWidth !== width) {
        width = window.innerWidth;
        height = document.documentElement.clientHeight;
      }
      const rect = section.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, -rect.top / (rect.height - height)));
      player?.setProgress(progress);
      if (barRef.current) barRef.current.style.scale = `${progress} 1`;

      // Cada texto tiene su tramo del recorrido; entra deslizándose desde su lado y sale.
      panelRefs.current.forEach((panel, i) => {
        if (!panel) return;
        const start = i / panelCount;
        const local = (progress - start) * panelCount; // 0→1 dentro de su tramo
        const last = i === panelCount - 1;
        let visible: number;
        if (i === 0 && local < FADE_IN)
          visible = 1; // el encabezado ya está al llegar
        else if (local < 0) visible = 0;
        else if (local < FADE_IN) visible = local / FADE_IN;
        else if (last || local < 1 - FADE_OUT) visible = 1;
        else visible = Math.max(0, (1 - local) / FADE_OUT);
        const fromRight = i % 2 === 1;
        const leaving = local > 0.5 && !last;
        const offset = (1 - visible) * SLIDE * (fromRight ? 1 : -1) * (leaving ? -0.6 : 1);
        panel.style.opacity = String(visible);
        panel.style.translate = `${offset}px 0`;
        panel.style.visibility = visible < 0.02 ? 'hidden' : 'visible';
      });
    };

    // El video solo se descarga cuando la sección está cerca.
    const nearby = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || player) return;
        nearby.disconnect();
        player = createFramePlayer(
          canvas,
          (i) => `${sequence.path}/${variant}/${pad(i + 1)}.webp`,
          total,
        );
        update();
      },
      { rootMargin: '600px 0px' },
    );
    nearby.observe(section);

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      nearby.disconnect();
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      player?.dispose();
    };
  }, [sequence, panelCount]);

  const panel = (i: number) =>
    cn(
      'absolute inset-0 flex items-center opacity-0 will-change-[opacity,translate]',
      i % 2 === 1 ? 'justify-end' : 'justify-start',
    );
  const glass =
    'w-[86%] max-w-[30rem] rounded-2xl border border-white/15 bg-ink/60 p-7 text-white shadow-[0_30px_80px_-30px_rgb(0_0_0/0.6)] backdrop-blur-md max-sm:p-5 sm:w-full sm:p-9';

  return (
    <section
      ref={sectionRef}
      id={id}
      aria-labelledby={titleId}
      aria-roledescription="recorrido"
      style={{ height: `${SCREENS * 100}svh` }}
      className="on-dark relative scroll-mt-20 bg-ink"
    >
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={sequence.alt}
          className="absolute inset-0 block size-full"
        />
        {/* Velo suave para que los textos se lean sobre cualquier fotograma */}
        <div aria-hidden="true" className="absolute inset-0 bg-black/20" />

        <Container className="relative h-full">
          {/* Encabezado (izquierda) */}
          <div
            ref={(el) => {
              panelRefs.current[0] = el;
            }}
            className={panel(0)}
          >
            <div className={glass}>
              <p className="eyebrow">{content.eyebrow}</p>
              <h2
                id={titleId}
                className="mt-3 font-serif text-[2.6rem] leading-[1.02] font-semibold tracking-tight sm:text-[3.4rem]"
              >
                {content.title}
              </h2>
              <p className="mt-4 text-lg text-white/85">{content.description}</p>
              {content.script && (
                <p aria-hidden="true" className="mt-5 w-fit">
                  <span className="block -rotate-3 font-script text-[1.9rem] leading-none text-white/95 sm:text-[2.2rem]">
                    {content.script}
                  </span>
                  <svg viewBox="0 0 240 18" className="mt-1 ml-10 w-44 text-accent sm:w-52">
                    <path
                      d="M3 15C65 7 140 3 237 5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </p>
              )}
            </div>
          </div>

          {/* Etapas, alternando de lado */}
          <ol>
            {content.steps.map((step, i) => (
              <li
                key={step.title}
                ref={(el) => {
                  panelRefs.current[i + 1] = el;
                }}
                className={panel(i + 1)}
              >
                <div className={glass}>
                  <div className="flex items-center gap-4">
                    <span className="font-serif text-[3.2rem] leading-none font-semibold text-accent sm:text-[3.8rem]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span aria-hidden="true" className="h-px flex-1 bg-white/25" />
                  </div>
                  <h3 className="mt-4 font-serif text-[1.9rem] leading-tight font-semibold sm:text-[2.2rem]">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-lg leading-relaxed text-white/85">{step.description}</p>
                  {i === content.steps.length - 1 && content.cta && (
                    <CtaLink link={content.cta} location="approach" className="mt-6" />
                  )}
                </div>
              </li>
            ))}
          </ol>
        </Container>

        {/* Avance del recorrido */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-6 mx-auto h-0.5 w-40 overflow-hidden rounded-full bg-white/25"
        >
          <span ref={barRef} className="block h-full origin-left scale-x-0 bg-accent" />
        </div>
      </div>
    </section>
  );
}
