# Orión Lex — Servicios jurídicos

Sitio web del despacho **Orión Lex** (Bogotá, Medellín y Bucaramanga): presentación de servicios,
contacto por WhatsApp y formulario, en español e inglés, con tema claro y oscuro.

## Qué incluye

**Páginas**

- **Inicio** (`/`): portada, "Nuestro enfoque", carrusel "Nuestros clientes", mapa "Dónde te
  atendemos" y "Preguntas frecuentes".
- **Servicios** (`/servicios`): cuadrícula con el servicio destacado y las áreas de práctica.
- **Contacto** (`/contacto`): formulario que guarda los mensajes (hoy en un archivo JSON local).

**En todo el sitio**

- Video de intro que sube como un telón (una vez por visita; se puede saltar).
- Botones "Agenda tu consulta" que abren WhatsApp con el mensaje ya escrito.
- Botones flotantes de WhatsApp y "volver arriba"; íconos de TikTok y Facebook en el pie.
- Idiomas **español / inglés** y tema **claro / oscuro** (claro por defecto); ambos se recuerdan.
- Accesible (teclado, lectores de pantalla, movimiento reducido) y adaptado a celular.

## Tecnología

| Parte      | Herramientas                                                              |
| ---------- | ------------------------------------------------------------------------- |
| `FRONTEND` | React 19, Vite, TypeScript, Tailwind CSS 4, React Router, react-i18next   |
| `BACKEND`  | Node 22, Express 5, TypeScript, Prisma 7 (PostgreSQL, listo para activar) |
| `SHARED`   | Esquemas Zod que validan los datos en frontend y backend                  |

## Cómo arrancar

Requisitos: **Node 22 o superior**.

```bash
npm install
cp BACKEND/.env.example BACKEND/.env
cp FRONTEND/.env.example FRONTEND/.env
npm run dev
```

- Web: http://localhost:5173
- API: http://localhost:4000/api/v1

No se necesita base de datos por ahora: los mensajes del formulario se guardan en
`BACKEND/data/contact-messages.json` (esta carpeta no se sube a GitHub porque contiene datos
personales).

## Comandos (desde esta carpeta)

| Comando             | Qué hace                                      |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | API y web en modo desarrollo                  |
| `npm run build`     | build de producción del backend y el frontend |
| `npm run typecheck` | revisa los tipos en los tres paquetes         |
| `npm run lint`      | ESLint                                        |
| `npm test`          | pruebas (incluye la validación del contenido) |
| `npm run format`    | formatea el código con Prettier               |

Antes de subir cambios: `npm run typecheck && npm run lint && npm test`.

## Cómo editar el contenido

Todos los textos, enlaces e imágenes están en JSON, uno por idioma:

```
FRONTEND/src/content/
├── es/   site · home · approach · clients · locations · faq · services
└── en/   (misma estructura, en inglés)
```

| Quiero cambiar…                       | Archivo                                          |
| ------------------------------------- | ------------------------------------------------ |
| Teléfono, correo, WhatsApp, redes     | `site.json` → `contact` y `social`               |
| Menú, pie de página, video de intro   | `site.json`                                      |
| Portada                               | `home.json`                                      |
| Servicios                             | `services.json`                                  |
| Preguntas frecuentes                  | `faq.json`                                       |
| Ciudades del mapa                     | `locations.json` (posiciones en % sobre el mapa) |
| Textos de botones y mensajes de error | `FRONTEND/src/i18n/locales/{es,en}.json`         |

- Un botón con `"href": "whatsapp"` abre WhatsApp con el número y mensaje de `site.json`.
- Una imagen puede tener versión para el tema claro con `"light": { "src": "…" }`.
- Las imágenes van en `FRONTEND/public/images/`, en formato WebP.
- Si un JSON queda mal escrito, `npm test` lo detecta y dice qué campo falla.

## Estructura

```
ORION_LEX/
├── SHARED/      esquemas y tipos compartidos
├── BACKEND/     API por módulos (routes → controller → service → repository)
├── FRONTEND/    web organizada por funcionalidades (features/)
└── docs/        ARCHITECTURE.md: reglas y convenciones del proyecto
```

Las reglas para mantener el código ordenado están en [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Pendiente antes de publicar

- [ ] Fotos en alta calidad: las de servicios, enfoque, clientes y pie son recortes provisionales.
- [ ] Páginas de **Privacidad** y **Términos**: exigidas por la Ley 1581 de 2012, porque el
      formulario recoge datos personales. El texto debe revisarlo el despacho.
- [ ] Revisar con el despacho las respuestas de preguntas frecuentes y las traducciones al inglés.
- [ ] Confirmar la atención presencial en Bogotá, Medellín y Bucaramanga (la portada y el pie
      mencionan solo Bogotá).
- [ ] Secciones "Nosotros" y "Casos" (el menú ya las enlaza) y páginas de detalle de cada servicio.
- [ ] Conectar PostgreSQL y el panel de administración.
- [ ] Dividir el JavaScript por páginas para que cargue más rápido.
