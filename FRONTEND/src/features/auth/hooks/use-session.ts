import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchSession, login, logout } from '../api/session';

/** Todo lo del panel cuelga de ['admin', …]: al cerrar sesión se borra de una vez. */
export const sessionKey = ['admin', 'session'] as const;

export function useAdminSession() {
  return useQuery({
    queryKey: sessionKey,
    queryFn: fetchSession,
    staleTime: 5 * 60_000,
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: login,
    onSuccess: (user) => queryClient.setQueryData(sessionKey, user),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      queryClient.removeQueries({ queryKey: ['admin'] });
      queryClient.setQueryData(sessionKey, null);
    },
  });
}
