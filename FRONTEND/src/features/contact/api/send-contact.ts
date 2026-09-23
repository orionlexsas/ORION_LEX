import type { ContactRequest } from '@orion-lex/shared';
import { apiRequest } from '@/lib/api-client';

export interface ContactResponse {
  id: string;
  createdAt: string;
}

export function sendContact(data: ContactRequest) {
  return apiRequest<ContactResponse>('/contact', { method: 'POST', body: JSON.stringify(data) });
}
