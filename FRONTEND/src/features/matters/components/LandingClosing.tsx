import type { LandingContent } from '@orion-lex/shared';
import { CtaLink } from '@/components/cta/CtaLink';
import { Container } from '@/components/ui/Container';

/** Cierre de la landing sobre negro: último llamado a WhatsApp y cobertura. */
export function LandingClosing({ landing }: { landing: LandingContent }) {
  const { closing, cta } = landing;
  return (
    <section aria-labelledby="landing-closing" className="on-dark border-b border-border bg-ink">
      <Container className="flex flex-col items-center py-16 text-center lg:py-20">
        <h2
          id="landing-closing"
          className="max-w-3xl font-serif text-4xl leading-tight font-semibold sm:text-5xl"
        >
          {closing.title}
        </h2>
        <span aria-hidden="true" className="mt-5 block h-0.5 w-12 bg-accent" />
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-foreground/85">{closing.text}</p>
        <CtaLink
          link={{ label: cta.label, href: 'whatsapp', message: cta.message }}
          location="landing_closing"
          events={[landing.leadEvent, 'landing_cta_click']}
          size="lg"
          className="mt-8 w-full sm:w-auto"
        />
        {closing.coverage && <p className="mt-6 max-w-xl text-sm text-muted">{closing.coverage}</p>}
      </Container>
    </section>
  );
}
