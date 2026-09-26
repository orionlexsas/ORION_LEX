import { ShieldCheck } from 'lucide-react';
import type { LandingContent } from '@orion-lex/shared';
import { Container } from '@/components/ui/Container';

type Guarantee = NonNullable<LandingContent['guarantee']>;

/** Garantía del servicio. El texto viene del JSON: lo confirma el despacho. */
export function GuaranteeBlock({ guarantee }: { guarantee: Guarantee }) {
  return (
    <section aria-labelledby="landing-guarantee" className="pb-14 lg:pb-20">
      <Container>
        <div className="flex flex-col gap-6 rounded-lg border-2 border-accent p-6 sm:flex-row sm:items-start sm:p-10">
          <ShieldCheck
            className="size-12 shrink-0 text-accent"
            strokeWidth={1.4}
            aria-hidden="true"
          />
          <div>
            <h2 id="landing-guarantee" className="font-serif text-2xl font-semibold sm:text-3xl">
              {guarantee.title}
            </h2>
            <p className="mt-3 max-w-3xl text-lg leading-relaxed text-foreground/85">
              {guarantee.text}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
