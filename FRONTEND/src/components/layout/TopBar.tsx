import { Fragment } from 'react';
import { MapPin, Scale } from 'lucide-react';
import type { SiteContent } from '@orion-lex/shared';
import { Container } from '@/components/ui/Container';

/** Franja superior con ubicación, lema y valores del despacho. */
export function TopBar({ topBar }: { topBar: SiteContent['topBar'] }) {
  return (
    <div className="hidden border-b border-border bg-background text-[0.9rem] text-foreground/85 md:block">
      <Container className="flex h-10 items-center justify-between">
        <p className="flex items-center gap-3">
          <MapPin className="size-4 fill-gold text-background" aria-hidden="true" />
          <span className="underline decoration-foreground/40 underline-offset-[6px]">
            {topBar.location}
          </span>
          <span className="h-4 w-px bg-foreground/40" aria-hidden="true" />
          <span>{topBar.slogan}</span>
        </p>
        <p className="hidden items-center gap-2.5 lg:flex">
          <Scale className="mr-1 size-5 text-gold" strokeWidth={1.5} aria-hidden="true" />
          {topBar.values.map((value, i) => (
            <Fragment key={value}>
              {i > 0 && <span aria-hidden="true">·</span>}
              <span>{value}</span>
            </Fragment>
          ))}
        </p>
      </Container>
    </div>
  );
}
