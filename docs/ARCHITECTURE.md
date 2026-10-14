# Arquitectura de Orion Lex

Web del despacho (portada, landings de servicios para anuncios, blog y contacto) y panel de administración.

## Visión general

```
ORION_LEX/                  monorepo con npm workspaces
├── SHARED/                 contratos compartidos (validaciones Zod + tipos)
├── BACKEND/                API REST: Node + Express 5 + Prisma 7 + PostgreSQL
├── FRONTEND/               web + panel: React 19 + Vite + Tailwind 4 + TanStack Query
└── docs/
```

El frontend y el backend **nunca** definen por separado la forma de un dato que viaja entre
ellos: el esquema vive en `SHARED` y ambos lo importan (`@orion-lex/shared`). Así una regla de
validación se cambia en un solo sitio.

## Backend — módulos por dominio, en capas

```
BACKEND/src/
├── server.ts               raíz de composición: crea dependencias reales y arranca
├── app.ts                  createApp(deps): monta middlewares y rutas (testeable)
├── config/env.ts           variables de entorno validadas con Zod
├── lib/                    infraestructura: prisma, logger (y futuro mailer)
├── middlewares/            validate-body, error-handler, (futuro) require-auth
├── utils/                  HttpError y utilidades puras
├── generated/prisma/       cliente Prisma generado (no editar, no se versiona)
└── modules/
    ├── health/
    ├── contact/            módulo de referencia (copiar este patrón)
    │   ├── contact.routes.ts       URL + middlewares
    │   ├── contact.controller.ts   HTTP ⇄ servicio
    │   ├── contact.service.ts      reglas de negocio
    │   ├── contact.repository.ts   acceso a base de datos
    │   └── contact.test.ts
    ├── auth/               (no se usa: el login del panel vive en FRONTEND/server/admin, ver "Panel")
    ├── practice-areas/     (pendiente) áreas de práctica editables
    ├── team/               (pendiente) abogados del despacho
    └── posts/              (pendiente) blog / noticias
```

**Flujo de una petición:** `routes → validateBody → controller → service → repository → Prisma`.

Reglas:

- Cada capa solo llama a la de abajo. El servicio no conoce `req`/`res`; el controlador no toca Prisma.
- Las dependencias se pasan por parámetro (`createXService(repo)`), no se importan como
  singletons. Por eso los tests usan servicios falsos sin base de datos.
- Errores esperados: `throw new HttpError(status, code, message)`. El `errorHandler` los
  convierte al formato `ApiError` de `SHARED`. Express 5 captura los errores async solo.
- Toda la API vive bajo `/api/v1`.

## Frontend — organizado por features

```
FRONTEND/src/
├── main.tsx
├── app/                    App, router, providers globales
├── config/env.ts           variables VITE_*
├── content/<idioma>/       textos e imágenes del sitio (es/, en/) → useContent()
├── i18n/                   idiomas: configuración de i18next y textos de interfaz (locales/)
├── lib/                    api-client (único fetch), analytics (GTM/GA4/Meta Pixel), whatsapp, cn()
├── seo/                    SEO por página (pages.ts) y useSeo()
├── styles/globals.css      tokens de diseño (@theme de Tailwind)
├── components/
│   ├── ui/                 piezas del sistema de diseño (Button, Input…) — sin lógica de negocio
│   └── layout/             SiteLayout, SiteHeader, SiteFooter (web pública), AdminLayout (panel)
├── features/               una carpeta por funcionalidad
│   ├── home/               portada (HeroSection)
│   ├── matters/            "Asuntos que atendemos con frecuencia" (6 tarjetas) y bloques de las landings
│   ├── approach/           "Cómo trabajamos": pasos del proceso
│   ├── services/           áreas del derecho (categorías) y sus servicios: /servicios/<área>/<servicio>
│   ├── team/               Nosotros: quién atiende el caso
│   ├── blog/               Actualidad Jurídica (listado, destacado de la semana, artículo)
│   ├── coverage/           cobertura nacional y en el exterior
│   ├── faq/                preguntas frecuentes (acordeón + datos schema.org para Google)
│   ├── contact/            formulario (api/ · hooks/ · components/) y sección de contacto
│   ├── auth/               panel: login, cierre de sesión y protección de /admin (AdminGate)
│   ├── admin-dashboard/    panel: cifras, últimas noticias y últimas acciones
│   ├── admin-news/         panel: gestión y editor de noticias (Actualidad Jurídica)
│   ├── admin-media/        panel: biblioteca de fotos y banners (y los textos que las acompañan)
│   ├── admin-services/     panel: categorías, servicios y asuntos frecuentes (con su URL editable)
│   └── admin-stats/        panel: estadísticas con gráficos (components/admin/charts.tsx)
├── pages/
│   ├── public/             páginas de la web (delgadas: componen features)
│   └── admin/              páginas del panel (se cargan en lazy)
├── hooks/                  hooks compartidos
└── assets/
```

