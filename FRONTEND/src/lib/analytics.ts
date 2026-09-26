import { env } from '@/config/env';

/*
 * Analítica centralizada: Google Tag Manager, Google Analytics 4 y Meta Pixel.
 * Los IDs vienen de variables de entorno (config/env.ts); si faltan, no se carga nada y
 * `track` no hace nada. Los componentes solo llaman a `track('evento', { ... })`.
 */

/** Eventos de conversión que envía la web. */
export type AnalyticsEvent =
  | 'whatsapp_click'
  | 'contact_form_submit'
  | 'service_card_click'
  | 'landing_cta_click'
  | 'hero_services_click'
  /** Llamados de cada landing (datacredito_lead, comparendos_lead…), definidos en su JSON. */
  | `${string}_lead`;

type Params = Record<string, string | number | undefined>;

type Fbq = ((...args: unknown[]) => void) & { queue?: unknown[]; loaded?: boolean };

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

/** Equivalencia con los eventos estándar de Meta (los que usan las campañas). */
const metaStandardEvents: Partial<Record<string, string>> = {
  whatsapp_click: 'Contact',
  contact_form_submit: 'Lead',
};

function loadScript(src: string) {
  const script = document.createElement('script');
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

let initialized = false;

/** Carga los scripts configurados. Se llama una vez al arrancar la app. */
export function initAnalytics() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  if (env.gtmId) {
    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    loadScript(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(env.gtmId)}`);
  }

  if (env.gaId) {
    window.dataLayer = window.dataLayer ?? [];
    window.gtag = function gtag() {
      // gtag necesita el objeto `arguments`, no un arreglo.
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
    window.gtag('js', new Date());
    // Las páginas vistas se envían a mano en cada cambio de ruta (es una SPA).
    window.gtag('config', env.gaId, { send_page_view: false });
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(env.gaId)}`);
  }

  if (env.metaPixelId) {
    const fbq: Fbq = (...args: unknown[]) => {
      fbq.queue!.push(args);
    };
    fbq.queue = [];
    fbq.loaded = true;
    window.fbq = window._fbq = fbq;
    loadScript('https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', env.metaPixelId);
  }
}

/** Página vista (se llama en cada cambio de ruta). */
export function trackPageView(path: string) {
  window.dataLayer?.push({ event: 'page_view', page_path: path });
  if (env.gaId) window.gtag?.('event', 'page_view', { page_path: path });
  window.fbq?.('track', 'PageView');
}

/** Envía un evento a las herramientas configuradas. Nunca lanza errores. */
export function track(event: AnalyticsEvent, params: Params = {}) {
  try {
    window.dataLayer?.push({ event, ...params });
    if (env.gaId) window.gtag?.('event', event, params);
    if (window.fbq) {
      const standard = metaStandardEvents[event] ?? (event.endsWith('_lead') ? 'Lead' : undefined);
      if (standard) window.fbq('track', standard, params);
      window.fbq('trackCustom', event, params);
    }
  } catch {
    // La analítica nunca debe romper un clic.
  }
}
