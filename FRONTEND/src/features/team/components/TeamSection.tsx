import { useRef, useState, type CSSProperties } from 'react';
import { ArrowLeft, ArrowRight, UsersRound } from 'lucide-react';
import type { TeamContent } from '@orion-lex/shared';
import { CtaLink } from '@/components/cta/CtaLink';
import { CarouselNav } from '@/components/ui/CarouselNav';
import { Container } from '@/components/ui/Container';
import { useInView } from '@/hooks/use-in-view';
import { carouselItem, carouselTrack, useCarousel } from '@/hooks/use-carousel';
import { cn } from '@/lib/cn';

interface TeamSectionProps {
  id: string;
  content: TeamContent;
  /** h1 cuando la sección encabeza la página (/nosotros). */
  headingLevel?: 'h1' | 'h2';
  className?: string;
}

type Member = TeamContent['members'][number];

/** Párrafos de un texto separados por una línea vacía. */
const paragraphs = (text: string) =>
  text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

/**
 * Nosotros: quién atenderá el caso (maqueta del usuario). Una tarjeta por integrante: foto, nombre,
 * cargo, resumen, áreas de enfoque y "Conocer su perfil", que gira la tarjeta y muestra el perfil
 * completo detrás (la tarjeta toma el alto de la cara más larga, así nada se corta). Debajo, una
 * franja con el llamado a escribir. En celular las tarjetas se deslizan de lado.
 */
