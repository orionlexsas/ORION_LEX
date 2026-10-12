import type {
  AdminSaveResult,
  ImageTextBlock,
  ImageTextsSave,
  MediaItem,
  MediaReplace,
  MediaUpload,
} from '@orion-lex/shared';
import { apiRequest } from '@/lib/api-client';

export const fetchMedia = async () =>
  (await apiRequest<{ items: MediaItem[] }>('/admin/media')).items;

export const uploadMedia = (data: MediaUpload) =>
  apiRequest<AdminSaveResult & { src: string }>('/admin/media', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const replaceMedia = (data: MediaReplace) =>
  apiRequest<AdminSaveResult & { src: string }>('/admin/media', {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteMedia = (src: string) =>
  apiRequest<AdminSaveResult>(`/admin/media?src=${encodeURIComponent(src)}`, { method: 'DELETE' });

/** Textos que acompañan a la imagen en la web (banner, tarjeta, perfil…). */
export const fetchImageTexts = async (src: string) =>
  (
    await apiRequest<{ blocks: ImageTextBlock[] }>(
      `/admin/media/texts?src=${encodeURIComponent(src)}`,
    )
  ).blocks;

export const saveImageTexts = (data: ImageTextsSave) =>
  apiRequest<AdminSaveResult>('/admin/media/texts', { method: 'PUT', body: JSON.stringify(data) });
