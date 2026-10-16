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

const escapeHtml = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** JSON-LD seguro dentro de <script> (ningún texto puede cerrar la etiqueta). */
const jsonLd = (data) =>
  `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\u003c')}</script>`;

/**
 * Datos estructurados (schema.org) para Google: el despacho (LegalService) y el sitio (WebSite)
 * en todas las páginas, con el nombre con y sin tilde; migas de pan en las internas y el
 * servicio en las páginas de asuntos, áreas y servicios.
 */
function structuredData(page, content, absoluteUrl) {
  const { site } = content;
  const url = (p) => absoluteUrl(site.siteUrl, p);
  const orgId = `${site.siteUrl}/#organizacion`;
  const blocks = [
    {
      '@context': 'https://schema.org',
      '@type': 'LegalService',
      '@id': orgId,
      name: site.brand.legalName,
      alternateName: [
        'Orión Lex',
        'Orion Lex',
        'Orion Lex Servicios Juridicos',
        'Orión Lex Abogados',
      ],
      url: site.siteUrl,
      logo: url('/brand/logo.webp'),
      image: url(site.seo.image),
      description: site.seo.description,
      telephone: `+${site.contact.whatsapp.number}`,
      email: site.contact.email,
      areaServed: { '@type': 'Country', name: 'Colombia' },
      availableLanguage: ['es', 'en'],
      sameAs: site.social.map((s) => s.url),
      knowsAbout: [
        ...content.landings.map((l) => l.title),
        ...content.services.items.map((i) => i.title),
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${site.siteUrl}/#sitio`,
      name: site.brand.name,
      alternateName: ['Orion Lex', site.brand.legalName],
      url: site.siteUrl,
      inLanguage: 'es-CO',
      publisher: { '@id': orgId },
    },
  ];
  if (page.path !== '/') {
    const crumbs = [{ name: 'Inicio', path: '/' }];
    if (page.kind === 'area' || page.kind === 'service')
      crumbs.push({ name: 'Servicios', path: '/servicios' });
    if (page.kind === 'service')
      crumbs.push({
        name: page.areaTitle ?? 'Área',
        path: page.path.split('/').slice(0, 3).join('/'),
      });
    if (page.kind === 'article') crumbs.push({ name: 'Actualidad Jurídica', path: '/actualidad' });
    crumbs.push({ name: page.heading ?? page.title.split(' | ')[0], path: page.path });
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.name,
        item: url(c.path),
      })),
    });
  }
  if (page.kind === 'landing' || page.kind === 'area' || page.kind === 'service') {
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: page.heading,
      serviceType: page.heading,
      description: page.description,
      url: url(page.path),
      provider: { '@id': orgId },
      areaServed: { '@type': 'Country', name: 'Colombia' },
    });
  }
  return blocks.map(jsonLd).join('\n    ');
}

/**
 * Resumen de la página dentro de #root para buscadores y vistas previas que no ejecutan
 * JavaScript (título, descripción y enlaces a los servicios). React lo reemplaza al cargar;
 * mientras tanto queda oculto a la vista (sr-only) para que no se vea un salto.
 */
function staticBody(page, content) {
  const link = (href, text) => `<li><a href="${escapeAttr(href)}">${escapeHtml(text)}</a></li>`;
  const links = [
    link('/', 'Inicio'),
    ...content.landings.map((l) => link(`/${l.slug}`, l.title)),
    ...content.services.items.map((i) => link(`/servicios/${i.slug}`, i.title)),
    link('/nosotros', 'Nosotros'),
    link('/actualidad', 'Actualidad Jurídica'),
    link('/contacto', 'Contacto'),
  ];
  return [
    '<div id="root"><div class="sr-only">',
    `<h1>${escapeHtml(page.heading ?? page.title.split(' | ')[0])}</h1>`,
    `<p>${escapeHtml(page.description)}</p>`,
    `<nav aria-label="${escapeAttr(content.site.brand.legalName)}"><ul>${links.join('')}</ul></nav>`,
    '</div></div>',
  ].join('');
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

  if (!template.includes('<div id="root"></div>'))
    throw new Error('index.html no tiene <div id="root"></div>');
  // Para las migas de pan de cada servicio: el nombre de su área.
  for (const page of pages) {
    if (page.kind !== 'service') continue;
    const areaSlug = page.path.split('/')[2];
    page.areaTitle = content.services.items.find((i) => i.slug === areaSlug)?.title;
  }

  for (const page of pages) {
    const file = outputFile(page.path);
    await mkdir(path.dirname(file), { recursive: true });
    const head = `${seoBlock(page, site, absoluteUrl)}
    ${structuredData(page, content, absoluteUrl)}`;
    const html = template
      .replace(marker, head)
      .replace('<div id="root"></div>', staticBody(page, content));
    await writeFile(file, html);
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
