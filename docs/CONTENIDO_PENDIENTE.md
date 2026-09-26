# Contenido pendiente y configuración de Orión Lex

Todo el contenido está en `FRONTEND/src/content/<idioma>/` (`es` y `en`, misma estructura).
Los textos que aún no están aprobados llevan `"status": "provisional"` en su JSON. Para
encontrarlos: buscar `"provisional"` en esa carpeta.

> Después de cambiar un JSON: `npm test` desde `ORION_LEX/` avisa si algo quedó mal escrito.

## 1. Pendiente de información del despacho

| Qué                                                                                              | Dónde se cambia                                                                                                   | Estado hoy                                                                                                                                |
| ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Perfiles reales del equipo (nombre, profesión, especialidad, biografía, foto)                    | `team.json` → `members`                                                                                           | 2 tarjetas "Nombre por confirmar" con recortes de la foto de portada                                                                      |
| Reseñas de clientes (3 por landing: foto, nombre, texto)                                         | `landings/eliminacion-reportes-datacredito.json` y `landings/eliminacion-comparendos.json` → `testimonials.items` | Vacío: la sección **no se ve** en la web publicada (en local se ven 3 recuadros "Reseña pendiente")                                       |
| Cifras "Más de 1000 reportes / comparendos eliminados"                                           | mismas landings → `stats.value`                                                                                   | Publicadas tal como vienen en los documentos. Para quitarlas: borrar el bloque `stats`                                                    |
| "Tasa de éxito del 90 %" (FAQ de Datacrédito)                                                    | `landings/eliminacion-reportes-datacredito.json` → `faq`                                                          | Publicada tal como viene en el documento (ver nota legal abajo)                                                                           |
| Garantía de devolución del 100 % (Comparendos)                                                   | `landings/eliminacion-comparendos.json` → `guarantee` y 2 preguntas del `faq`                                     | Publicada tal como viene en el documento. Para quitarla: borrar `guarantee`                                                               |
| 4 landings sin contenido definitivo: Derechos de petición, Tutela, SOAT, Víctimas                | `landings/<slug>.json` (`status: "provisional"`)                                                                  | Texto general redactado por Claude, sin cifras, precios ni promesas. Debe revisarlo un abogado                                            |
| Explicaciones de las áreas del derecho (civil, laboral, familia, comercial, penal, conciliación) | `services.json` → `details`                                                                                       | Redactadas por Claude (`provisional`)                                                                                                     |
| Artículos iniciales de Actualidad Jurídica                                                       | `articles/<slug>.json`                                                                                            | 3 guías explicativas (`provisional`) redactadas por Claude a partir de la ley. Revisar antes de publicar; `"published": false` las oculta |
| Política de privacidad y términos                                                                | `legal.json`                                                                                                      | Aviso "en preparación". El texto definitivo lo debe aprobar el despacho (Ley 1581 de 2012)                                                |
| Instagram                                                                                        | `site.json` → `social` (agregar `{ "network": "instagram", "url": "…" }`)                                         | No se muestra hasta que exista                                                                                                            |
| Fotos de los 6 servicios                                                                         | ver sección 3                                                                                                     | Panel negro con ícono mientras no haya foto                                                                                               |
| Traducciones al inglés                                                                           | `content/en/`                                                                                                     | Redactadas por Claude; revisar                                                                                                            |

**Nota legal (para que la decida el despacho):** el Código Disciplinario del Abogado (Ley 1123 de 2007) limita la publicidad de los servicios de abogados. Conviene que un abogado confirme si las
cifras de casos, la tasa de éxito y la garantía de devolución pueden publicarse así.

## 2. Configuración técnica pendiente

| Qué                                           | Dónde                                                            | Cómo                                                                                                                       |
| --------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Contraseña del correo** para el formulario  | Vercel → proyecto `orion-lex` → Settings → Environment Variables | `SMTP_USER=abogados@orionlex.co` y `SMTP_PASS=<contraseña>` (Production y Preview). La pone el usuario; nunca en el código |
| Google Tag Manager / Analytics 4              | Vercel → Environment Variables                                   | `VITE_GTM_ID` o `VITE_GA_ID` (ver `FRONTEND/.env.example`)                                                                 |
| Meta Pixel (anuncios de Facebook e Instagram) | Vercel → Environment Variables                                   | `VITE_META_PIXEL_ID`                                                                                                       |

