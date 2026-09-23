import type { ServicesContent } from '@orion-lex/shared';
import { cn } from '@/lib/cn';

interface ServicesHeaderProps {
  content: ServicesContent;
  titleId: string;
}

// Funde la estatua con el fondo por la izquierda, la derecha y abajo.
const statueMask = {
  maskImage:
    'linear-gradient(to right, transparent, #000 25%, #000 85%, transparent), linear-gradient(to bottom, #000 60%, transparent)',
  maskComposite: 'intersect',
};

/** Encabezado de la sección: título, descripción, cita y estatua decorativa. */
export function ServicesHeader({ content, titleId }: ServicesHeaderProps) {
  return (
    <div className="flex items-stretch gap-10">
      <div className="flex-1 lg:pl-12">
        <p className="flex items-center gap-4 text-sm font-medium tracking-[0.2em] text-gold uppercase">
          {content.eyebrow}
          <span aria-hidden="true" className="h-px w-12 bg-gold" />
        </p>
        <h2
          id={titleId}
          className="mt-3 font-serif text-5xl leading-[1.05] font-bold tracking-tight sm:text-6xl lg:text-[4.5rem]"
        >
          {content.title.map((part, i) => (
            <span key={part.text} className={cn(part.highlight && 'text-gold-light')}>
              {i > 0 && ' '}
              {part.text}
            </span>
          ))}
        </h2>
        <p className="mt-4 max-w-[52rem] text-lg text-foreground/85 lg:text-[1.2rem]">
          {content.description}
        </p>
      </div>

      <figure className="hidden max-w-[16.5rem] self-center border-l border-gold/40 py-2 pl-10 lg:block">
        <blockquote className="font-serif text-[1.05rem] leading-relaxed text-foreground/85 italic">
          “{content.quote}”
        </blockquote>
        <span aria-hidden="true" className="mt-4 block h-0.5 w-16 bg-gold" />
      </figure>

      <div className="relative hidden w-[17rem] shrink-0 xl:block">
        <img
          src={content.image.src}
          alt={content.image.alt}
          loading="lazy"
          className="absolute -top-16 left-0 h-[14.5rem] w-full object-cover"
          style={statueMask}
        />
      </div>
      <p className="hidden self-end pb-6 text-gold xl:block">
        <span className="block text-[0.8rem] font-medium tracking-[0.3em] uppercase">
          {content.brand.name}
        </span>
        <span className="mt-1 block text-[0.55rem] tracking-[0.2em] text-gold/80 uppercase">
          {content.brand.tagline}
        </span>
      </p>
    </div>
  );
}