export function TeamSection({
  id,
  content,
  headingLevel: Heading = 'h2',
  className,
}: TeamSectionProps) {
  const titleId = `${id}-title`;
  const [listRef, inView] = useInView<HTMLDivElement>(0.15);
  const { ref: carouselRef, nav: carouselNav } = useCarousel();

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={cn('scroll-mt-20 section-spacing', className)}
    >
      <Container>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <div className="max-w-3xl">
            <p className="eyebrow">{content.eyebrow}</p>
            <Heading
              id={titleId}
              className="mt-3 font-serif text-[2.4rem] leading-[1.05] font-semibold tracking-tight sm:text-5xl lg:mt-2 lg:text-[3.2rem]"
            >
              {content.title}
            </Heading>
            <p className="mt-3 text-lg text-foreground/80 lg:mt-2">{content.description}</p>
          </div>

          {content.script && (
            <p aria-hidden="true" className="w-fit shrink-0 text-foreground/90 lg:mb-2">
              <span className="block -rotate-6 font-script text-[1.9rem] leading-none sm:text-[2.2rem]">
                {content.script}
              </span>
              <svg viewBox="0 0 240 18" className="mt-1 ml-12 w-48 text-accent sm:w-56">
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

        <div ref={listRef}>
          <ul
            ref={carouselRef}
            className={cn(
              'mt-8 grid gap-6 max-sm:mt-6 lg:mt-7 xl:grid-cols-2 xl:gap-5',
              carouselTrack,
            )}
          >
            {content.members.map((member, i) => (
              <li
                key={member.name}
                style={{ '--delay': `${i * 140}ms` } as CSSProperties}
                className={cn(
                  carouselItem,
                  // Línea vertical fina entre los dos perfiles (computador).
                  i > 0 && 'xl:border-l xl:border-border xl:pl-6',
                  'transition-[opacity,translate] duration-500 ease-out-soft [transition-delay:var(--delay)]',
                  inView ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
                )}
              >
                <ProfileCard member={member} content={content} />
              </li>
            ))}
          </ul>
          <CarouselNav {...carouselNav} />
        </div>

        {content.closing && (
          <div className="mt-8 flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-center sm:gap-5 sm:text-left lg:mt-5">
            <span aria-hidden="true" className="hidden h-px flex-1 bg-border lg:block" />
            <UsersRound
              aria-hidden="true"
              className="size-8 shrink-0 text-accent"
              strokeWidth={1.5}
            />
            <p className="text-lg text-foreground/85">{content.closing.text}</p>
            <CtaLink
              link={content.closing.cta}
              location="team"
              trailingIcon={<ArrowRight aria-hidden="true" className="size-4" />}
              className="rounded-full px-5"
            />
            <span aria-hidden="true" className="hidden h-px flex-1 bg-border lg:block" />
          </div>
        )}
      </Container>
    </section>
  );
}

/**
 * Tarjeta que gira (3D): al frente el resumen; detrás el perfil completo. La cara visible ocupa
 * el alto y la otra va encima (absoluta), así no queda espacio vacío ni se corta el texto.
 */
function ProfileCard({ member, content }: { member: Member; content: TeamContent }) {
  const [flipped, setFlipped] = useState(false);
  const frontButton = useRef<HTMLButtonElement>(null);
  const backButton = useRef<HTMLButtonElement>(null);
  const summary = member.summary ?? paragraphs(member.description)[0] ?? '';

  const flip = (value: boolean) => {
    setFlipped(value);
    // Si se usó el teclado, el foco pasa al botón de la otra cara (lectores de pantalla).
    if (!document.activeElement?.closest('article')) return;
    window.setTimeout(() => (value ? backButton : frontButton).current?.focus(), 50);
  };

  const face =
    'cursor-pointer rounded-xl border border-border bg-background shadow-[0_12px_40px_-24px_rgb(0_0_0/0.35)] transition-shadow [grid-area:1/1] backface-hidden hover:shadow-[0_18px_44px_-22px_rgb(0_0_0/0.4)]';

  return (
    <article className="group h-full perspective-[1800px]">
      {/* Tocar cualquier parte de la tarjeta (foto incluida) la gira; los botones hacen lo mismo. */}
      <div
        onClick={() => flip(!flipped)}
        className={cn(
          'relative grid h-full transition-transform duration-700 ease-out-soft transform-3d motion-reduce:transition-none',
          flipped && 'rotate-y-180',
        )}
      >
        {/* Frente: con retrato recortado va abierto (sin recuadro), la persona grande a la izquierda */}
        <div
          inert={flipped}
          className={cn(
            member.photo.cutout
              ? 'cursor-pointer [grid-area:1/1] backface-hidden'
              : cn(face, 'p-4'),
            'grid content-start gap-5 sm:content-stretch sm:grid-cols-[0.9fr_1fr] sm:gap-5',
            // La cara que no se ve no ocupa alto: la tarjeta mide lo que la cara visible
            // (sin espacio vacío en celular, donde el perfil completo es mucho más largo).
            flipped && 'absolute inset-0',
          )}
        >
          {member.photo.cutout ? (
            // Retrato recortado, sin fondo ni difuminado.
            <div className="relative aspect-[4/3] w-full sm:aspect-auto sm:h-full sm:min-h-[22rem]">
              <img
                src={member.photo.src}
                alt={member.photo.alt}
                loading="lazy"
                decoding="async"
                width={720}
                height={1150}
                className="absolute inset-0 size-full object-contain object-bottom transition-transform duration-500 ease-out-soft group-hover:scale-[1.02] max-sm:object-[50%_15%] max-sm:object-cover"
              />
            </div>
          ) : (
            <img
              src={member.photo.src}
              alt={member.photo.alt}
              loading="lazy"
              decoding="async"
              width={960}
              height={960}
              style={{ objectPosition: member.photo.position }}
              className="aspect-[4/3] w-full rounded-lg object-cover sm:aspect-auto sm:h-full sm:min-h-[17rem]"
            />
          )}
          <div
            className={cn('flex flex-col pb-1 sm:py-1.5 sm:pr-1', member.photo.cutout && 'sm:py-6')}
          >
            <span aria-hidden="true" className="block h-[3px] w-10 rounded-full bg-accent" />
            <h3 className="mt-2.5 font-serif text-[1.9rem] leading-[1.05] font-semibold tracking-tight sm:text-[1.95rem]">
              {member.name}
            </h3>
            <p className="mt-2 font-semibold text-foreground/90">{member.role}</p>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{summary}</p>

            {member.focus.length > 0 && (
              <div className="mt-3 border-t border-border pt-3">
                <p className="text-[0.7rem] font-semibold tracking-[0.2em] text-muted uppercase">
                  {content.focusLabel}
                </p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {member.focus.map((area) => (
                    <li
                      key={area}
                      className="rounded-full border border-accent/50 bg-accent/5 px-2.5 py-1 text-[0.78rem] leading-tight"
                    >
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              ref={frontButton}
              type="button"
              aria-expanded={flipped}
              className="group mt-auto inline-flex w-fit cursor-pointer items-center gap-2 border-b-2 border-accent pt-4 pb-0.5 font-semibold text-accent-text"
            >
              {content.profileLabel}
              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform duration-200 group-hover:translate-x-1"
              />
            </button>
          </div>
        </div>

        {/* Detrás: el perfil completo */}
        <div
          inert={!flipped}
          className={cn(
            face,
            'flex rotate-y-180 flex-col p-6 sm:p-7',
            !flipped && 'absolute inset-0 overflow-hidden',
          )}
        >
          <div className="flex items-center gap-4">
            <img
              src={member.photo.src}
              alt=""
              loading="lazy"
              decoding="async"
              style={{ objectPosition: member.photo.position }}
              className={cn(
                'size-16 shrink-0 rounded-full object-cover ring-2 ring-accent/60',
                member.photo.cutout && 'bg-band-accent object-[50%_8%]',
              )}
            />
            <div>
              <p className="font-serif text-[1.5rem] leading-tight font-semibold">{member.name}</p>
              <p className="text-[0.92rem] font-semibold text-accent-text">{member.role}</p>
            </div>
          </div>
          <div className="mt-4 space-y-3 border-t border-border pt-4 text-[0.95rem] leading-relaxed text-foreground/85">
            {paragraphs(member.description).map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>
          <button
            ref={backButton}
            type="button"
            className="group mt-auto inline-flex w-fit cursor-pointer items-center gap-2 pt-5 font-semibold text-accent-text"
          >
            <ArrowLeft
              aria-hidden="true"
              className="size-4 transition-transform duration-200 group-hover:-translate-x-1"
            />
            {content.backLabel}
          </button>
        </div>
      </div>
    </article>
  );
}
