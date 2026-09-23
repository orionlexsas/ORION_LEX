import { describe, expect, it } from 'vitest';
import {
  approachContentSchema,
  clientsContentSchema,
  faqContentSchema,
  homeContentSchema,
  locationsContentSchema,
  servicesContentSchema,
  siteContentSchema,
} from '@orion-lex/shared';

// Cada JSON de contenido con su esquema. Si alguien edita un JSON y rompe su forma,
// esta prueba falla antes de que la web deje de cargar.
const schemas = {
  site: siteContentSchema,
  home: homeContentSchema,
  approach: approachContentSchema,
  clients: clientsContentSchema,
  locations: locationsContentSchema,
  faq: faqContentSchema,
  services: servicesContentSchema,
};

const files = import.meta.glob<{ default: unknown }>('./*/*.json', { eager: true });

describe('contenido del sitio', () => {
  for (const language of ['es', 'en']) {
    for (const [name, schema] of Object.entries(schemas)) {
      it(`${language}/${name}.json cumple su esquema`, () => {
        const file = files[`./${language}/${name}.json`];
        expect(file, `falta ${language}/${name}.json`).toBeDefined();
        const result = schema.safeParse(file?.default);
        expect(result.success, result.error?.message).toBe(true);
      });
    }
  }

  it('no hay JSON de contenido sin esquema', () => {
    const known = new Set(Object.keys(schemas));
    const orphans = Object.keys(files).filter(
      (path) => !known.has(path.split('/')[2]!.replace('.json', '')),
    );
    expect(orphans).toEqual([]);
  });
});