Reglas:

- Una **page** solo compone features y layout; la lógica vive en la feature.
- Una feature se importa **solo desde su `index.ts`** (`@/features/contact`), nunca desde sus
  archivos internos. Las features no se importan entre sí; lo compartido sube a `components/`,
  `hooks/` o `lib/`.
- Llamadas al servidor: `features/x/api/*.ts` (usa `apiRequest`) → `features/x/hooks/*.ts`
  (TanStack Query) → componentes. Ningún componente hace `fetch` directo.
- Colores, fuentes y radios salen de los tokens de `globals.css`; no se escriben hex sueltos.
  Los tokens se reemplazarán con el sistema de diseño de Stitch.
- El panel `/admin` se carga en un chunk aparte para no pesarle a los visitantes.

## Contenido y datos locales (mientras no hay base de datos)

| Qué                                                | Dónde                                                                                  | Validado con                           |
| -------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------- |
| Textos por sección (menú, portada, áreas, equipo…) | `FRONTEND/src/content/<es\|en>/*.json`                                                 | `SHARED/src/schemas/content.schema.ts` |
| Landing pages (una por servicio)                   | `FRONTEND/src/content/<idioma>/landings/<slug>.json`                                   | `landingContentSchema`                 |
| Artículos de Actualidad Jurídica                   | `FRONTEND/src/content/<idioma>/articles/<slug>.json` (cuerpo en Markdown)              | `articleContentSchema`                 |
| Imágenes                                           | `FRONTEND/public/images/` y logo en `public/brand/` (WebP)                             | —                                      |
| Mensajes del formulario                            | Producción: correo a abogados@orionlex.co. Local: `BACKEND/data/contact-messages.json` | `contact.schema.ts`                    |

- Contenido sin aprobar: `"status": "provisional"`. Lista completa en `docs/CONTENIDO_PENDIENTE.md`.
- Las rutas de las landings salen de `matters.json` → `order` (mismos slugs en todos los idiomas).
- Para cambiar un texto se edita el JSON; si falta un campo, la web falla al cargar con el error exacto.
- Los componentes nunca importan los JSON directamente: pasan por `FRONTEND/src/content/index.ts`.
  Cuando exista el panel, ese archivo leerá de la API y nada más cambia.
- El backend guarda con `lib/json-file-store.ts` (escrituras en cola y atómicas). Para pasar a
  PostgreSQL se cambia `createJsonContactRepository` por `createPrismaContactRepository` en `server.ts`.

## Idiomas y tema

- **Idiomas** (react-i18next): español por defecto; inglés al elegirlo (se guarda) o con `?lang=en`.
  - Contenido del sitio: `content/es/*.json` y `content/en/*.json`, misma estructura. Se lee con `useContent()`.
  - Textos de interfaz (botones, errores, accesibilidad): `i18n/locales/{es,en}.json`, con tipos (`t('clave')`).
  - Los errores del formulario en `SHARED` son **códigos** (`emailInvalid`); el frontend los traduce.
  - Para añadir un idioma: agregarlo en `i18n/index.ts`, crear `locales/<idioma>.json` y `content/<idioma>/`.
- **Tema** claro/oscuro (`hooks/use-theme.ts`): claro por defecto; la elección se guarda. `index.html` lo
  aplica antes de pintar. El tema oscuro redefine los tokens en `globals.css` (`:root[data-theme='dark']`).
  - Colores del manual: negro, blanco y naranja `#F57C00` como acento (`accent`); texto naranja
    pequeño con `accent-text` (más oscuro en tema claro, contraste AA). Tipografías: Playfair Display
    (títulos) y Montserrat (textos).
  - `light:` y `dark:` son variantes para ajustes puntuales; una imagen puede tener versión `dark`.

