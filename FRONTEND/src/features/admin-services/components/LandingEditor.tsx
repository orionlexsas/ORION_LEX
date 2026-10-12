import { useState, type ReactNode } from 'react';
import { ChevronDown, LoaderCircle, Save } from 'lucide-react';
import { EditorDrawer } from '@/components/admin/EditorDrawer';
import { Field } from '@/components/admin/Field';
import { IconSelect } from '@/components/admin/IconSelect';
import { RecordList, StringList } from '@/components/admin/ListField';
import { Notice } from '@/components/admin/Notice';
import { Switch } from '@/components/admin/Switch';
import { UrlField } from '@/components/admin/UrlField';
import { fieldClass, ghostClass, labelClass, primaryClass } from '@/components/admin/styles';
import { cn } from '@/lib/cn';
import { slugify } from '@/lib/slug';
import { leadEventFor, newLanding, suggestedMessage, type LandingDraft } from '../lib/drafts';
import { ImageField } from './ImageField';

interface LandingEditorProps {
  landing?: LandingDraft;
  takenSlugs: string[];
  saving: boolean;
  error: string | null;
  onSave: (landing: LandingDraft) => void;
  onClose: () => void;
}

/** Bloque plegable del formulario. */
function Section({
  title,
  description,
  defaultOpen,
  children,
}: {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details open={defaultOpen} className="group rounded-xl border border-border">
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5 [&::-webkit-details-marker]:hidden">
        <span className="flex-1">
          <span className="block font-semibold">{title}</span>
          {description && <span className="block text-xs text-muted">{description}</span>}
        </span>
        <ChevronDown
          aria-hidden="true"
          className="size-5 text-muted transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="space-y-4 border-t border-border px-4 py-4">{children}</div>
    </details>
  );
}

/** Interruptor para mostrar u ocultar una sección opcional de la página. */
function Optional({
  enabled,
  onToggle,
  children,
}: {
  enabled: boolean;
  onToggle: (on: boolean) => void;
  children: ReactNode;
}) {
  return (
    <>
      <Switch checked={enabled} onChange={onToggle} label="Mostrar esta sección en la página" />
      {enabled && children}
    </>
  );
}

const text = (value: string, onChange: (v: string) => void, multiline = false) =>
  multiline ? (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      className={cn(fieldClass, 'resize-y')}
    />
  ) : (
    <input value={value} onChange={(e) => onChange(e.target.value)} className={fieldClass} />
  );

