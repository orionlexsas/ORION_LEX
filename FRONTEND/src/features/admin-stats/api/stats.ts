import type { AdminStats } from '@orion-lex/shared';
import { apiRequest } from '@/lib/api-client';

export const fetchStats = () => apiRequest<AdminStats>('/admin/stats');
