import { homeContentSchema, servicesContentSchema, siteContentSchema } from '@orion-lex/shared';
import siteJson from './site.json';
import homeJson from './home.json';
import servicesJson from './services.json';

/*
 * Contenido editable de la web (textos e imágenes), guardado en JSON por ahora.
 * Se valida al cargar: si a un JSON le falta un campo, el error aparece de inmediato.
 * Cuando exista el panel de administración, solo cambia este archivo (se leerá desde la API).
 */
export const siteContent = siteContentSchema.parse(siteJson);
export const homeContent = homeContentSchema.parse(homeJson);
export const servicesContent = servicesContentSchema.parse(servicesJson);