## Intro, WhatsApp y botones flotantes

- **Video de intro** (`components/layout/IntroCurtain.tsx`, video en `site.intro.video`): solo en la
  portada y solo la primera visita (localStorage), máximo 8 s, botón "Saltar intro", no aparece con
  movimiento reducido y nunca en las landings (tráfico de anuncios). `index.html` decide antes de pintar.
- **WhatsApp**: en el contenido, `href: "whatsapp"` + `message` convierte un botón en enlace a WhatsApp
  con el número de `site.contact.whatsapp` (un solo lugar). Lo resuelve `CtaLink`, que además envía
  los eventos de analítica.
- **Vitrina de Servicios jurídicos** (`features/services/components/ServicesSection.tsx`, inspirada en el
  slider de PROYECT_ROSADO): foto grande del área activa con su nombre, explicación, botones y fila de
  tarjetas que se corren; avanza sola (se pausa con mouse, foco o toque), flechas, puntos numerados y swipe.
- **Carruseles en celular** (`hooks/use-carousel.ts` + `components/ui/CarouselNav.tsx`): bajo 640 px las
  cuadrículas de tarjetas de la portada (asuntos, proceso, servicios, equipo, actualidad) se deslizan de lado.
  Avanzan solas mientras están en pantalla hasta que la persona las toca; puntos y aviso "Desliza para ver más".
  Sin avance automático con "reducir movimiento".
- **Botones flotantes** (`FloatingActions`): WhatsApp (se aparta mientras otro botón de WhatsApp está
  en pantalla, para no tapar llamados en móvil) y "volver arriba".
- `content/content.test.ts` valida todos los JSON (secciones, landings y artículos) en ambos idiomas.

## Panel de administración (/admin)

Login en `/admin/login`; secciones: Dashboard, Noticias, Servicios, Fotos y banners, Estadísticas y Configuración. El panel se carga aparte (lazy) y sin analítica.

- **Sin base de datos:** el panel edita los mismos archivos que lee la web (`content/es/articles/*.json`
  y `public/images/<carpeta>/`). La API vive en `FRONTEND/server/admin/` (no depende de Vercel ni de
  Vite; probada en `handler.test.ts`) y guarda a través de un `ContentStore` intercambiable:
  - **Local** (`fs-store`): `vite.config.ts` atiende `/api/v1/admin/*` y escribe en el disco; Vite recarga
    la web. Historial en `FRONTEND/.admin-local/` (ignorado por git). En local nunca usa GitHub.
  - **Vercel** (`github-store`): `api/v1/admin.ts` (con la regla de `vercel.json`) hace un commit en `main`
    por cada cambio (mensajes `Panel: …`, que forman el historial). Vercel republica en 1–2 minutos.
- **Acceso:** una cuenta en variables de entorno (`ADMIN_EMAIL`, `ADMIN_NAME`, `ADMIN_ROLE`,
  `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET`; ver `FRONTEND/.env.example`). La contraseña se guarda
  como huella scrypt (`npm run admin:password -w FRONTEND -- "contraseña"`). Sesión firmada en cookie
  HttpOnly + SameSite=Strict: 12 h, o 30 días con "Recordarme". Máximo 10 intentos fallidos cada 15 min por IP.
- **Noticias:** se editan en español. Si existe la versión en inglés se le copian estado, fecha, categoría,
  imagen y URL; si no existe, la web en inglés muestra la española (`content/index.ts`). Solo una noticia
  puede estar destacada. Las fotos se convierten a WebP en el navegador antes de subirlas (`lib/image-file.ts`).
- **Textos de las fotos** (`server/admin/media-texts.ts`): se busca la imagen en los JSON en español; el
  objeto que la contiene (banner, tarjeta, perfil) es el bloque y sus textos de una lista fija (título,
  descripción, cargo…) y el `alt` se editan desde Fotos y banners. Se valida el archivo completo con su esquema.
