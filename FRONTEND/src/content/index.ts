import { useTranslation } from 'react-i18next';
import {
  approachContentSchema,
  clientsContentSchema,
  faqContentSchema,
  homeContentSchema,
  locationsContentSchema,
  servicesContentSchema,
  siteContentSchema,
} from '@orion-lex/shared';
import { defaultLanguage, supportedLanguages, type Language } from '@/i18n';
import enApproach from './en/approach.json';
import enClients from './en/clients.json';
import enFaq from './en/faq.json';
import enHome from './en/home.json';
import enLocations from './en/locations.json';
import enServices from './en/services.json';
import enSite from './en/site.json';
import esApproach from './es/approach.json';
import esClients from './es/clients.json';
import esFaq from './es/faq.json';
import esHome from './es/home.json';
import esLocations from './es/locations.json';
import esServices from './es/services.json';
import esSite from './es/site.json';

/*
 * Contenido editable de la web (textos e imágenes), un JSON por idioma en content/<idioma>/.
 * Se valida al cargar: si a un JSON le falta un campo, el error aparece de inmediato.
 * Cuando exista el panel de administración, solo cambia este archivo (se leerá desde la API).
 */
function parseContent(
  raw: Record<'site' | 'home' | 'approach' | 'clients' | 'locations' | 'faq' | 'services', unknown>,
) {
  return {
    site: siteContentSchema.parse(raw.site),
    home: homeContentSchema.parse(raw.home),
    approach: approachContentSchema.parse(raw.approach),
    clients: clientsContentSchema.parse(raw.clients),
    locations: locationsContentSchema.parse(raw.locations),
    faq: faqContentSchema.parse(raw.faq),
    services: servicesContentSchema.parse(raw.services),
  };
}

export type SiteContentBundle = ReturnType<typeof parseContent>;

const contentByLanguage: Record<Language, SiteContentBundle> = {
  es: parseContent({
    site: esSite,
    home: esHome,
    approach: esApproach,
    clients: esClients,
    locations: esLocations,
    faq: esFaq,
    services: esServices,
  }),
  en: parseContent({
    site: enSite,
    home: enHome,
    approach: enApproach,
    clients: enClients,
    locations: enLocations,
    faq: enFaq,
    services: enServices,
  }),
};

/** Contenido en el idioma activo; se actualiza solo al cambiar de idioma. */
export function useContent(): SiteContentBundle {
  const { i18n } = useTranslation();
  const language = supportedLanguages.find((l) => l === i18n.resolvedLanguage) ?? defaultLanguage;
  return contentByLanguage[language];
}
