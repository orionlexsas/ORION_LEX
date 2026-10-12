import type { AdminLogin, AdminUser } from '@orion-lex/shared';
import { apiRequest } from '@/lib/api-client';

/** Usuario con sesión abierta, o null si no hay sesión. */
export async function fetchSession(): Promise<AdminUser | null> {
  return (await apiRequest<{ user: AdminUser | null }>('/admin/session')).user;
}

export async function login(data: AdminLogin): Promise<AdminUser> {
  return (
    await apiRequest<{ user: AdminUser }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  ).user;
}

export function logout() {
  return apiRequest<void>('/admin/logout', { method: 'POST' });
}
