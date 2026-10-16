import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { AdminActivity, AdminArticleInput } from '../../../SHARED/src/schemas/admin.schema.js';
import { createLoginLimiter, hashPassword, SESSION_COOKIE } from './auth.js';
import { handleAdmin, type AdminDeps, type AdminRequest } from './handler.js';
import type { ContentStore } from './store.js';

/** Almacenamiento en memoria: mismas reglas que el disco o GitHub, sin escribir nada real. */
function memoryStore(initial: Record<string, string | Buffer>) {
  const files = new Map<string, Buffer>(
    Object.entries(initial).map(([k, v]) => [k, Buffer.from(v) as Buffer]),
  );
  const log: AdminActivity[] = [];
  const store: ContentStore = {
    mode: 'local',
    async list(folder) {
      return [...files.entries()]
        .filter(([path]) => path.startsWith(`${folder}/`))
        .map(([path, data]) => ({ path, size: data.length, version: '1' }));
    },
    async read(path) {
      return files.get(path)?.toString('utf8') ?? null;
    },
    async commit(changes, message, author) {
      for (const change of changes) {
        if (change.content === null) files.delete(change.path);
        else files.set(change.path, change.content);
      }
      log.unshift({ date: '2026-10-10T12:00:00.000Z', message, author: author.name });
    },
    async activity(limit) {
      return log.slice(0, limit);
    },
    async readBinary(file) {
      return files.get(file.path) ?? null;
    },
    async publicUrl(file) {
      return file.path.slice('FRONTEND/public'.length);
    },
  };
  return { store, files, log };
}

const C = 'FRONTEND/src/content';
const article = (slug: string, extra: object = {}) =>
  JSON.stringify({
    slug,
    status: 'provisional',
    published: true,
    featured: false,
    title: `Título ${slug}`,
    category: 'tutelas',
    date: '2026-09-01',
    excerpt: 'Resumen',
    body: 'Cuerpo',
    sources: [],
    ...extra,
  });

// WebP mínimo válido (cabecera RIFF....WEBP); al panel solo le importa que lo sea de verdad.
const webp = Buffer.concat([
  Buffer.from('RIFF'),
  Buffer.alloc(4),
  Buffer.from('WEBPVP8 '),
]).toString('base64');

async function setup(extra: Record<string, string> = {}) {
  const memory = memoryStore({
    ...extra,
    [`${C}/es/blog.json`]: JSON.stringify({ categories: [{ slug: 'tutelas', name: 'Tutelas' }] }),
    [`${C}/es/home.json`]: JSON.stringify({
      hero: { title: 'Hola', image: { src: '/images/hero/portada.webp' } },
    }),
    [`${C}/es/articles/vieja.json`]: article('vieja', {
      featured: true,
      image: { src: '/images/actualidad/a.webp', alt: '' },
    }),
    [`${C}/en/articles/vieja.json`]: article('vieja', { title: 'Old one', featured: true }),
    'FRONTEND/public/images/hero/portada.webp': 'x',
    'FRONTEND/public/images/actualidad/a.webp': 'x',
    'FRONTEND/public/images/actualidad/suelta.webp': 'x',
  });
  const deps: AdminDeps = {
    store: memory.store,
    auth: {
      user: {
        email: 'admin@orionlex.co',
        name: 'Ana',
        role: 'Administradora',
        passwordHash: await hashPassword('clave-segura-123'),
      },
      secret: 'x'.repeat(32),
    },
    limiter: createLoginLimiter(3),
    secureCookies: true,
    now: () => new Date('2026-10-10T12:00:00Z'),
  };

  const call = (method: string, path: string, body?: unknown, cookie?: string) => {
    const [pathname, search] = path.split('?');
    const req: AdminRequest = {
      method,
      path: pathname!,
      query: new URLSearchParams(search),
      body,
      cookieHeader: cookie,
      ip: '1.1.1.1',
    };
    return handleAdmin(req, deps);
  };

  const login = await call('POST', '/login', {
    email: 'ADMIN@orionlex.co',
    password: 'clave-segura-123',
  });
  const cookie = login.setCookie!.split(';')[0]!;
  return { ...memory, deps, call, cookie, login };
}

