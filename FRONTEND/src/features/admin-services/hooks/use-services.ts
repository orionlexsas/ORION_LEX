import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteLanding,
  fetchImageChoices,
  fetchServices,
  reorderLandings,
  saveAreas,
  saveLanding,
  uploadImage,
} from '../api/services';

export function useServices() {
  return useQuery({ queryKey: ['admin', 'services'], queryFn: fetchServices });
}

/** Tras cualquier cambio se refresca todo el panel (servicios, imágenes, resumen). */
function useInvalidateAdmin() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({
      queryKey: ['admin'],
      predicate: (q) => q.queryKey[1] !== 'session',
    });
}

export function useSaveAreas() {
  const invalidate = useInvalidateAdmin();
  return useMutation({ mutationFn: saveAreas, onSuccess: invalidate });
}

export function useSaveLanding() {
  const invalidate = useInvalidateAdmin();
  return useMutation({ mutationFn: saveLanding, onSuccess: invalidate });
}

export function useDeleteLanding() {
  const invalidate = useInvalidateAdmin();
  return useMutation({ mutationFn: deleteLanding, onSuccess: invalidate });
}

export function useReorderLandings() {
  const invalidate = useInvalidateAdmin();
  return useMutation({ mutationFn: reorderLandings, onSuccess: invalidate });
}

export function useImageChoices(enabled: boolean) {
  return useQuery({ queryKey: ['admin', 'media'], queryFn: fetchImageChoices, enabled });
}

export function useUploadImage() {
  return useMutation({ mutationFn: uploadImage });
}
