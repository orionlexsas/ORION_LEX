/*
 * Después de `vite build`: crea un HTML por página con su <title>, descripción, canonical y
 * Open Graph ya escritos, más sitemap.xml y robots.txt. Así Google y las vistas previas de
 * Facebook, Instagram y WhatsApp (que no ejecutan JavaScript) ven los datos correctos de cada
 * landing. El contenido visible lo sigue pintando React.
 *
 * Los datos salen del mismo código que usa la app (src/seo/pages.ts), cargado con Vite.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

const escapeAttr = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

/** Bloque SEO que reemplaza lo que hay entre <!-- seo:start --> y <!-- seo:end --> en index.html. */
function seoBlock(page, site, absoluteUrl) {
  const url = absoluteUrl(site.siteUrl, page.path);
  const image = absoluteUrl(site.siteUrl, page.image ?? site.seo.image);
  const tags = [
    `<title>${escapeAttr(page.title)}</title>`,
    `<meta name="description" content="${escapeAttr(page.description)}" />`,
    `<link rel="canonical" href="${escapeAttr(url)}" />`,
    `<meta property="og:title" content="${escapeAttr(page.title)}" />`,
    `<meta property="og:description" content="${escapeAttr(page.description)}" />`,
    `<meta property="og:url" content="${escapeAttr(url)}" />`,
    `<meta property="og:image" content="${escapeAttr(image)}" />`,
    `<meta property="og:type" content="${page.type ?? 'website'}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
  ];
  if (page.publishedTime) {
    tags.push(
      `<meta property="article:published_time" content="${escapeAttr(page.publishedTime)}" />`,
    );
  }
  return `<!-- seo:start -->\n    ${tags.join('\n    ')}\n    <!-- seo:end -->`;
}

/** "/" → index.html · "/servicios" → servicios.html · "/actualidad/x" → actualidad/x.html */
const outputFile = (pagePath) =>
  pagePath === '/' ? path.join(dist, 'index.html') : path.join(dist, `${pagePath.slice(1)}.html`);

const server = await createServer({
  root,
  logLevel: 'error',
  appType: 'custom',
  server: { middlewareMode: true, hmr: false },
});

try {
  const { getContent } = await server.ssrLoadModule('/src/content/index.ts');
  const { allPages, absoluteUrl } = await server.ssrLoadModule('/src/seo/pages.ts');
  const content = getContent('es');
  const { site } = content;
  const pages = allPages(content);

  const template = await readFile(path.join(dist, 'index.html'), 'utf8');
  const marker = /<!-- seo:start[\s\S]*?<!-- seo:end -->/;
  if (!marker.test(template))
    throw new Error('index.html no tiene el bloque <!-- seo:start --> … <!-- seo:end -->');

  for (const page of pages) {
    const file = outputFile(page.path);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, template.replace(marker, seoBlock(page, site, absoluteUrl)));
  }

  const today = new Date().toISOString().slice(0, 10);
  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...pages.map(
      (page) =>
        `  <url><loc>${escapeAttr(absoluteUrl(site.siteUrl, page.path))}</loc><lastmod>${page.publishedTime ?? today}</lastmod></url>`,
    ),
    '</urlset>',
    '',
  ].join('\n');
  await writeFile(path.join(dist, 'sitemap.xml'), sitemap);
  await writeFile(
    path.join(dist, 'robots.txt'),
    `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${site.siteUrl}/sitemap.xml\n`,
  );

  console.log(`prerender: ${pages.length} páginas, sitemap.xml y robots.txt`);
} finally {
  await server.close();
}
