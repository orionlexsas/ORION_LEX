import { useQuery } from '@tanstack/react-query';
import { fetchActivity, fetchOverview } from '../api/overview';

export function useOverview() {
  return useQuery({ queryKey: ['admin', 'overview'], queryFn: fetchOverview, staleTime: 30_000 });
}

/** Historial completo; solo se pide al pulsar "Ver todas". */
export function useActivity(enabled: boolean) {
  return useQuery({ queryKey: ['admin', 'activity'], queryFn: fetchActivity, enabled });
}
