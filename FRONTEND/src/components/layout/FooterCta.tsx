import type { SiteContent } from '@orion-lex/shared';
import { CtaLink } from '@/components/cta/CtaLink';
import { Container } from '@/components/ui/Container';

interface FooterCtaProps {
  cta: SiteContent['footer']['cta'];
}

/** Franja "Hablemos de su caso" sobre el pie de página. */
export function FooterCta({ cta }: FooterCtaProps) {
  return (
    <section aria-labelledby="footer-cta-title" className="border-b border-border">
      <Container className="flex flex-col gap-8 py-14 lg:flex-row lg:items-center lg:justify-between lg:py-16">
        <div>
          <p className="eyebrow">{cta.eyebrow}</p>
          <h2
            id="footer-cta-title"
            className="mt-3 font-serif text-4xl leading-tight font-semibold sm:text-5xl"
          >
            {cta.title}
          </h2>
          <p className="mt-3 max-w-xl text-lg text-muted">{cta.description}</p>
        </div>
        <CtaLink
          link={cta.button}
          location="footer_cta"
          size="lg"
          className="self-start lg:self-auto"
        />
      </Container>
    </section>
  );
}
