import { useEffect, type ReactNode } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { LoaderCircle } from 'lucide-react';
import type { AdminUser } from '@orion-lex/shared';
import { ApiRequestError } from '@/lib/api-client';
import { sessionKey, useAdminSession, useLogout } from '../hooks/use-session';

interface AdminGateProps {
  children: (user: AdminUser, logout: () => void) => ReactNode;
}

/**
 * Protege el panel: sin sesión lleva al login (y luego regresa a donde iba). Si la sesión
 * vence mientras se trabaja, cualquier respuesta 401 de la API devuelve al login.
 */
export function AdminGate({ children }: AdminGateProps) {
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  const session = useAdminSession();
  const logoutMutation = useLogout();

  useEffect(() => {
    const expired = (error: unknown) => error instanceof ApiRequestError && error.status === 401;
    const onEvent = (event: { type: string; action?: { type: string; error?: unknown } }) => {
      if (
        event.type === 'updated' &&
        event.action?.type === 'error' &&
        expired(event.action.error)
      ) {
        queryClient.setQueryData(sessionKey, null);
      }
    };
    const unsubscribeQueries = queryClient.getQueryCache().subscribe(onEvent);
    const unsubscribeMutations = queryClient.getMutationCache().subscribe(onEvent);
    return () => {
      unsubscribeQueries();
      unsubscribeMutations();
    };
  }, [queryClient]);

  if (session.isPending) {
    return (
      <div className="grid min-h-dvh place-items-center bg-surface" role="status">
        <LoaderCircle aria-hidden="true" className="size-8 animate-spin text-accent" />
        <span className="sr-only">Cargando el panel…</span>
      </div>
    );
  }

  if (!session.data) {
    return (
      <Navigate to="/admin/login" replace state={{ from: location.pathname + location.search }} />
    );
  }

  const logout = () =>
    logoutMutation.mutate(undefined, {
      onSettled: () => navigate('/admin/login', { replace: true }),
    });

  return children(session.data, logout);
}
