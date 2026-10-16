import { TestimonialsManager } from '@/features/admin-testimonials';
import { useAdminDocument } from '@/hooks/use-admin-document';

export function TestimonialsAdminPage() {
  useAdminDocument('Testimonios');
  return <TestimonialsManager />;
}
