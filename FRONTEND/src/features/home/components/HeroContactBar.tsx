import type { CSSProperties } from 'react';
import type { HomeContent } from '@orion-lex/shared';
import { ContentIcon } from '@/components/ui/ContentIcon';
import { cn } from '@/lib/cn';

interface HeroContactBarProps {
  items: HomeContent['hero']['contactItems'];
  className?: string;
  style?: CSSProperties;
}

/** Barra con teléfono, correo y ubicación. */
export function HeroContactBar({ items, className, style }: HeroContactBarProps) {
  return (
    <ul
      className={cn(
        'grid max-w-[67rem] rounded-lg border border-border bg-background/75 backdrop-blur-md lg:grid-cols-3',
        className,
      )}
      style={style}
    >
      {items.map((item, i) => {
        const value = item.href ? (
          <a href={item.href} className="transition-colors hover:text-gold">
            {item.value}
          </a>
        ) : (
          item.value
        );

        return (
          <li
            key={item.label}
            className="relative flex items-center gap-5 px-6 py-5 lg:px-9 lg:py-4"
          >
            {i > 0 && (
              <span
                aria-hidden="true"
                className="absolute inset-x-6 top-0 h-px bg-border lg:inset-x-auto lg:inset-y-6 lg:left-0 lg:h-auto lg:w-px"
              />
            )}
            <ContentIcon
              name={item.icon}
              className="size-7 shrink-0 fill-gold text-background"
              strokeWidth={1.75}
            />
            <span className="min-w-0">
              <span className="block text-sm text-muted">{item.label}</span>
              <span className="mt-1 block truncate text-[1.05rem] font-medium">{value}</span>
              {item.detail && (
                <span className="mt-0.5 block text-sm text-muted">{item.detail}</span>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
