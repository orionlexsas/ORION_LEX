import { Check } from 'lucide-react';
import type { LandingContent } from '@orion-lex/shared';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';

type Cases = NonNullable<LandingContent['cases']>;

/** "¿Cuándo conviene revisar su caso?": situaciones en las que aplica el servicio. */
export function LandingCases({ cases }: { cases: Cases }) {
  return (
    <section aria-labelledby="landing-cases" className="bg-surface section-spacing">
      <Container>
        <SectionHeading id="landing-cases" title={cases.title} />
        <ul className="mt-10 grid gap-3 md:grid-cols-2">
          {cases.items.map((item) => (
            <li
              key={item}
              className="flex items-start gap-4 rounded-lg border border-border bg-background p-5 text-lg leading-snug"
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent text-on-accent">
                <Check className="size-4" aria-hidden="true" strokeWidth={2.5} />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
