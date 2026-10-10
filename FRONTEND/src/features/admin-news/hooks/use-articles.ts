import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteArticle, fetchArticles, fetchImageChoices, saveArticle } from '../api/articles';

export function useArticles() {
  return useQuery({ queryKey: ['admin', 'articles'], queryFn: fetchArticles });
}

/** Tras cualquier cambio se refresca todo el panel (noticias, resumen, imágenes). */
function useInvalidateAdmin() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({
      queryKey: ['admin'],
      predicate: (q) => q.queryKey[1] !== 'session',
    });
}

export function useSaveArticle() {
  const invalidate = useInvalidateAdmin();
  return useMutation({ mutationFn: saveArticle, onSuccess: invalidate });
}

export function useDeleteArticle() {
  const invalidate = useInvalidateAdmin();
  return useMutation({ mutationFn: deleteArticle, onSuccess: invalidate });
}

export function useImageChoices(enabled: boolean) {
  return useQuery({ queryKey: ['admin', 'media'], queryFn: fetchImageChoices, enabled });
}
