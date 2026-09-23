import { ArrowRight, CalendarDays } from 'lucide-react';
import type { SiteContent } from '@orion-lex/shared';
import { CtaLink } from '@/components/cta/CtaLink';
import { Container } from '@/components/ui/Container';

interface FooterCtaProps {
  cta: SiteContent['footer']['cta'];
  brand: SiteContent['brand'];
}

// Funde la estatua con el fondo hacia la izquierda.
const statueMask = { maskImage: 'linear-gradient(to right, transparent, #000 35%)' };

/** Franja "Hablemos de tu caso" sobre el pie de página. */
export function FooterCta({ cta, brand }: FooterCtaProps) {
  return (
    <section
      aria-labelledby="footer-cta-title"
      className="relative isolate overflow-hidden border-b border-gold/60"
    >
      <img
        src={cta.image.src}
        alt={cta.image.alt}
        loading="lazy"
        className="absolute inset-y-0 right-0 -z-10 h-full w-[26rem] object-cover opacity-40 sm:w-[32rem] sm:opacity-70 lg:opacity-100"
        style={statueMask}
      />

      <Container className="flex flex-col gap-10 py-20 lg:flex-row lg:items-center lg:gap-16 lg:py-24">
        <div>
          <p className="flex items-center gap-5 text-sm font-medium tracking-[0.25em] text-gold uppercase">
            {cta.eyebrow}
            <span aria-hidden="true" className="h-px w-14 bg-gold" />
          </p>
          <h2
            id="footer-cta-title"
            className="mt-4 font-serif text-5xl leading-[1.05] font-bold tracking-tight sm:text-6xl lg:text-[4.6rem]"
          >
            {cta.title}
          </h2>
          <p className="mt-3 text-lg text-foreground/90 lg:text-[1.55rem]">{cta.description}</p>
          <CtaLink
            link={cta.button}
            size="lg"
            className="mt-8 px-9 lg:min-h-[4.5rem] lg:px-11 lg:text-[1.35rem]"
            leadingIcon={<CalendarDays className="size-6" aria-hidden="true" />}
            trailingIcon={<ArrowRight className="size-5" aria-hidden="true" />}
          />
        </div>

        <div className="hidden border-l border-gold/50 py-4 pl-8 text-gold lg:block">
          <p className="-rotate-[14deg] font-script text-[2.8rem] leading-[1]">
            {cta.scriptLines.map((line, i) => (
              <span key={line} className="block" style={{ marginLeft: `${i * 0.25}rem` }}>
                {line}
              </span>
            ))}
          </p>
          <svg viewBox="0 0 200 30" className="-mt-1 w-48" aria-hidden="true">
            <path d="M2 28C50 16 120 8 198 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <p className="mt-5 text-sm font-medium tracking-[0.3em] uppercase">{brand.name}</p>
          <p className="mt-1 text-[0.65rem] tracking-[0.25em] text-gold/80 uppercase">
            {brand.tagline}
          </p>
        </div>
      </Container>
    </section>
  );
}
