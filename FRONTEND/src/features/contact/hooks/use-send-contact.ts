import { useMutation } from '@tanstack/react-query';
import { track } from '@/lib/analytics';
import { sendContact } from '../api/send-contact';

export function useSendContact() {
  return useMutation({
    mutationFn: sendContact,
    onSuccess: (_data, variables) =>
      track('contact_form_submit', { subject: variables.subject || 'sin_asunto' }),
  });
}