const newArticle = (extra: Partial<AdminArticleInput> = {}): AdminArticleInput => ({
  slug: 'nueva',
  published: false,
  featured: false,
  title: 'Nueva noticia',
  category: 'tutelas',
  date: '2026-10-10',
  excerpt: 'Resumen corto',
  body: '## Hola',
  sources: [],
  ...extra,
});

describe('API del panel: sesión', () => {
  it('inicia sesión con una cookie HttpOnly, segura y limitada a la API del panel', async () => {
    const { login } = await setup();
    expect(login.status).toBe(200);
    expect(login.body).toEqual({
      user: { email: 'admin@orionlex.co', name: 'Ana', role: 'Administradora' },
    });
    expect(login.setCookie).toMatch(new RegExp(`^${SESSION_COOKIE}=`));
    expect(login.setCookie).toContain('HttpOnly');
    expect(login.setCookie).toContain('SameSite=Strict');
    expect(login.setCookie).toContain('Secure');
    expect(login.setCookie).toContain('Path=/api/v1/admin');
    // Sin "Recordarme" la cookie se borra al cerrar el navegador.
    expect(login.setCookie).not.toContain('Max-Age');
  });

  it('rechaza una contraseña equivocada y bloquea tras varios intentos', async () => {
    const { call } = await setup();
    const wrong = { email: 'admin@orionlex.co', password: 'otra' };
    expect((await call('POST', '/login', wrong)).status).toBe(401);
    expect((await call('POST', '/login', wrong)).status).toBe(401);
    expect((await call('POST', '/login', wrong)).status).toBe(401);
    expect((await call('POST', '/login', wrong)).status).toBe(429);
  });

  it('exige sesión para ver o cambiar contenido', async () => {
    const { call, cookie } = await setup();
    expect((await call('GET', '/articles')).status).toBe(401);
    expect(
      (await call('GET', '/articles', undefined, `${SESSION_COOKIE}=falsa.firma`)).status,
    ).toBe(401);
    expect((await call('GET', '/session', undefined, cookie)).body).toMatchObject({
      user: { name: 'Ana' },
    });
    expect((await call('GET', '/session')).body).toEqual({ user: null });
  });

  it('"Recordarme" deja la sesión 30 días', async () => {
    const { call } = await setup();
    const res = await call('POST', '/login', {
      email: 'admin@orionlex.co',
      password: 'clave-segura-123',
      remember: true,
    });
    expect(res.setCookie).toContain(`Max-Age=${30 * 24 * 60 * 60}`);
  });
});

describe('API del panel: noticias', () => {
  it('crea un borrador y lo registra en el historial', async () => {
    const { call, cookie, files, log } = await setup();
    const res = await call('POST', '/articles', { article: newArticle() }, cookie);
    expect(res.status).toBe(201);
    const saved = JSON.parse(files.get(`${C}/es/articles/nueva.json`)!.toString());
    expect(saved).toMatchObject({
      slug: 'nueva',
      status: 'final',
      published: false,
      title: 'Nueva noticia',
    });
    expect(log[0]).toMatchObject({ message: 'Se creó el borrador «Nueva noticia»', author: 'Ana' });
  });

  it('no permite dos noticias con la misma URL ni categorías inexistentes', async () => {
    const { call, cookie } = await setup();
    expect(
      (await call('POST', '/articles', { article: newArticle({ slug: 'vieja' }) }, cookie)).status,
    ).toBe(409);
    expect(
      (await call('POST', '/articles', { article: newArticle({ category: 'otra' }) }, cookie))
        .status,
    ).toBe(400);
  });

  it('al destacar una noticia le quita la marca a la anterior (también en inglés)', async () => {
    const { call, cookie, files } = await setup();
    await call(
      'POST',
      '/articles',
      { article: newArticle({ featured: true, published: true }) },
      cookie,
    );
    const read = (path: string) => JSON.parse(files.get(path)!.toString());
    expect(read(`${C}/es/articles/vieja.json`).featured).toBe(false);
    expect(read(`${C}/en/articles/vieja.json`).featured).toBe(false);
    expect(read(`${C}/es/articles/nueva.json`).featured).toBe(true);
  });

  it('cambiar la URL renombra el archivo y mantiene el texto en inglés', async () => {
    const { call, cookie, files } = await setup();
    const res = await call(
      'PUT',
      '/articles/vieja',
      { article: newArticle({ slug: 'renombrada', published: true, title: 'Nuevo título' }) },
      cookie,
    );
    expect(res.status).toBe(200);
    expect(files.has(`${C}/es/articles/vieja.json`)).toBe(false);
    expect(files.has(`${C}/en/articles/vieja.json`)).toBe(false);
    const english = JSON.parse(files.get(`${C}/en/articles/renombrada.json`)!.toString());
    expect(english).toMatchObject({ slug: 'renombrada', title: 'Old one', date: '2026-10-10' });
  });

  it('guarda la imagen nueva en /images/actualidad junto con la noticia', async () => {
    const { call, cookie, files } = await setup();
    const res = await call(
      'POST',
      '/articles',
      {
        article: newArticle(),
        newImage: { fileName: 'Mi Foto.JPG', mime: 'image/webp', data: webp },
      },
      cookie,
    );
    expect(res.status).toBe(201);
    expect(files.has('FRONTEND/public/images/actualidad/mi-foto.webp')).toBe(true);
    const saved = JSON.parse(files.get(`${C}/es/articles/nueva.json`)!.toString());
    expect(saved.image).toEqual({ src: '/images/actualidad/mi-foto.webp', alt: 'Nueva noticia' });
  });

  it('elimina la noticia en ambos idiomas', async () => {
    const { call, cookie, files } = await setup();
    expect((await call('DELETE', '/articles/vieja', undefined, cookie)).status).toBe(200);
    expect(files.has(`${C}/es/articles/vieja.json`)).toBe(false);
    expect(files.has(`${C}/en/articles/vieja.json`)).toBe(false);
  });
});

