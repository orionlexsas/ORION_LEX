import { cn } from '@/lib/cn';

/** Estado de una noticia: Publicado (verde) o Borrador (naranja). */
export function StatusBadge({ published, className }: { published: boolean; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap',
        published ? 'bg-success/12 text-success' : 'bg-accent/12 text-accent-text',
        className,
      )}
    >
      {published ? 'Publicado' : 'Borrador'}
    </span>
  );
}
