import { describe, expect, it } from 'vitest';
import { articleContentSchema, landingContentSchema } from '@orion-lex/shared';
import { supportedLanguages } from '@/i18n';
import { getContent, sectionSchemas } from './index';

// Cada JSON de contenido con su esquema. Si alguien edita un JSON y rompe su forma,
// esta prueba falla antes de que la web deje de cargar.

const sections = import.meta.glob<unknown>('./*/*.json', { eager: true, import: 'default' });
const landings = import.meta.glob<unknown>('./*/landings/*.json', {
  eager: true,
  import: 'default',
});
const articles = import.meta.glob<unknown>('./*/articles/*.json', {
  eager: true,
  import: 'default',
});

const fileName = (path: string) => path.split('/').pop()!.replace('.json', '');

describe('contenido del sitio', () => {
  for (const language of supportedLanguages) {
    describe(language, () => {
      for (const [name, schema] of Object.entries(sectionSchemas)) {
        it(`${name}.json cumple su esquema`, () => {
          const file = sections[`./${language}/${name}.json`];
          expect(file, `falta ${language}/${name}.json`).toBeDefined();
          const result = schema.safeParse(file);
          expect(result.success, result.error?.message).toBe(true);
        });
      }

      it('cada landing cumple su esquema y su archivo se llama como su slug', () => {
        const files = Object.entries(landings).filter(([p]) => p.startsWith(`./${language}/`));
        expect(files.length).toBeGreaterThan(0);
        for (const [path, raw] of files) {
          const result = landingContentSchema.safeParse(raw);
          expect(result.success, `${path}: ${result.error?.message}`).toBe(true);
          expect(result.data?.slug, path).toBe(fileName(path));
        }
      });

      it('cada artículo cumple su esquema y su archivo se llama como su slug', () => {
        for (const [path, raw] of Object.entries(articles)) {
          if (!path.startsWith(`./${language}/`)) continue;
          const result = articleContentSchema.safeParse(raw);
          expect(result.success, `${path}: ${result.error?.message}`).toBe(true);
          expect(result.data?.slug, path).toBe(fileName(path));
        }
      });

      it('las referencias entre archivos son válidas (orden de landings, categorías)', () => {
        // getContent lanza un error claro si algo no cuadra.
        expect(() => getContent(language)).not.toThrow();
      });
    });
  }

  it('todos los idiomas tienen las mismas landings y artículos (mismas URLs)', () => {
    const [first, ...rest] = supportedLanguages.map((language) => getContent(language));
    for (const other of rest) {
      expect(other.landings.map((l) => l.slug)).toEqual(first!.landings.map((l) => l.slug));
      expect(other.articles.map((a) => a.slug).sort()).toEqual(
        first!.articles.map((a) => a.slug).sort(),
      );
    }
  });

  it('no hay JSON de sección sin esquema', () => {
    const known = new Set(Object.keys(sectionSchemas));
    const orphans = Object.keys(sections).filter((path) => !known.has(fileName(path)));
    expect(orphans).toEqual([]);
  });
});
