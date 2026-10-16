import type { ZodType } from 'zod';
import {
  approachContentSchema,
  articleContentSchema,
  blogContentSchema,
  coverageContentSchema,
  homeContentSchema,
  landingContentSchema,
  legalContentSchema,
  mattersContentSchema,
  servicesContentSchema,
  siteContentSchema,
  teamContentSchema,
} from '../../../SHARED/src/schemas/content.schema.js';
import type {
  AdminUser,
  ImageTextBlock,
  ImageTextField,
  ImageTextsSave,
} from '../../../SHARED/src/schemas/admin.schema.js';
import { toJsonFile } from './files.js';
import { usageLabel } from './media.js';
import { HttpError, mapLimit, PATHS, type ContentStore } from './store.js';

/*
 * Textos que acompañan a una imagen en la web. Se busca la imagen en los JSON de contenido en
 * español; el objeto que la contiene (el banner, la tarjeta, el perfil…) es el "bloque", y sus
 * textos cortos (título, descripción, cargo…) se pueden editar desde Fotos y banners.
 */

type Json = Record<string, unknown>;

/** Textos que se pueden editar y su etiqueta. El resto (enlaces, slugs, íconos) no se toca. */
const TEXT_KEYS: Record<string, { label: string; multiline?: boolean; optional?: boolean }> = {
  eyebrow: { label: 'Texto pequeño sobre el título', optional: true },
  title: { label: 'Título' },
  name: { label: 'Nombre' },
  role: { label: 'Cargo' },
  summary: { label: 'Resumen corto', multiline: true },
  lead: { label: 'Pregunta de entrada', multiline: true },
  description: { label: 'Descripción', multiline: true },
  excerpt: { label: 'Extracto', multiline: true },
  text: { label: 'Texto', multiline: true },
  details: { label: 'Explicación', multiline: true },
  script: { label: 'Frase manuscrita', optional: true },
};

const SECTION_SCHEMAS: Record<string, ZodType> = {
  site: siteContentSchema,
  home: homeContentSchema,
  matters: mattersContentSchema,
  approach: approachContentSchema,
  services: servicesContentSchema,
  team: teamContentSchema,
  coverage: coverageContentSchema,
  blog: blogContentSchema,
  legal: legalContentSchema,
};

/** Esquema para validar el archivo completo después de editarlo. */
function schemaFor(file: string): ZodType {
  const [, kind = ''] = file.split('/');
  if (kind === 'articles') return articleContentSchema;
  if (kind === 'landings') return landingContentSchema;
  const schema = SECTION_SCHEMAS[kind.replace(/\.json$/, '')];
  if (!schema) throw new HttpError(400, 'UNKNOWN_FILE', 'Ese archivo no se puede editar');
  return schema;
}

const isObject = (value: unknown): value is Json =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** ¿Este objeto es una imagen con esa ruta (en cualquiera de sus versiones)? */
function isImageWith(value: Json, src: string) {
  const dark = isObject(value.dark) ? value.dark : {};
  return [value.src, value.srcMobile, dark.src, dark.srcMobile].includes(src);
}

/** Bloques (objeto padre + nombre de la propiedad de la imagen) que contienen la imagen. */
function findBlocks(
  node: unknown,
  src: string,
  path: string[] = [],
): { path: string[]; imageKey: string }[] {
  if (Array.isArray(node))
    return node.flatMap((item, i) => findBlocks(item, src, [...path, String(i)]));
  if (!isObject(node)) return [];
  return Object.entries(node).flatMap(([key, value]) =>
    isObject(value) && isImageWith(value, src)
      ? [{ path, imageKey: key }]
      : findBlocks(value, src, [...path, key]),
  );
}

function resolve(root: unknown, path: string[]): Json | null {
  let node: unknown = root;
  for (const part of path) {
    node = Array.isArray(node) ? node[Number(part)] : isObject(node) ? node[part] : undefined;
  }
  return isObject(node) ? node : null;
}