/** Crear o editar un asunto frecuente: la página completa que se promociona en anuncios. */
export function LandingEditor({
  landing,
  takenSlugs,
  saving,
  error,
  onSave,
  onClose,
}: LandingEditorProps) {
  const [initial] = useState(() => landing ?? newLanding());
  const [d, setDraft] = useState<LandingDraft>(initial);
  const [touched, setTouched] = useState({ slug: !!landing, message: !!landing });
  const [problems, setProblems] = useState<string[]>([]);
  const update = (patch: Partial<LandingDraft>) => setDraft((prev) => ({ ...prev, ...patch }));

  const setTitle = (title: string) =>
    update({
      title,
      ...(touched.slug ? {} : { slug: slugify(title) }),
      ...(touched.message ? {} : { cta: { ...d.cta, message: suggestedMessage(title) } }),
    });

  const close = () => {
    const dirty = JSON.stringify(d) !== JSON.stringify(initial);
    if (!dirty || window.confirm('Hay cambios sin guardar. ¿Cerrar de todos modos?')) onClose();
  };

  const submit = () => {
    const missing: string[] = [];
    if (!d.title.trim()) missing.push('el nombre');
    if (!/^[a-z0-9-]+$/.test(d.slug)) missing.push('una URL válida');
    else if (takenSlugs.includes(d.slug)) missing.push('una URL que no use otro asunto');
    if (!d.hero.lead.trim()) missing.push('la pregunta de entrada');
    if (!d.cta.label.trim() || !d.cta.message.trim()) missing.push('el botón de WhatsApp');
    if (!d.closing.title.trim() || !d.closing.text.trim()) missing.push('el cierre');
    setProblems(missing);
    if (missing.length > 0) return;

    const clean = (list: string[]) => list.map((s) => s.trim()).filter(Boolean);
    onSave({
      ...d,
      // Lo que no se llene se completa solo para Google y Facebook.
      seo: {
        title: d.seo.title.trim() || `${d.title} | Orión Lex`,
        description: d.seo.description.trim() || d.hero.lead,
      },
      leadEvent: landing?.leadEvent ?? leadEventFor(d.slug),
      hero: {
        ...d.hero,
        paragraphs: clean(d.hero.paragraphs),
        emphasis: d.hero.emphasis?.trim() || undefined,
        highlight: d.hero.highlight?.trim() || undefined,
      },
      cases: d.cases && { ...d.cases, items: clean(d.cases.items) },
      closing: { ...d.closing, coverage: d.closing.coverage?.trim() || undefined },
    });
  };

  return (
    <EditorDrawer
      title={landing ? 'Editar asunto frecuente' : 'Nuevo asunto frecuente'}
      onClose={close}
      footer={
        <>
          <button type="button" onClick={close} className={ghostClass}>
            Cancelar
          </button>
          <button type="button" onClick={submit} disabled={saving} className={primaryClass}>
            {saving ? (
              <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              <Save aria-hidden="true" className="size-4" />
            )}
            {landing ? 'Guardar cambios' : 'Crear asunto'}
          </button>
        </>
      }
    >
      {problems.length > 0 && <Notice tone="error">Falta completar: {problems.join(', ')}.</Notice>}

      <Section
        title="Principal"
        description="Nombre, URL, foto y la parte de arriba de la página"
        defaultOpen
      >
        <Field label="Nombre del asunto" required hint="Título de la tarjeta y de la página.">
          <input
            value={d.title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            placeholder="Ej.: Eliminación de comparendos"
            className={fieldClass}
          />
        </Field>
        <UrlField
          prefix="/"
          value={d.slug}
          saved={landing?.slug ?? null}
          onChange={(slug) => {
            setTouched((t) => ({ ...t, slug: true }));
            update({ slug });
          }}
        />
        <div>
          <span className={labelClass}>Ícono de la tarjeta</span>
          <IconSelect value={d.icon} onChange={(icon) => update({ icon })} />
        </div>
        <ImageField
          label="Foto"
          value={d.image}
          onChange={(image) => update({ image })}
          folder="servicios-frecuentes"
          fileName={d.slug}
          hint="Opcional. Sin foto, la tarjeta muestra el ícono."
        />
        <Field label="Texto pequeño sobre el título" hint="Ej.: Multas de tránsito">
          {text(d.hero.eyebrow, (eyebrow) => update({ hero: { ...d.hero, eyebrow } }))}
        </Field>
        <Field label="Pregunta de entrada" required hint="La primera frase que lee el cliente.">
          {text(d.hero.lead, (lead) => update({ hero: { ...d.hero, lead } }), true)}
        </Field>
        <StringList
          label="Párrafos"
          itemName="párrafo"
          multiline
          values={d.hero.paragraphs}
          onChange={(paragraphs) => update({ hero: { ...d.hero, paragraphs } })}
        />
        <Field label="Frase destacada" hint="Opcional. Qué hace Orión Lex por el cliente.">
          {text(d.hero.emphasis ?? '', (emphasis) => update({ hero: { ...d.hero, emphasis } }))}
        </Field>
        <Field label="Aviso junto al botón" hint="Opcional. Ej.: Diagnóstico gratis en 24 horas.">
          {text(d.hero.highlight ?? '', (highlight) => update({ hero: { ...d.hero, highlight } }))}
        </Field>
        <Field label="Texto del botón de WhatsApp" required>
          {text(d.cta.label, (label) => update({ cta: { ...d.cta, label } }))}
        </Field>
        <Field
          label="Mensaje de WhatsApp"
          required
          hint="Texto que ya aparece escrito al pulsar el botón."
        >
          {text(
            d.cta.message,
            (message) => {
              setTouched((t) => ({ ...t, message: true }));
              update({ cta: { ...d.cta, message } });
            },
            true,
          )}
        </Field>
      </Section>

      <Section title="Casos que atendemos" description="Lista de situaciones del cliente">
        <Optional
          enabled={!!d.cases}
          onToggle={(on) =>
            update({ cases: on ? { title: '¿En qué casos le ayudamos?', items: [''] } : undefined })
          }
        >
          {d.cases && (
            <>
              <Field label="Título">
                {text(d.cases.title, (title) => update({ cases: { ...d.cases!, title } }))}
              </Field>
              <StringList
                label="Casos"
                itemName="caso"
                values={d.cases.items}
                onChange={(items) => update({ cases: { ...d.cases!, items } })}
              />
            </>
          )}
        </Optional>
      </Section>

      <Section title="Cómo es el proceso" description="Pasos numerados">
        <Optional
          enabled={!!d.process}
          onToggle={(on) =>
            update({
              process: on
                ? { title: 'Así trabajamos', steps: [{ title: '', description: '' }] }
                : undefined,
            })
          }
        >
          {d.process && (
            <>
              <Field label="Título">
                {text(d.process.title, (title) => update({ process: { ...d.process!, title } }))}
              </Field>
              <RecordList
                label="Pasos"
                itemName="paso"
                values={d.process.steps}
                empty={{ title: '', description: '' }}
                fields={[
                  { key: 'title', label: 'Título del paso' },
                  { key: 'description', label: 'Descripción', multiline: true },
                ]}
                onChange={(steps) => update({ process: { ...d.process!, steps } })}
              />
            </>
          )}
        </Optional>
      </Section>

      <Section title="Garantía" description="Recuadro destacado">
        <Optional
          enabled={!!d.guarantee}
          onToggle={(on) => update({ guarantee: on ? { title: '', text: '' } : undefined })}
        >
          {d.guarantee && (
            <>
              <Field label="Título">
                {text(d.guarantee.title, (title) =>
                  update({ guarantee: { ...d.guarantee!, title } }),
                )}
              </Field>
              <Field label="Texto">
                {text(
                  d.guarantee.text,
                  (t) => update({ guarantee: { ...d.guarantee!, text: t } }),
                  true,
                )}
              </Field>
            </>
          )}
        </Optional>
      </Section>

      <Section title="Cifra" description="Contador animado, ej.: Más de 1000 casos">
        <Optional
          enabled={!!d.stats}
          onToggle={(on) =>
            update({ stats: on ? { prefix: 'Más de', value: 100, label: '' } : undefined })
          }
        >
          {d.stats && (
            <div className="grid gap-3 sm:grid-cols-[1fr_7rem_1.5fr]">
              <Field label="Antes del número">
                {text(d.stats.prefix, (prefix) => update({ stats: { ...d.stats!, prefix } }))}
              </Field>
              <Field label="Número">
                <input
                  type="number"
                  min={1}
                  value={d.stats.value}
                  onChange={(e) =>
                    update({
                      stats: {
                        ...d.stats!,
                        value: Math.max(1, Math.round(Number(e.target.value))),
                      },
                    })
                  }
                  className={fieldClass}
                />
              </Field>
              <Field label="Después del número">
                {text(d.stats.label, (label) => update({ stats: { ...d.stats!, label } }))}
              </Field>
            </div>
          )}
        </Optional>
      </Section>

      <Section title="Testimonios" description="Opiniones reales de clientes">
        <Optional
          enabled={!!d.testimonials}
          onToggle={(on) =>
            update({
              testimonials: on ? { title: 'Lo que dicen nuestros clientes', items: [] } : undefined,
            })
          }
        >
          {d.testimonials && (
            <>
              <Field label="Título">
                {text(d.testimonials.title, (title) =>
                  update({ testimonials: { ...d.testimonials!, title } }),
                )}
              </Field>
              <RecordList
                label="Testimonios"
                itemName="testimonio"
                values={d.testimonials.items.map(({ name, text: t }) => ({ name, text: t }))}
                empty={{ name: '', text: '' }}
                fields={[
                  { key: 'name', label: 'Nombre del cliente' },
                  { key: 'text', label: 'Lo que dijo', multiline: true },
                ]}
                onChange={(items) => update({ testimonials: { ...d.testimonials!, items } })}
              />
              <p className="text-xs text-muted">Sin testimonios, esta sección no se muestra.</p>
            </>
          )}
        </Optional>
      </Section>

      <Section title="Preguntas frecuentes" description="También ayudan a salir en Google">
        <Optional
          enabled={!!d.faq}
          onToggle={(on) =>
            update({
              faq: on
                ? { title: 'Preguntas frecuentes', items: [{ question: '', answer: '' }] }
                : undefined,
            })
          }
        >
          {d.faq && (
            <>
              <Field label="Título">
                {text(d.faq.title, (title) => update({ faq: { ...d.faq!, title } }))}
              </Field>
              <RecordList
                label="Preguntas"
                itemName="pregunta"
                values={d.faq.items}
                empty={{ question: '', answer: '' }}
                fields={[
                  { key: 'question', label: 'Pregunta' },
                  { key: 'answer', label: 'Respuesta', multiline: true },
                ]}
                onChange={(items) => update({ faq: { ...d.faq!, items } })}
              />
            </>
          )}
        </Optional>
      </Section>

      <Section title="Cierre" description="Último llamado al final de la página">
        <Field label="Título" required>
          {text(d.closing.title, (title) => update({ closing: { ...d.closing, title } }))}
        </Field>
        <Field label="Texto" required>
          {text(d.closing.text, (t) => update({ closing: { ...d.closing, text: t } }), true)}
        </Field>
        <Field label="Cobertura" hint="Opcional. Ej.: Atención virtual en toda Colombia.">
          {text(d.closing.coverage ?? '', (coverage) =>
            update({ closing: { ...d.closing, coverage } }),
          )}
        </Field>
      </Section>

      <Section title="Google y Facebook" description="Cómo se ve el enlace al compartirlo">
        <Field label="Título al compartir" hint="Si lo dejas vacío: «Nombre | Orión Lex».">
          {text(d.seo.title, (title) => update({ seo: { ...d.seo, title } }))}
        </Field>
        <Field
          label="Descripción al compartir"
          hint="Si la dejas vacía se usa la pregunta de entrada."
        >
          {text(
            d.seo.description,
            (description) => update({ seo: { ...d.seo, description } }),
            true,
          )}
        </Field>
      </Section>

      {error && <Notice tone="error">{error}</Notice>}
    </EditorDrawer>
  );
}