describe('API del panel: imágenes', () => {
  it('lista las imágenes con el lugar donde se usan', async () => {
    const { call, cookie } = await setup();
    const res = await call('GET', '/media', undefined, cookie);
    const items = (res.body as { items: { src: string; usages: { label: string }[] }[] }).items;
    const hero = items.find((i) => i.src === '/images/hero/portada.webp');
    expect(hero?.usages.map((u) => u.label)).toEqual(['Portada · banner principal']);
    const loose = items.find((i) => i.src === '/images/actualidad/suelta.webp');
    expect(loose?.usages).toEqual([]);
  });

  it('sube una imagen sin pisar otra con el mismo nombre', async () => {
    const { call, cookie } = await setup();
    const res = await call(
      'POST',
      '/media',
      { folder: 'actualidad', fileName: 'suelta.png', mime: 'image/webp', data: webp },
      cookie,
    );
    expect(res.body).toMatchObject({ src: '/images/actualidad/suelta-2.webp' });
  });

  it('rechaza archivos que no son imágenes', async () => {
    const { call, cookie } = await setup();
    const fake = Buffer.from('<script>alert(1)</script>').toString('base64');
    const res = await call(
      'POST',
      '/media',
      { folder: 'x', fileName: 'a', mime: 'image/webp', data: fake },
      cookie,
    );
    expect(res.status).toBe(400);
  });

  it('no deja borrar una imagen que la web está usando', async () => {
    const { call, cookie, files } = await setup();
    expect(
      (await call('DELETE', '/media?src=/images/hero/portada.webp', undefined, cookie)).status,
    ).toBe(409);
    expect(
      (await call('DELETE', '/media?src=/images/actualidad/suelta.webp', undefined, cookie)).status,
    ).toBe(200);
    expect(files.has('FRONTEND/public/images/actualidad/suelta.webp')).toBe(false);
  });

  it('reemplaza una imagen manteniendo su ruta y formato', async () => {
    const { call, cookie, files } = await setup();
    const res = await call(
      'PUT',
      '/media',
      { src: '/images/hero/portada.webp', mime: 'image/webp', data: webp },
      cookie,
    );
    expect(res.status).toBe(200);
    expect(files.get('FRONTEND/public/images/hero/portada.webp')!.toString('base64')).toBe(webp);
    const jpg = Buffer.from([0xff, 0xd8, 0xff, 0xe0]).toString('base64');
    const mismatch = await call(
      'PUT',
      '/media',
      { src: '/images/hero/portada.webp', mime: 'image/jpeg', data: jpg },
      cookie,
    );
    expect(mismatch.status).toBe(400);
  });
});

