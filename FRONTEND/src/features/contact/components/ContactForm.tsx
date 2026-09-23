import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactRequestSchema, type ContactRequest } from '@orion-lex/shared';
import { Button } from '@/components/ui/Button';
import { useSendContact } from '../hooks/use-send-contact';

const inputClass =
  'w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none focus:border-gold';

/** Formulario de contacto. Usa el mismo esquema de validación que el backend. */
export function ContactForm() {
  const sendContact = useSendContact();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactRequest>({ resolver: zodResolver(contactRequestSchema) });

  const onSubmit = handleSubmit((data) => sendContact.mutate(data, { onSuccess: () => reset() }));

  if (sendContact.isSuccess) {
    return <p role="status">Gracias. Te contactaremos pronto.</p>;
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4">
      <label className="grid gap-1">
        <span className="text-sm">Nombre completo</span>
        <input className={inputClass} autoComplete="name" {...register('fullName')} />
        {errors.fullName && <span className="text-sm text-danger">{errors.fullName.message}</span>}
      </label>
      <label className="grid gap-1">
        <span className="text-sm">Correo</span>
        <input className={inputClass} type="email" autoComplete="email" {...register('email')} />
        {errors.email && <span className="text-sm text-danger">{errors.email.message}</span>}
      </label>
      <label className="grid gap-1">
        <span className="text-sm">Mensaje</span>
        <textarea className={inputClass} rows={5} {...register('message')} />
        {errors.message && <span className="text-sm text-danger">{errors.message.message}</span>}
      </label>
      {sendContact.isError && (
        <p role="alert" className="text-sm text-danger">
          {sendContact.error.message}
        </p>
      )}
      <Button type="submit" disabled={sendContact.isPending}>
        {sendContact.isPending ? 'Enviando…' : 'Enviar mensaje'}
      </Button>
    </form>
  );
}
