import type { AdminActivity, AdminOverview } from '@orion-lex/shared';
import { apiRequest } from '@/lib/api-client';

export const fetchOverview = () => apiRequest<AdminOverview>('/admin/overview');

export const fetchActivity = async () =>
  (await apiRequest<{ items: AdminActivity[] }>('/admin/activity')).items;
