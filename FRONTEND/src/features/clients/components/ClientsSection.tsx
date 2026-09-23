import type { ClientsContent } from '@orion-lex/shared';
import { Container } from '@/components/ui/Container';
import { ClientsCarousel } from './ClientsCarousel';

interface ClientsSectionProps {
  id: string;
  content: ClientsContent;
}

/** Sección "Nuestros clientes": título y carrusel de tipos de cliente. */
export function ClientsSection({ id, content }: ClientsSectionProps) {
  const titleId = `${id}-title`;

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className="scroll-mt-24 overflow-hidden section-spacing"
    >
      <Container>
        <p className="flex items-center justify-center gap-4 text-xs font-semibold tracking-[0.3em] text-gold uppercase">
          <span aria-hidden="true" className="h-px w-8 bg-gold/70" />
          {content.eyebrow}
          <span aria-hidden="true" className="h-px w-8 bg-gold/70" />
        </p>
        <h2
          id={titleId}
          className="mt-4 text-center font-serif text-4xl leading-tight tracking-tight text-balance sm:text-5xl lg:text-[3.4rem]"
        >
          {content.title}
        </h2>

        <div className="mx-auto mt-12 max-w-6xl">
          <ClientsCarousel items={content.items} intervalMs={content.autoplaySeconds * 1000} />
        </div>
      </Container>
    </section>
  );
}
