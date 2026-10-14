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
      <Container className="flex flex-col gap-6 py-10 sm:gap-8 sm:py-12 lg:flex-row lg:items-center lg:justify-between lg:py-12">
        <div>
          <p className="eyebrow">{cta.eyebrow}</p>
          <h2
            id="footer-cta-title"
            className="mt-2 font-serif text-[2rem] leading-tight font-semibold sm:mt-3 sm:text-5xl"
          >
            {cta.title}
          </h2>
          <p className="mt-2 max-w-xl text-muted sm:mt-3 sm:text-lg">{cta.description}</p>
        </div>
        <CtaLink
          link={cta.button}
          location="footer_cta"
          size="lg"
          className="self-start max-sm:w-full max-[359px]:px-4 max-[359px]:text-base lg:self-auto"
        />
      </Container>
    </section>
  );
}
