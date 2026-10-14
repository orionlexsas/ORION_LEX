import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ServicesContent } from '@orion-lex/shared';
import { CtaLink } from '@/components/cta/CtaLink';
import { ContentIcon } from '@/components/ui/ContentIcon';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/cn';
import { practiceAreaHref } from '../lib/routes';

interface ServicesSectionProps {
  id: string;
  content: ServicesContent;
  className?: string;
}

const AUTOPLAY_MS = 5500;

/** Posición de cada tarjeta respecto a la activa: 0 = activa, 1… a la derecha, -1 = sale por la izquierda. */
const slotOf = (index: number, active: number, total: number) => {
  const slot = (index - active + total) % total;
  return slot === total - 1 && total > 2 ? -1 : slot;
};

/**
 * "Servicios jurídicos" como vitrina (inspirada en el slider de PROYECT_ROSADO, con la paleta de
 * Orión Lex): foto grande del área activa a la izquierda con su nombre, y a la derecha la
 * explicación, los botones y una fila de tarjetas que se corren al avanzar.
 * - Avanza sola cada 5,5 s mientras está en pantalla; se pausa con el mouse encima, al tocarla o
 *   con el foco dentro, y no avanza sola con "reducir movimiento".
 * - Flechas, puntos numerados, clic en una tarjeta o deslizar con el dedo para cambiar.
 * - Cada tarjeta es un enlace real a la página del área (la activa navega; las demás se eligen).
 */
