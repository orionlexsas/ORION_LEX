import { ArrowRight } from 'lucide-react';
import type { BlogContent } from '@orion-lex/shared';
import { CtaLink } from '@/components/cta/CtaLink';

// Funde la planta con el fondo hacia la izquierda.
const fadeLeft = { maskImage: 'linear-gradient(to right, transparent, #000 45%)' };

/** Franja final de Actualidad Jurídica: "¿Necesita orientación…?" con el botón a WhatsApp. */
export function BlogCta({ cta, location }: { cta: BlogContent['cta']; location: string }) {
  return (
    <aside
      aria-labelledby={`${location}-cta-title`}
      className="relative isolate overflow-hidden rounded-md border-t-2 border-accent bg-surface"
    >
      {cta.image && (
        <img
          src={cta.image.src}
          alt={cta.image.alt}
          loading="lazy"
          className="absolute inset-y-0 right-0 -z-10 hidden h-full w-56 object-cover md:block"
          style={fadeLeft}
        />
      )}
      <div className="flex flex-col gap-7 px-6 py-9 sm:px-10 md:pr-60 lg:flex-row lg:items-center lg:gap-12">
        <div className="max-w-xl">
          <h2
            id={`${location}-cta-title`}
            className="font-serif text-3xl leading-[1.1] font-semibold tracking-tight sm:text-[2.2rem]"
          >
            {cta.title}
          </h2>
          <p className="mt-3 leading-relaxed text-muted">{cta.text}</p>
        </div>
        <CtaLink
          link={cta.button}
          location={location}
          className="self-start lg:self-auto"
          trailingIcon={<ArrowRight className="size-4" aria-hidden="true" />}
        />
      </div>
    </aside>
  );
}
