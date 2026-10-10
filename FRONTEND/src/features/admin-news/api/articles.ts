import type {
  AdminArticle,
  AdminArticleSave,
  AdminArticlesResponse,
  AdminSaveResult,
  MediaItem,
} from '@orion-lex/shared';
import { apiRequest } from '@/lib/api-client';

export const fetchArticles = () => apiRequest<AdminArticlesResponse>('/admin/articles');

type SaveResponse = AdminSaveResult & { article: AdminArticle };

/** Crea la noticia (`originalSlug` null) o actualiza la existente. */
export function saveArticle({
  originalSlug,
  data,
}: {
  originalSlug: string | null;
  data: AdminArticleSave;
}) {
  return originalSlug
    ? apiRequest<SaveResponse>(`/admin/articles/${encodeURIComponent(originalSlug)}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    : apiRequest<SaveResponse>('/admin/articles', { method: 'POST', body: JSON.stringify(data) });
}

export const deleteArticle = (slug: string) =>
  apiRequest<AdminSaveResult>(`/admin/articles/${encodeURIComponent(slug)}`, { method: 'DELETE' });

/** Imágenes de la biblioteca, para elegir la imagen destacada. */
export const fetchImageChoices = async () =>
  (await apiRequest<{ items: MediaItem[] }>('/admin/media')).items;
