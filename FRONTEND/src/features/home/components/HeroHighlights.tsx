import type { CSSProperties } from 'react';
import type { HomeContent } from '@orion-lex/shared';
import { ContentIcon } from '@/components/ui/ContentIcon';
import { cn } from '@/lib/cn';

interface HeroHighlightsProps {
  items: HomeContent['hero']['highlights'];
  className?: string;
  style?: CSSProperties;
}

/** Tres puntos fuertes del despacho en una tarjeta translúcida. */
export function HeroHighlights({ items, className, style }: HeroHighlightsProps) {
  return (
    <ul
      className={cn(
        'grid max-w-[52rem] divide-y divide-border rounded-lg border border-border bg-black/45 backdrop-blur-md sm:grid-cols-3 sm:divide-x sm:divide-y-0',
        className,
      )}
      style={style}
    >
      {items.map((item) => (
        <li key={item.title} className="flex items-start gap-4 px-5 py-5">
          <span className="grid size-12 shrink-0 place-items-center rounded-full border-[1.5px] border-gold/90 text-gold">
            <ContentIcon name={item.icon} className="size-6" strokeWidth={1.5} />
          </span>
          <span>
            <span className="block text-[1.05rem] leading-tight font-semibold">{item.title}</span>
            <span className="mt-2 block text-sm leading-snug text-muted">{item.description}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
