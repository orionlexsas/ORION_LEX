import type { LandingContent, PracticeService, ServiceItem } from '@orion-lex/shared';

/** Valores iniciales al crear una categoría, un servicio o un asunto frecuente. */

export const newArea = (): ServiceItem => ({
  slug: '',
  status: 'final',
  featured: false,
  icon: 'scale',
  title: '',
  description: '',
  details: '',
  message: '',
  image: { src: '', alt: '' },
  services: [],
});

export const newService = (): PracticeService => ({
  slug: '',
  status: 'final',
  title: '',
  description: '',
  body: '',
  message: '',
});

export type LandingDraft = Omit<LandingContent, 'status'>;

export const newLanding = (): LandingDraft => ({
  slug: '',
  title: '',
  seo: { title: '', description: '' },
  leadEvent: 'servicio_lead',
  icon: 'scale',
  cta: { label: 'Solicitar asesoría', message: '' },
  hero: { eyebrow: '', lead: '', paragraphs: [''] },
  closing: { title: '', text: '' },
});

/** Mensaje de WhatsApp sugerido a partir del nombre. */
export const suggestedMessage = (title: string) =>
  title ? `Hola, vi la página de Orión Lex y quiero asesoría sobre ${title.toLowerCase()}.` : '';

/** Evento de analítica del botón de un asunto nuevo: "pension-de-vejez" → "pension_lead". */
export const leadEventFor = (slug: string): `${string}_lead` =>
  `${slug.split('-')[0]?.replace(/[^a-z]/g, '') || 'servicio'}_lead`;
