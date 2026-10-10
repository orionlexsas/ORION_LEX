import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteMedia,
  fetchImageTexts,
  fetchMedia,
  replaceMedia,
  saveImageTexts,
  uploadMedia,
} from '../api/media';

export function useMedia() {
  return useQuery({ queryKey: ['admin', 'media'], queryFn: fetchMedia });
}

/** Tras cualquier cambio se refresca todo el panel (imágenes, resumen, noticias). */
function useInvalidateAdmin() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({
      queryKey: ['admin'],
      predicate: (q) => q.queryKey[1] !== 'session',
    });
}

export function useUploadMedia() {
  const invalidate = useInvalidateAdmin();
  return useMutation({ mutationFn: uploadMedia, onSuccess: invalidate });
}

export function useReplaceMedia() {
  const invalidate = useInvalidateAdmin();
  return useMutation({ mutationFn: replaceMedia, onSuccess: invalidate });
}

export function useDeleteMedia() {
  const invalidate = useInvalidateAdmin();
  return useMutation({ mutationFn: deleteMedia, onSuccess: invalidate });
}

export function useImageTexts(src: string) {
  return useQuery({ queryKey: ['admin', 'media-texts', src], queryFn: () => fetchImageTexts(src) });
}

export function useSaveImageTexts() {
  const invalidate = useInvalidateAdmin();
  return useMutation({ mutationFn: saveImageTexts, onSuccess: invalidate });
}
