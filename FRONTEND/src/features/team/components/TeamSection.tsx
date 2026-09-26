import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { siFacebook } from 'simple-icons';
import type { TeamContent } from '@orion-lex/shared';
import { Container } from '@/components/ui/Container';
import { useInView } from '@/hooks/use-in-view';
import { cn } from '@/lib/cn';

interface TeamSectionProps {
  id: string;
  content: TeamContent;
  /** h1 cuando la sección encabeza la página (/nosotros). */
  headingLevel?: 'h1' | 'h2';
  className?: string;
}

/**
 * Nosotros: quién atenderá el caso. Perfiles editoriales abiertos (sin tarjetas cerradas): foto y
 * texto lado a lado; los dos perfiles en paralelo desde 1280 px con una línea vertical fina entre
 * ellos, y uno debajo del otro (con línea horizontal) en pantallas menores.
 */
export function TeamSection({
  id,
  content,
  headingLevel: Heading = 'h2',
  className,
}: TeamSectionProps) {
  const titleId = `${id}-title`;
  const [listRef, inView] = useInView<HTMLUListElement>(0.15);

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={cn('scroll-mt-20 section-spacing', className)}
    >
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <div className="max-w-3xl">
            <p className="eyebrow">{content.eyebrow}</p>
            <Heading
              id={titleId}
              className="mt-3 font-serif text-[2.4rem] leading-[1.05] font-semibold tracking-tight sm:text-5xl lg:text-[3.6rem] xl:text-[4rem]"
            >
              {content.title}
            </Heading>
            <p className="mt-3 text-lg text-foreground/80 lg:text-xl">{content.description}</p>
          </div>

          {content.script && (
            <p aria-hidden="true" className="w-fit shrink-0 text-foreground/90 lg:mb-2">
              <span className="block -rotate-6 font-script text-[1.9rem] leading-none sm:text-[2.2rem] xl:text-[2.5rem]">
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

        <ul
          ref={listRef}
          className="mt-12 grid divide-y divide-border lg:mt-14 xl:grid-cols-2 xl:divide-x xl:divide-y-0"
        >
          {content.members.map((member, i) => (
            <li
              key={member.name}
              style={{ '--delay': `${i * 140}ms` } as CSSProperties}
              className={cn(
                'py-10 first:pt-0 last:pb-0 xl:py-0 xl:first:pr-10 xl:last:pl-10',
                'transition-[opacity,translate] duration-500 ease-out-soft [transition-delay:var(--delay)]',
                inView ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
              )}
            >
              <TeamProfile member={member} facebookLabel={content.facebookLabel} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

interface TeamProfileProps {
  member: TeamContent['members'][number];
  facebookLabel: string;
}

function TeamProfile({ member, facebookLabel }: TeamProfileProps) {
  const { t } = useTranslation();
  return (
    <article className="grid items-center gap-7 sm:grid-cols-[0.9fr_1.1fr] sm:gap-9 xl:grid-cols-2 xl:items-start xl:gap-7">
      <img
        src={member.photo.src}
        alt={member.photo.alt}
        loading="lazy"
        decoding="async"
        width={960}
        height={960}
        style={{ objectPosition: member.photo.position }}
        className="mx-auto aspect-[4/5] w-full max-w-sm rounded-sm object-cover sm:max-w-none"
      />
      <div>
        <span aria-hidden="true" className="block h-0.5 w-12 bg-accent xl:mt-6" />
        <h3 className="mt-5 font-serif text-[2.2rem] leading-[1.02] font-semibold tracking-tight sm:text-[2.4rem] xl:text-[2.3rem]">
          {member.name}
        </h3>
        <p className="mt-3 text-[0.95rem] font-medium text-foreground/80">{member.role}</p>
        <hr className="my-5 border-border" />
        <p className="text-[1.05rem] leading-relaxed text-foreground/85">{member.description}</p>

        {member.facebook && (
          <a
            href={member.facebook}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${facebookLabel}: ${member.name} ${t('a11y.opensNewTab')}`}
            className="group mt-6 inline-flex min-h-11 items-center gap-3 text-[0.95rem] font-medium text-accent-text"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full border-[1.5px] border-accent text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-on-accent">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
                className="size-[1.1rem]"
              >
                <path d={siFacebook.path} />
              </svg>
            </span>
            <span className="underline decoration-accent/40 decoration-1 underline-offset-[6px] transition-[text-decoration-color] duration-200 group-hover:decoration-accent">
              {facebookLabel}
            </span>
            <ArrowRight
              className="-ml-1 size-4 transition-transform duration-200 ease-out group-hover:translate-x-1"
              aria-hidden="true"
            />
          </a>
        )}
      </div>
    </article>
  );
}
