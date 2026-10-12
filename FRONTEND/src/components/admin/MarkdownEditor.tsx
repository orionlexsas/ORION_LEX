import { useRef, useState } from 'react';
import { Bold, Heading2, Link2, List } from 'lucide-react';
import { Markdown } from '@/components/ui/Markdown';

const TOOLS = [
  { id: 'heading', label: 'Subtítulo', icon: Heading2 },
  { id: 'bold', label: 'Negrita', icon: Bold },
  { id: 'list', label: 'Lista', icon: List },
  { id: 'link', label: 'Enlace', icon: Link2 },
] as const;

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  /** Nombre del campo para lectores de pantalla. */
  label: string;
  placeholder?: string;
}

/** Texto largo en Markdown con botones para los formatos más comunes y vista previa. */
export function MarkdownEditor({ value, onChange, label, placeholder }: MarkdownEditorProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [preview, setPreview] = useState(false);

  /** Envuelve la selección (o inserta un ejemplo) con la sintaxis de Markdown. */
  const apply = (before: string, after = '', example = 'texto') => {
    const area = ref.current;
    if (!area) return;
    const { selectionStart: start, selectionEnd: end } = area;
    const selected = value.slice(start, end) || example;
    const next = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      area.focus();
      area.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  };
  const lineStart = (prefix: string, example: string) => {
    const start = ref.current?.selectionStart ?? value.length;
    const needsBreak = start > 0 && value[start - 1] !== '\n';
    apply(`${needsBreak ? '\n\n' : ''}${prefix}`, '', example);
  };

  const runTool = (tool: (typeof TOOLS)[number]['id']) => {
    if (tool === 'heading') lineStart('## ', 'Subtítulo');
    if (tool === 'bold') apply('**', '**');
    if (tool === 'list') lineStart('- ', 'Elemento de la lista');
    if (tool === 'link') apply('[', '](https://)', 'texto del enlace');
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border focus-within:border-accent">
      <div className="flex items-center gap-1 border-b border-border bg-surface px-2 py-1.5">
        {TOOLS.map(({ id, label: toolLabel, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => runTool(id)}
            disabled={preview}
            title={toolLabel}
            aria-label={toolLabel}
            className="grid size-9 cursor-pointer place-items-center rounded-md text-muted hover:bg-foreground/8 hover:text-foreground disabled:opacity-40"
          >
            <Icon aria-hidden="true" className="size-4.5" />
          </button>
        ))}
        <button
          type="button"
          onClick={() => setPreview((v) => !v)}
          aria-pressed={preview}
          className="ml-auto cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold text-muted hover:bg-foreground/8 hover:text-foreground"
        >
          {preview ? 'Editar' : 'Ver cómo queda'}
        </button>
      </div>
      {preview ? (
        <div className="max-h-[28rem] min-h-[16rem] overflow-y-auto px-4 pb-4 text-[0.95rem]">
          <Markdown>{value || '_Sin contenido todavía._'}</Markdown>
        </div>
      ) : (
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={14}
          aria-label={label}
          className="block min-h-[16rem] w-full resize-y bg-background px-4 py-3 font-mono text-[0.85rem] leading-relaxed focus:outline-none"
          placeholder={placeholder}
        />
      )}
    </div>
  );
}
