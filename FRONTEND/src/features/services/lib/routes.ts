/** Página de un área del derecho. La ruta se genera con el mismo slug en app/router.tsx. */
export const practiceAreaHref = (slug: string) => `/servicios/${slug}`;

/** Página de un servicio dentro de un área: /servicios/<área>/<servicio>. */
export const serviceHref = (area: string, slug: string) => `/servicios/${area}/${slug}`;
