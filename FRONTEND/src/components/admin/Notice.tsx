import { CircleAlert, CircleCheck, Info } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'success' | 'error' | 'info';

const tones: Record<Tone, string> = {
  success: 'border-success/30 bg-success/8 text-success',
  error: 'border-danger/30 bg-danger/8 text-danger',
  info: 'border-border bg-surface text-muted',
};
const icons = { success: CircleCheck, error: CircleAlert, info: Info };

/** Mensaje de resultado (guardado, error) dentro del panel. */
export function Notice({
  tone,
  children,
  className,
}: {
  tone: Tone;
  children: ReactNode;
  className?: string;
}) {
  const Icon = icons[tone];
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm',
        tones[tone],
        className,
      )}
    >
      <Icon aria-hidden="true" className="mt-px size-4.5 shrink-0" />
      <div className="text-foreground/90">{children}</div>
    </div>
  );
}