describe('API del panel: resumen', () => {
  it('cuenta noticias publicadas, borradores e imágenes', async () => {
    const { call, cookie } = await setup();
    await call('POST', '/articles', { article: newArticle() }, cookie);
    const res = await call('GET', '/overview', undefined, cookie);
    expect(res.body).toMatchObject({
      stats: { published: 1, drafts: 1, images: 3, imagesInUse: 2, lastPublished: '2026-09-01' },
      hero: { title: 'Hola', image: '/images/hero/portada.webp' },
      mode: 'local',
    });
  });
});

describe('API del panel: textos de las imágenes', () => {
  it('encuentra los textos que acompañan a una imagen', async () => {
    const { call, cookie } = await setup();
    const res = await call('GET', '/media/texts?src=/images/actualidad/a.webp', undefined, cookie);
    const { blocks } = res.body as {
      blocks: { file: string; pointer: string; fields: { key: string }[] }[];
    };
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toMatchObject({ file: 'es/articles/vieja.json', pointer: '' });
    expect(blocks[0]!.fields.map((f) => f.key)).toEqual(['title', 'excerpt', 'image.alt']);
  });

  it('guarda los textos y valida el archivo completo', async () => {
    const { call, cookie, files, log } = await setup();
    const save = (values: Record<string, string>) =>
      call('PUT', '/media/texts', { file: 'es/articles/vieja.json', pointer: '', values }, cookie);

    expect((await save({ title: 'Nuevo título', 'image.alt': 'Un mazo' })).status).toBe(200);
    const saved = JSON.parse(files.get(`${C}/es/articles/vieja.json`)!.toString());
    expect(saved.title).toBe('Nuevo título');
    expect(saved.image.alt).toBe('Un mazo');
    expect(log[0]?.message).toBe('Se actualizaron los textos de «Nuevo título»');

    // Ni campos vacíos obligatorios ni campos que no son texto (slug, enlaces…).
    expect((await save({ title: '  ' })).status).toBe(400);
    expect((await save({ slug: 'otra' })).status).toBe(400);
  });
});

describe('API del panel: estadísticas', () => {
  it('agrupa noticias por mes y categoría e imágenes por carpeta', async () => {
    const { call, cookie } = await setup();
    const res = await call('GET', '/stats', undefined, cookie);
    const stats = res.body as {
      byMonth: { month: string; count: number }[];
      byCategory: unknown[];
      byFolder: { folder: string; count: number }[];
      activityByDay: unknown[];
    };
    expect(stats.byMonth).toHaveLength(12);
    expect(stats.byMonth.at(-1)?.month).toBe('2026-10');
    expect(stats.byMonth.find((m) => m.month === '2026-09')?.count).toBe(1);
    expect(stats.byCategory).toEqual([{ name: 'Tutelas', published: 1, drafts: 0 }]);
    expect(stats.byFolder[0]).toMatchObject({ folder: 'actualidad', count: 2 });
    expect(stats.activityByDay).toHaveLength(30);
  });
});

describe('API del panel: archivos de imagen', () => {
  it('sirve la imagen solo con sesión y con su tipo', async () => {
    const { call, cookie } = await setup();
    expect((await call('GET', '/media/file?src=/images/hero/portada.webp')).status).toBe(401);
    const res = await call('GET', '/media/file?src=/images/hero/portada.webp', undefined, cookie);
    expect(res.status).toBe(200);
    expect(res.contentType).toBe('image/webp');
    expect(Buffer.isBuffer(res.body)).toBe(true);
  });

  it('rechaza rutas fuera de la biblioteca', async () => {
    const { call, cookie } = await setup();
    const bad = ['/images/../.env', '/etc/passwd', '/images/hero/portada.txt'];
    for (const src of bad) {
      const res = await call(
        'GET',
        `/media/file?src=${encodeURIComponent(src)}`,
        undefined,
        cookie,
      );
      expect(res.status).toBe(400);
    }
    expect(
      (await call('GET', '/media/file?src=/images/no/existe.webp', undefined, cookie)).status,
    ).toBe(404);
  });
});

