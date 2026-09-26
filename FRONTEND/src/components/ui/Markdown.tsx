import ReactMarkdown, { type Components } from 'react-markdown';
import { cn } from '@/lib/cn';

/*
 * Texto en Markdown (artículos y páginas legales) con los estilos del sitio.
 * react-markdown no interpreta HTML crudo, así que el contenido no puede inyectar scripts.
 */

const components: Components = {
  h2: ({ children }) => (
    <h2 className="mt-10 mb-4 font-serif text-2xl leading-snug font-semibold sm:text-[1.75rem]">
      {children}
    </h2>
  ),
  h3: ({ children }) => <h3 className="mt-8 mb-3 font-serif text-xl font-semibold">{children}</h3>,
  p: ({ children }) => <p className="mt-4 leading-[1.8]">{children}</p>,
  ul: ({ children }) => (
    <ul className="mt-4 list-disc space-y-2 pl-6 marker:text-accent">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-4 list-decimal space-y-2 pl-6 marker:font-semibold marker:text-accent-text">
      {children}
    </ol>
  ),
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  blockquote: ({ children }) => (
    <blockquote className="mt-6 border-l-2 border-accent pl-5 font-serif text-lg italic">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => {
    const external = href?.startsWith('http');
    return (
      <a
        href={href}
        className="font-medium text-accent-text underline underline-offset-4 hover:text-foreground"
        {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
      >
        {children}
      </a>
    );
  },
};

export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn('text-lg text-foreground/85 [&>*:first-child]:mt-0', className)}>
      <ReactMarkdown components={components}>{children}</ReactMarkdown>
    </div>
  );
}