function fieldsOf(block: Json, imageKey: string): ImageTextField[] {
  const fields: ImageTextField[] = Object.entries(TEXT_KEYS)
    .filter(([key]) => typeof block[key] === 'string')
    .map(([key, spec]) => ({
      key,
      label: spec.label,
      value: block[key] as string,
      multiline: !!spec.multiline,
      optional: !!spec.optional,
    }));
  const image = block[imageKey];
  if (isObject(image) && typeof image.alt === 'string') {
    fields.push({
      key: `${imageKey}.alt`,
      label: 'Descripción de la imagen (para Google y lectores de pantalla)',
      value: image.alt,
      multiline: false,
      optional: true,
    });
  }
  return fields;
}

export async function findImageTexts(store: ContentStore, src: string): Promise<ImageTextBlock[]> {
  const files = (await store.list(PATHS.content)).filter(
    (f) => f.path.startsWith(`${PATHS.content}/es/`) && f.path.endsWith('.json'),
  );
  const needle = `"${src}"`;
  const blocks = await mapLimit(files, 8, async (file) => {
    const text = (await store.read(file.path)) ?? '';
    if (!text.includes(needle)) return [];
    const relative = file.path.slice(PATHS.content.length + 1);
    const base = usageLabel(relative, text);
    const json: unknown = JSON.parse(text);
    return findBlocks(json, src).flatMap(({ path, imageKey }): ImageTextBlock[] => {
      const block = resolve(json, path);
      if (!block) return [];
      const fields = fieldsOf(block, imageKey);
      if (fields.length === 0) return [];
      // En una tarjeta o perfil de una lista se agrega su nombre ("Servicios jurídicos · Derecho laboral").
      const name = path.some((p) => /^\d+$/.test(p)) ? (block.title ?? block.name) : undefined;
      return [
        {
          file: relative,
          pointer: path.map((p) => `/${p}`).join(''),
          label: typeof name === 'string' && !base.includes(name) ? `${base} · ${name}` : base,
          fields,
        },
      ];
    });
  });
  return blocks.flat();
}

export async function saveImageTexts(store: ContentStore, input: ImageTextsSave, user: AdminUser) {
  const path = `${PATHS.content}/${input.file}`;
  const raw = await store.read(path);
  if (raw === null) throw new HttpError(404, 'NOT_FOUND', 'El archivo no existe');
  const json: unknown = JSON.parse(raw);
  const block = resolve(json, input.pointer.split('/').filter(Boolean));
  if (!block) throw new HttpError(404, 'NOT_FOUND', 'El bloque ya no existe');

  for (const [key, rawValue] of Object.entries(input.values)) {
    const value = rawValue.trim();
    const [field = '', sub] = key.split('.');
    if (sub === 'alt') {
      const image = block[field];
      if (!isObject(image) || typeof image.alt !== 'string') {
        throw new HttpError(400, 'FIELD_NOT_EDITABLE', `No se puede editar ${key}`);
      }
      image.alt = value;
      continue;
    }
    const spec = TEXT_KEYS[field];
    if (!spec || typeof block[field] !== 'string') {
      throw new HttpError(400, 'FIELD_NOT_EDITABLE', `No se puede editar ${key}`);
    }
    if (!value && !spec.optional) {
      throw new HttpError(400, 'FIELD_REQUIRED', `"${spec.label}" no puede quedar vacío`);
    }
    block[field] = value;
  }

  const parsed = schemaFor(input.file).safeParse(json);
  if (!parsed.success) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Los textos no son válidos', parsed.error.issues);
  }
  // Se guarda el JSON editado tal cual (sin los valores por defecto que agrega el esquema).
  const label =
    (typeof block.title === 'string' && block.title) ||
    (typeof block.name === 'string' && block.name) ||
    usageLabel(input.file, raw);
  await store.commit(
    [{ path, content: toJsonFile(json) }],
    `Se actualizaron los textos de «${label}»`,
    user,
  );
}
