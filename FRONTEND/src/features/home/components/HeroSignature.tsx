import type { HomeContent } from '@orion-lex/shared';

interface HeroSignatureProps {
  signature: HomeContent['hero']['signature'];
  quote: string;
}

/** Firma manuscrita y cita decorativas del lado derecho (solo en pantallas grandes). */
export function HeroSignature({ signature, quote }: HeroSignatureProps) {
  return (
    <>
      <div className="pointer-events-none absolute top-[19%] right-[6%] hidden w-56 animate-rise text-gold xl:block [--delay:500ms]">
        <p className="-rotate-[14deg] text-center font-script text-[2.6rem] leading-[0.95]">
          {signature.scriptLines.map((line, i) => (
            <span key={line} className="block" style={{ marginLeft: `${i * 2}rem` }}>
              {line}
            </span>
          ))}
        </p>
        <svg viewBox="0 0 240 40" className="-mt-2 w-full" aria-hidden="true">
          <path d="M4 36C60 22 140 12 236 8" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <p className="mt-5 ml-2 text-[0.8rem] font-medium tracking-[0.45em] text-gold uppercase">
          {signature.brand}
        </p>
        <p className="mt-1 ml-2 text-[0.6rem] tracking-[0.35em] text-gold/80 uppercase">
          {signature.tagline}
        </p>
      </div>

      <figure className="absolute right-[5.5%] bottom-[11%] hidden max-w-[20.5rem] animate-rise xl:block [--delay:600ms]">
        <blockquote className="font-serif text-[0.9rem] leading-relaxed text-foreground/80 italic">
          “{quote}”
        </blockquote>
        <span aria-hidden="true" className="mt-4 block h-0.5 w-10 bg-gold" />
      </figure>
    </>
  );
}
