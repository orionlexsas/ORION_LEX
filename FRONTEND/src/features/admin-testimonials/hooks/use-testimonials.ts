import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchTestimonials, saveTestimonials } from '../api/testimonials';

export function useTestimonials() {
  return useQuery({ queryKey: ['admin', 'testimonials'], queryFn: fetchTestimonials });
}

/** Tras guardar se refresca el panel (testimonios e historial del resumen). */
export function useSaveTestimonials() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveTestimonials,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['admin'],
        predicate: (q) => q.queryKey[1] !== 'session',
      }),
  });
}
