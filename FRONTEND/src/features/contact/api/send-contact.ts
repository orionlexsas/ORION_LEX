import type { ContactRequest } from '@orion-lex/shared';
import { apiRequest } from '@/lib/api-client';

export interface ContactResponse {
  id: string;
  createdAt: string;
}

/**
 * Envía el formulario. `website` es un campo trampa invisible: las personas lo dejan vacío
 * y muchos robots lo llenan; el servidor descarta esos envíos.
 */
export function sendContact(data: ContactRequest & { website?: string }) {
  return apiRequest<ContactResponse>('/contact', { method: 'POST', body: JSON.stringify(data) });
}