/** Contenido real de servicios y asuntos (es y en), copiado en memoria: no se toca ningún archivo. */
function realServicesContent() {
  const files: Record<string, string> = {};
  for (const language of ['es', 'en']) {
    const base = `src/content/${language}`;
    for (const name of ['services.json', 'matters.json']) {
      files[`${C}/${language}/${name}`] = readFileSync(`${base}/${name}`, 'utf8');
    }
    for (const name of readdirSync(`${base}/landings`)) {
      files[`${C}/${language}/landings/${name}`] = readFileSync(`${base}/landings/${name}`, 'utf8');
    }
  }
  return files;
}

describe('API del panel: servicios', () => {
  const readJson = (files: Map<string, Buffer>, path: string) =>
    JSON.parse(files.get(`${C}/${path}`)!.toString());

  it('lee las áreas y los asuntos frecuentes en el orden de la web', async () => {
    const { call, cookie } = await setup(realServicesContent());
    const res = await call('GET', '/services', undefined, cookie);
    const body = res.body as { areas: { items: { slug: string }[] }; landings: { slug: string }[] };
    expect(res.status).toBe(200);
    expect(body.areas.items[0]?.slug).toBe('asesoria-juridica');
    const { order } = JSON.parse(readFileSync('src/content/es/matters.json', 'utf8'));
    expect(body.landings.map((l) => l.slug)).toEqual(order);
  });

  it('agrega un servicio dentro de una categoría', async () => {
    const { call, cookie, files, log } = await setup(realServicesContent());
    const { areas } = (await call('GET', '/services', undefined, cookie)).body as {
      areas: { items: { slug: string; title: string; services: unknown[] }[] };
    };
    const laboral = areas.items.find((i) => i.slug === 'derecho-laboral')!;
    laboral.services.push({
      slug: 'despido-sin-justa-causa',
      title: 'Despido sin justa causa',
      description: 'Le ayudamos a reclamar su indemnización.',
      body: '## ¿Qué hacer?\n\nRevise su carta de despido.',
      message: 'Hola, me despidieron sin justa causa.',
    });
    const res = await call('PUT', '/areas', { items: areas.items }, cookie);
    expect(res.status).toBe(200);
    const saved = readJson(files, 'es/services.json');
    expect(
      saved.items.find((i: { slug: string }) => i.slug === 'derecho-laboral').services[0],
    ).toMatchObject({
      slug: 'despido-sin-justa-causa',
      status: 'final',
    });
    expect(log[0]?.message).toBe(
      'Se creó el servicio «Despido sin justa causa» en «Derecho laboral»',
    );
  });

  it('no permite URLs repetidas ni dos categorías destacadas', async () => {
    const { call, cookie } = await setup(realServicesContent());
    const { areas } = (await call('GET', '/services', undefined, cookie)).body as {
      areas: { items: { slug: string; featured: boolean }[] };
    };
    const repeated = areas.items.map((i, n) =>
      n === 1 ? { ...i, slug: areas.items[0]!.slug } : i,
    );
    expect((await call('PUT', '/areas', { items: repeated }, cookie)).status).toBe(409);
    const twoFeatured = areas.items.map((i) => ({ ...i, featured: true }));
    expect((await call('PUT', '/areas', { items: twoFeatured }, cookie)).status).toBe(400);
  });

  it('crea un asunto frecuente con su URL y lo agrega al final en ambos idiomas', async () => {
    const { call, cookie, files } = await setup(realServicesContent());
    const { landings } = (await call('GET', '/services', undefined, cookie)).body as {
      landings: Record<string, unknown>[];
    };
    const base = { ...landings[0]! };
    delete base.status;
    const landing = {
      ...base,
      slug: 'pension-de-vejez',
      title: 'Pensión de vejez',
      leadEvent: 'pension_lead',
    };
    const res = await call('POST', '/landings', { landing }, cookie);
    expect(res.status).toBe(201);
    expect(files.has(`${C}/es/landings/pension-de-vejez.json`)).toBe(true);
    expect(readJson(files, 'es/matters.json').order.at(-1)).toBe('pension-de-vejez');
    expect(readJson(files, 'en/matters.json').order.at(-1)).toBe('pension-de-vejez');
  });

  it('no deja usar URLs de otras páginas ni repetidas', async () => {
    const { call, cookie } = await setup(realServicesContent());
    const { landings } = (await call('GET', '/services', undefined, cookie)).body as {
      landings: Record<string, unknown>[];
    };
    const base = { ...landings[0]! };
    delete base.status;
    expect(
      (await call('POST', '/landings', { landing: { ...base, slug: 'nosotros' } }, cookie)).status,
    ).toBe(409);
    expect((await call('POST', '/landings', { landing: base }, cookie)).status).toBe(409);
  });

  it('cambiar la URL de un asunto mueve también la traducción y el orden', async () => {
    const { call, cookie, files } = await setup(realServicesContent());
    const { landings } = (await call('GET', '/services', undefined, cookie)).body as {
      landings: Record<string, unknown>[];
    };
    const comparendos = { ...landings.find((l) => l.slug === 'eliminacion-comparendos')! };
    delete comparendos.status;
    const res = await call(
      'PUT',
      '/landings/eliminacion-comparendos',
      { landing: { ...comparendos, slug: 'comparendos' } },
      cookie,
    );
    expect(res.status).toBe(200);
    expect(files.has(`${C}/es/landings/eliminacion-comparendos.json`)).toBe(false);
    expect(readJson(files, 'en/landings/comparendos.json').slug).toBe('comparendos');
    expect(readJson(files, 'es/matters.json').order).toContain('comparendos');
    expect(readJson(files, 'es/matters.json').order).not.toContain('eliminacion-comparendos');
  });

  it('reordena y elimina asuntos', async () => {
    const { call, cookie, files } = await setup(realServicesContent());
    const order: string[] = readJson(files, 'es/matters.json').order;
    const reversed = [...order].reverse();
    expect((await call('PUT', '/landing-order', { order: reversed }, cookie)).status).toBe(200);
    expect(readJson(files, 'en/matters.json').order).toEqual(reversed);
    expect((await call('PUT', '/landing-order', { order: ['otro'] }, cookie)).status).toBe(400);
    expect((await call('DELETE', `/landings/${order[0]}`, undefined, cookie)).status).toBe(200);
    expect(files.has(`${C}/es/landings/${order[0]}.json`)).toBe(false);
    expect(readJson(files, 'es/matters.json').order).not.toContain(order[0]);
  });
});