- **Servicios** (`server/admin/services.ts`): las áreas de `services.json` son categorías y cada una tiene
  `services[]` (página en `/servicios/<área>/<servicio>`, rutas y prerender generados desde el contenido).
  Los asuntos frecuentes son las landings (`/<slug>`) en el orden de `matters.json` (igual en es y en). El
  panel edita el español; en inglés se usan el orden, fotos y URLs del español y la traducción si existe
  (`mergeServices` y landings en `content/index.ts`). Las URLs de asuntos no pueden chocar con rutas del
  sitio (`RESERVED_SLUGS`). Cada elemento muestra su URL completa con botón "Copiar enlace" para anuncios.
- **Estadísticas:** `GET /admin/stats` (noticias por mes y categoría, fotos por carpeta, actividad por día).
  Gráficos sin librerías, color `chart` (validado en ambos temas), con detalle al pasar el mouse y vista de tabla.
- **Imágenes:** una imagen en uso (su ruta aparece en algún JSON de contenido) no se puede borrar; al
  reemplazarla se mantienen ruta y formato, y cambia en todo el sitio. En Vercel el panel muestra las
  fotos con `/api/v1/admin/media/file?src=…&v=<sha>` (las trae de GitHub con el token y exige sesión),
  así funcionan aunque el repositorio sea privado y antes de que Vercel republique.
- **Repositorio privado + Vercel Hobby:** Vercel bloquea los despliegues cuyo autor no es `orionlexsas`.
  Los guardados del panel sí despliegan (los firma el token de esa cuenta).
- Datos que viajan entre panel y API: `SHARED/src/schemas/admin.schema.ts`.

## Producción (Vercel)

- **Formulario**: función de Vercel `FRONTEND/api/v1/contact.ts` (misma URL `/api/v1/contact`).
  La lógica está en `FRONTEND/server/contact.ts` (probada en `contact.test.ts`) y envía el correo por
  el SMTP de Hostinger (`SMTP_USER`, `SMTP_PASS` en Vercel). En local, `/api` va al backend Express.
  La función importa el esquema desde `SHARED/src/...` con rutas `.js` (no el paquete): Vercel no
  resuelve paquetes del monorepo escritos en TypeScript. Sigue siendo un único esquema.
- **SEO**: `src/seo/pages.ts` define título, descripción, canonical y Open Graph de cada página.
  `useSeo()` los aplica al navegar y `scripts/prerender.mjs` (después de `vite build`) escribe un HTML
  por página con esos datos, más `sitemap.xml` y `robots.txt`, para Google y las vistas previas de
  redes (que no ejecutan JavaScript). `vercel.json` usa `cleanUrls` para servirlos.
- **Analítica** (`lib/analytics.ts`): GTM, GA4 y Meta Pixel se cargan solo si existen
  `VITE_GTM_ID`, `VITE_GA_ID` o `VITE_META_PIXEL_ID`. Los componentes llaman `track('evento')`.
- Artículos, páginas legales y el formulario se cargan aparte (lazy) para aligerar la portada.

## Cómo añadir una funcionalidad nueva

1. Esquema del dato en `SHARED/src/schemas/x.schema.ts` y exportarlo en `SHARED/src/index.ts`.
2. Modelo en `BACKEND/prisma/schema.prisma` → `npm run db:migrate -w BACKEND`.
3. `BACKEND/src/modules/x/` copiando el patrón de `contact`, con su test; montarlo en `app.ts`
   y conectar sus dependencias en `server.ts`.
4. `FRONTEND/src/features/x/` (api → hooks → components → index.ts) y su page en el router.

## Comandos (desde `ORION_LEX/`)

| Comando             | Qué hace                                         |
| ------------------- | ------------------------------------------------ |
| `npm install`       | instala todo y genera el cliente Prisma          |
| `npm run dev`       | API en :4000 y web en :5173 (con proxy a `/api`) |
| `npm run typecheck` | revisa tipos en los tres paquetes                |
| `npm run lint`      | ESLint                                           |
| `npm test`          | pruebas (Vitest)                                 |
| `npm run build`     | build de producción del backend y el frontend    |
| `npm run format`    | formatea con Prettier                            |

Base de datos: PostgreSQL. Configurar `DATABASE_URL` en `BACKEND/.env` (ver `.env.example`)
y ejecutar `npm run db:migrate -w BACKEND`.
