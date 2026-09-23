# Arquitectura de Orion Lex

Web del despacho (informativa + formulario de contacto) y panel de administración.

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
    ├── auth/               (pendiente) login del panel
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
├── lib/                    api-client (único fetch), cn()
├── styles/globals.css      tokens de diseño (@theme de Tailwind)
├── components/
│   ├── ui/                 piezas del sistema de diseño (Button, Input…) — sin lógica de negocio
│   └── layout/             SiteLayout, SiteHeader, SiteFooter (web pública), AdminLayout (panel)
├── features/               una carpeta por funcionalidad
│   ├── contact/            referencia: api/ · hooks/ · components/ · index.ts
│   ├── home/               portada (HeroSection…)
│   ├── approach/           "Nuestro enfoque": pasos del proceso (en la portada)
│   ├── clients/            "Nuestros clientes": carrusel 3D con paso automático
│   ├── locations/          "Dónde te atendemos": mapa animado con ciudades (posiciones en % en el JSON)
│   ├── faq/                "Preguntas frecuentes" (acordeón + datos schema.org para Google), antes del pie
│   ├── services/           servicios (tarjetas y encabezado), página /servicios
│   ├── team/ · blog/                           (pendientes, web pública)
│   └── auth/ · admin-messages/                  (pendientes, panel)
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

| Qué                            | Dónde                                                 | Validado con        |
| ------------------------------ | ----------------------------------------------------- | ------------------- |
| Textos de la web (menú, hero…) | `FRONTEND/src/content/<es                             | en>/*.json`         | `SHARED/src/schemas/content.schema.ts` |
| Imágenes                       | `FRONTEND/public/images/` (WebP optimizado)           | —                   |
| Mensajes del formulario        | `BACKEND/data/contact-messages.json` (no se versiona) | `contact.schema.ts` |

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
  aplica antes de pintar. El tema claro redefine los tokens en `globals.css` (`:root[data-theme='light']`).
  - `light:` es una variante para ajustes puntuales. La portada usa `hero.image.light` en tema claro.

## Intro, WhatsApp y botones flotantes

- **Video de intro** (`components/layout/IntroCurtain.tsx`, video en `site.intro.video`): una vez por
  visita (sessionStorage), no aparece con movimiento reducido y se puede saltar. `index.html` decide
  antes de pintar y pone una cortina estática para que no se vea la web un instante; tiene un seguro de
  8 s por si la app no arranca. Al terminar, el bloque sube como telón y arrancan las animaciones.
- **WhatsApp**: en el contenido, `href: "whatsapp"` convierte un botón en enlace a WhatsApp con el
  número y mensaje de `site.contact.whatsapp` (un solo lugar para cambiarlo). Lo resuelve `CtaLink`.
- **Botones flotantes** (`FloatingActions`): WhatsApp siempre visible y "volver arriba" tras bajar una pantalla.
- `content/content.test.ts` valida todos los JSON de contenido en ambos idiomas.

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