describe('API del panel: testimonios', () => {
  const real = () => ({
    [`${C}/es/testimonials.json`]: readFileSync('src/content/es/testimonials.json', 'utf8'),
    [`${C}/en/testimonials.json`]: readFileSync('src/content/en/testimonials.json', 'utf8'),
  });
  const readJson = (files: Map<string, Buffer>, path: string) =>
    JSON.parse(files.get(`${C}/${path}`)!.toString());
  type Item = { name: string; service: string; text: string };

  it('agrega, edita y reordena manteniendo la traducción al inglés', async () => {
    const { call, cookie, files, log } = await setup(real());
    const { items } = (await call('GET', '/testimonials', undefined, cookie)).body as {
      items: Item[];
    };
    const [first, second, ...rest] = items;
    const nuevo = {
      name: 'Paula Andrea Ríos',
      service: 'Derecho laboral',
      text: 'Muy buena atención.',
    };
    const res = await call(
      'PUT',
      '/testimonials',
      { items: [second, { ...first!, text: 'Texto nuevo.' }, ...rest, nuevo] },
      cookie,
    );
    expect(res.status).toBe(200);
    const es = readJson(files, 'es/testimonials.json');
    const en = readJson(files, 'en/testimonials.json');
    expect(es.items.at(-1)).toEqual(nuevo);
    expect(es.title).toBe('La confianza de quienes hemos acompañado');
    // El segundo no cambió: conserva su texto en inglés; el editado y el nuevo usan el español.
    expect(en.items[0].text).not.toBe(second!.text);
    expect(en.items[1].text).toBe('Texto nuevo.');
    expect(en.items.at(-1).text).toBe('Muy buena atención.');
    expect(log[0]?.message).toBe('Se agregó el testimonio de «Paula Andrea Ríos»');
  });

  it('no acepta campos vacíos ni nombres repetidos', async () => {
    const { call, cookie } = await setup(real());
    const vacio = await call(
      'PUT',
      '/testimonials',
      { items: [{ name: '', service: 'x', text: 'y' }] },
      cookie,
    );
    expect(vacio.status).toBe(400);
    const t = { name: 'Ana', service: 'x', text: 'y' };
    expect((await call('PUT', '/testimonials', { items: [t, t] }, cookie)).status).toBe(409);
  });
});
