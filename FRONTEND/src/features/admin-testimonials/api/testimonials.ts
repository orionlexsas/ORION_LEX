import type {
  AdminSaveResult,
  AdminTestimonialsResponse,
  AdminTestimonialsSave,
} from '@orion-lex/shared';
import { apiRequest } from '@/lib/api-client';

export const fetchTestimonials = () => apiRequest<AdminTestimonialsResponse>('/admin/testimonials');

/** Guarda la lista completa de testimonios, en el orden en que se muestran en la web. */
export const saveTestimonials = (data: AdminTestimonialsSave) =>
  apiRequest<AdminSaveResult & AdminTestimonialsResponse>('/admin/testimonials', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
