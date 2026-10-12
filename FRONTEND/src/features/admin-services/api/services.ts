import type {
  AdminAreasSave,
  AdminLandingInput,
  AdminSaveResult,
  AdminServicesResponse,
  LandingContent,
  MediaItem,
  MediaUpload,
  ServicesContent,
} from '@orion-lex/shared';
import { apiRequest } from '@/lib/api-client';

export const fetchServices = () => apiRequest<AdminServicesResponse>('/admin/services');

const put = (body: unknown) => ({ method: 'PUT', body: JSON.stringify(body) });

/** Guarda la lista completa de categorías (áreas) con sus servicios. */
export const saveAreas = (data: AdminAreasSave) =>
  apiRequest<AdminSaveResult & { items: ServicesContent['items'] }>('/admin/areas', put(data));

/** Crea (originalSlug null) o edita un asunto frecuente. */
export function saveLanding({
  originalSlug,
  landing,
}: {
  originalSlug: string | null;
  landing: AdminLandingInput;
}) {
  type Response = AdminSaveResult & { landing: LandingContent };
  return originalSlug
    ? apiRequest<Response>(`/admin/landings/${encodeURIComponent(originalSlug)}`, put({ landing }))
    : apiRequest<Response>('/admin/landings', {
        method: 'POST',
        body: JSON.stringify({ landing }),
      });
}

export const deleteLanding = (slug: string) =>
  apiRequest<AdminSaveResult>(`/admin/landings/${encodeURIComponent(slug)}`, { method: 'DELETE' });

export const reorderLandings = (order: string[]) =>
  apiRequest<AdminSaveResult>('/admin/landing-order', put({ order }));

/** Imágenes de la biblioteca, para elegir la foto de una categoría, servicio o asunto. */
export const fetchImageChoices = async () =>
  (await apiRequest<{ items: MediaItem[] }>('/admin/media')).items;

export const uploadImage = (data: MediaUpload) =>
  apiRequest<AdminSaveResult & { src: string }>('/admin/media', {
    method: 'POST',
    body: JSON.stringify(data),
  });