export function ServicesSection({ id, content, className }: ServicesSectionProps) {
  const { t } = useTranslation();
  const reducedMotion = usePrefersReducedMotion();
  // La destacada siempre va primero, aunque en el JSON esté en otra posición.
  const items = [...content.items].sort((a, b) => Number(b.featured) - Number(a.featured));
  const total = items.length;

  const [{ active, previous, forward }, setState] = useState({
    active: 0,
    previous: 0,
    forward: true,
  });
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);

  const goTo = (target: number, direction?: boolean) => {
    const next = (target + total) % total;
    setState((s) => {
      if (next === s.active) return s;
      const ahead = (next - s.active + total) % total;
      return { active: next, previous: s.active, forward: direction ?? ahead <= total / 2 };
    });
  };
  const goNext = () => goTo(active + 1, true);
  const goPrev = () => goTo(active - 1, false);
  const userGo = (fn: () => void) => {
    setInteracted(true);
    fn();
  };

  // Solo avanza sola mientras la sección está en pantalla.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => setInView(!!entry?.isIntersecting), {
      threshold: 0.4,
    });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Cada cambio reinicia el tiempo: tras una flecha, espera los 5,5 s completos.
  useEffect(() => {
    if (!inView || paused || reducedMotion || total < 2) return;
    const timer = window.setTimeout(
      () =>
        setState((s) => ({ active: (s.active + 1) % total, previous: s.active, forward: true })),
      AUTOPLAY_MS,
    );
    return () => window.clearTimeout(timer);
  }, [active, inView, paused, reducedMotion, total]);

  const onPointerDown = (e: PointerEvent) => {
    swipeStart.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: PointerEvent) => {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(e.clientY - start.y)) {
      userGo(dx < 0 ? goNext : goPrev);
    }
  };

  const current = items[active]!;
  const titleId = `${id}-title`;

  /** Texto que cambia deslizándose: el nuevo entra por abajo (o por arriba si se retrocede). */
  const changing = (index: number) => {
    if (index === active) return 'translate-y-0 opacity-100';
    if (index === previous) {
      return cn('opacity-0', forward ? '-translate-y-full' : 'translate-y-full');
    }
    return cn('opacity-0 transition-none', forward ? 'translate-y-full' : '-translate-y-full');
  };

  return (
    <section
      ref={sectionRef}
      id={id}
      aria-labelledby={titleId}
      aria-roledescription={t('showcase.roledescription')}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setPaused(false)}
      className={cn(
        'on-dark relative isolate scroll-mt-20 overflow-hidden bg-ink',
        // Altura según el contenido (mínimo cómodo); así nunca se corta en tabletas bajas.
        'min-h-[42rem] lg:min-h-[40rem]',
        className,
      )}
    >
      {/* Fotos de fondo: en celular ocupan todo; desde 1024 px, el 42 % izquierdo. */}
      <div aria-hidden="true" className="absolute inset-y-0 left-0 -z-10 w-full lg:w-[42%]">
        {items.map((item, index) => (
          <img
            key={item.slug}
            src={item.image.src}
            alt=""
            loading={index === 0 ? 'eager' : 'lazy'}
            className={cn(
              'absolute inset-0 size-full object-cover transition-[opacity,scale] duration-[1100ms] ease-out-soft',
              index === active ? 'scale-100 opacity-100' : 'scale-110 opacity-0',
            )}
          />
        ))}
        {/* Oscurece para que el texto se lea; en computador se funde con el negro de la derecha. */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgb(0_0_0/0.75),rgb(0_0_0/0.25)_35%,rgb(0_0_0/0.92)_72%)] lg:bg-[linear-gradient(to_bottom,rgb(0_0_0/0.7),rgb(0_0_0/0.1)_45%,rgb(0_0_0/0.75))]" />
        <div className="absolute inset-y-0 right-0 hidden w-40 bg-gradient-to-r from-transparent to-ink lg:block" />
      </div>

      {/* Puntos numerados: horizontal arriba en celular, vertical a la izquierda en computador. */}
      <div
        role="group"
        aria-label={t('showcase.areas')}
        className={cn(
          'absolute z-10 flex items-center justify-between',
          'top-7 right-5 left-5 sm:right-8 sm:left-8',
          'lg:top-1/2 lg:right-auto lg:left-8 lg:h-[62%] lg:-translate-y-1/2 lg:flex-col',
          'before:absolute before:bg-white/35 before:content-[""]',
          'before:inset-x-2.5 before:top-1/2 before:h-px lg:before:inset-x-auto lg:before:inset-y-2.5 lg:before:left-1/2 lg:before:h-auto lg:before:w-px',
        )}
      >
        {items.map((item, index) => (
          <button
            key={item.slug}
            type="button"
            onClick={() => userGo(() => goTo(index))}
            aria-label={t('showcase.goTo', { number: index + 1, area: item.title })}
            aria-current={index === active}
            className="group relative grid size-7 cursor-pointer place-items-center"
          >
            <span
              className={cn(
                'grid size-6 place-items-center rounded-full text-[0.7rem] font-bold transition-[scale,background-color] duration-300',
                index === active
                  ? 'scale-100 bg-accent text-on-accent'
                  : 'scale-[0.35] bg-white text-transparent group-hover:scale-50',
              )}
            >
              {index + 1}
            </span>
          </button>
        ))}
      </div>

      <div className="relative mx-auto flex min-h-[inherit] w-full max-w-[90rem] flex-col lg:flex-row">
        {/* Izquierda: nombre del área en grande sobre la foto */}
        <div className="flex flex-col justify-between px-5 pt-20 sm:px-8 lg:w-[42%] lg:py-[12vh] lg:pr-10 lg:pl-24">
          <p className="eyebrow">{content.eyebrow}</p>
          <div className="mt-3">
            <div className="grid overflow-hidden">
              {items.map((item, index) => (
                <p
                  key={item.slug}
                  aria-hidden={index !== active}
                  className={cn(
                    '[grid-area:1/1] font-serif text-[2.6rem] leading-[1.02] font-semibold tracking-tight transition-[translate,opacity] duration-700 ease-out-soft sm:text-5xl lg:text-[3.6rem] xl:text-[4.2rem]',
                    changing(index),
                  )}
                >
                  {item.title}
                </p>
              ))}
            </div>
            <span aria-hidden="true" className="mt-5 block h-0.5 w-12 bg-accent" />
          </div>
        </div>

        {/* Derecha: título de la sección, explicación, botones y tarjetas */}
        <div className="flex flex-1 flex-col justify-end gap-5 px-5 pt-8 pb-8 sm:px-8 lg:justify-center lg:py-14 lg:pr-0 lg:pl-14">
          <div>
            {/* En celular el título de la sección solo lo leen los lectores de pantalla (hay poco espacio). */}
            <h2
              id={titleId}
              className="font-serif text-3xl leading-tight font-semibold tracking-tight max-sm:sr-only lg:text-4xl"
            >
              {content.title}
            </h2>
            <p className="mt-2 max-w-xl text-white/70 max-sm:hidden">{content.description}</p>
          </div>

          <div
            className="grid max-w-xl overflow-hidden"
            aria-live={interacted ? 'polite' : 'off'}
            aria-atomic="true"
          >
            {items.map((item, index) => (
              <div
                key={item.slug}
                aria-hidden={index !== active}
                className={cn(
                  '[grid-area:1/1] transition-[translate,opacity] duration-600 ease-out-soft',
                  changing(index),
                )}
              >
                <p className="flex items-start gap-2 text-base font-semibold sm:text-lg">
                  <ContentIcon
                    name={item.icon}
                    className="mt-0.5 size-5 shrink-0 text-accent"
                    strokeWidth={1.6}
                  />
                  {item.description}
                </p>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/75 sm:text-[0.95rem]">
                  {item.details}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <CtaLink
              link={{ label: content.ctaLabel, href: 'whatsapp', message: current.message }}
              location={`services_showcase_${current.slug}`}
            />
            <Link
              to={practiceAreaHref(current.slug)}
              onClick={() => track('service_card_click', { service: current.slug })}
              className="group inline-flex min-h-11 items-center gap-2 font-medium text-white underline decoration-white/40 underline-offset-8 hover:decoration-accent"
            >
              {content.detailsLabel}
              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>

          {/* Fila de tarjetas: la activa más alta; las demás se corren a la izquierda al avanzar. */}
          <div
            className="relative h-[10.5rem] touch-pan-y overflow-hidden [--card-gap:0.75rem] [--card-w:7.25rem] sm:h-[13rem] sm:[--card-w:9.5rem] lg:h-[15.5rem] lg:[--card-gap:1.25rem] lg:[--card-w:11.5rem]"
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
          >
            <ul>
              {items.map((item, index) => {
                const slot = slotOf(index, active, total);
                const before = slotOf(index, previous, total);
                const jump = Math.abs(slot - before) > 1;
                const isActive = slot === 0;
                return (
                  <li
                    key={item.slug}
                    style={{ '--slot': slot } as CSSProperties}
                    className={cn(
                      'absolute top-1/2 left-0 w-[var(--card-w)] translate-x-[calc(var(--slot)*(var(--card-w)+var(--card-gap)))] -translate-y-1/2',
                      'transition-[translate,height,opacity] duration-700 ease-out-soft',
                      jump && 'transition-none',
                      isActive ? 'z-10 h-full' : 'h-[82%]',
                      slot === -1 && 'pointer-events-none opacity-0',
                    )}
                  >
                    <Link
                      to={practiceAreaHref(item.slug)}
                      tabIndex={slot === -1 ? -1 : undefined}
                      onClick={(e) => {
                        if (isActive) return track('service_card_click', { service: item.slug });
                        e.preventDefault();
                        userGo(() => goTo(index));
                      }}
                      aria-label={
                        isActive ? item.title : t('showcase.choose', { area: item.title })
                      }
                      className={cn(
                        'group relative flex size-full items-end overflow-hidden rounded-md shadow-[0_10px_40px_-12px_rgb(0_0_0/0.6)]',
                        isActive && 'ring-2 ring-accent',
                      )}
                    >
                      <img
                        src={item.image.src}
                        alt=""
                        loading="lazy"
                        className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out-soft group-hover:scale-105"
                      />
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 bg-[linear-gradient(20deg,rgb(0_0_0/0.85),transparent_75%)]"
                      />
                      <span className="relative p-3 text-[0.8rem] leading-tight font-semibold text-white lg:p-4 lg:text-sm">
                        {item.title}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex items-center gap-3">
            {[
              { label: t('showcase.previous'), icon: ChevronLeft, onClick: () => userGo(goPrev) },
              { label: t('showcase.next'), icon: ChevronRight, onClick: () => userGo(goNext) },
            ].map(({ label, icon: Icon, onClick }) => (
              <button
                key={label}
                type="button"
                onClick={onClick}
                aria-label={label}
                className="grid size-11 cursor-pointer place-items-center rounded-full border border-white/30 bg-white/10 transition-[background-color,scale] hover:scale-105 hover:bg-white/25 active:scale-95"
              >
                <Icon aria-hidden="true" className="size-5" />
              </button>
            ))}
            <p className="ml-auto text-[0.7rem] font-medium tracking-[0.14em] text-white/65 uppercase lg:pr-8">
              <span className="font-serif text-base tracking-normal text-white">
                {String(active + 1).padStart(2, '0')}
              </span>{' '}
              / {String(total).padStart(2, '0')}
              <span className="ml-3 max-sm:hidden">{t('showcase.hint')}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