Eventos que ya envía la web (se ven en GTM/GA4/Meta cuando haya IDs):
`whatsapp_click` (con `location`), `contact_form_submit`, `service_card_click`,
`landing_cta_click` y uno por landing: `datacredito_lead`, `comparendos_lead`, `peticion_lead`,
`tutela_lead`, `soat_lead`, `victimas_lead`. En Meta, WhatsApp cuenta como `Contact` y los
`*_lead` y el formulario como `Lead`.

## 3. Fotos de los 6 servicios (prompts para ChatGPT)

Tamaño sugerido: **1536 × 1024 (horizontal)**, con el motivo principal en el centro: la misma
foto se recorta como tarjeta (horizontal) y como imagen de la landing (vertical en computador).

Estilo común (pegar al inicio de cada prompt):

> Fotografía editorial realista para la web de una firma de abogados colombiana. Luz natural
> suave, composición limpia y sobria, mucho espacio negativo, tonos neutros (blanco, negro,
> gris cálido, madera) con un único detalle en naranja #F57C00. Sin texto, sin logotipos, sin
> marcas de agua, sin rostros reconocibles. Estilo fotográfico, no ilustración.

1. **Eliminación de reportes en Datacrédito** — Manos de una persona revisando en un portátil un
   informe de historial crediticio con gráficas, junto a una tarjeta de crédito y documentos
   impresos sobre un escritorio de madera; una libreta naranja como detalle.
2. **Eliminación de comparendos** — Interior de un automóvil particular: una notificación de
   multa de tránsito en papel sobre el tablero, llaves del carro y, al fondo desenfocado, una
   calle de ciudad colombiana; detalle naranja en un cono de tránsito lejano.
3. **Derechos de petición** — Manos firmando una carta formal sobre un escritorio, con un sello
   de radicado, sobres y una pluma; carpeta naranja cerrada a un lado.
4. **Acciones de tutela** — Mazo de juez y un ejemplar de la Constitución Política de Colombia
   sobre un escritorio de madera oscura, luz lateral cálida; marcador de página naranja.
5. **Indemnización ante el SOAT** — Documentos de una póliza de seguro y una carpeta médica sobre
   una mesa, junto a un casco de motocicleta y unas llaves; ambiente sereno, no dramático, sin
   heridos ni sangre; detalle naranja en el casco.
6. **Asesoría a víctimas del conflicto armado** — Manos entrelazadas de una familia (adulto y
   persona mayor) sobre una mesa de madera sencilla, con documentos al lado; luz cálida,
   tono respetuoso y esperanzador, sin elementos violentos; bufanda o tela naranja discreta.

**Cómo ponerlas:** guardarlas en `FRONTEND/public/images/servicios-frecuentes/` con el nombre de
la landing (p. ej. `eliminacion-comparendos.jpg`) y pedirle a Claude que las optimice a WebP y
las agregue en `image` de cada `landings/<slug>.json` (en `es` y `en`).

## 4. Otros avisos

- **Video de intro:** muestra una versión antigua del logo (escudo azul con estrellas doradas),
  distinta del logo oficial. Hoy solo aparece la primera vez en la portada y se puede saltar.
  Recomendado: rehacerlo con el logo oficial o quitarlo (`site.json` → borrar `intro`).
- **Administrar el blog sin tocar código:** hoy los artículos son archivos JSON. Opción
  recomendada cuando se necesite: Decap CMS (gratuito, guarda en GitHub, panel en `/admin`,
  requiere configurar el inicio de sesión con GitHub). No se instaló para no agregar
  complejidad sin que se pidiera.
- **Límite de envíos del formulario:** la función de Vercel descarta robots con un campo trampa.
  Si llegara spam, agregar un captcha (p. ej. Cloudflare Turnstile).
