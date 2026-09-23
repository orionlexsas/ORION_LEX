import type { ReactNode } from 'react';
import { useForm, type FieldError } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  contactErrorCodes,
  contactRequestSchema,
  type ContactErrorCode,
  type ContactRequest,
} from '@orion-lex/shared';
import { Button } from '@/components/ui/Button';
import { useSendContact } from '../hooks/use-send-contact';

const inputClass =
  'w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none focus:border-gold';

const isErrorCode = (value: unknown): value is ContactErrorCode =>
  contactErrorCodes.includes(value as ContactErrorCode);

/** Formulario de contacto. Usa el mismo esquema de validación que el backend. */
export function ContactForm() {
  const { t } = useTranslation();
  const sendContact = useSendContact();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactRequest>({ resolver: zodResolver(contactRequestSchema) });

  const onSubmit = handleSubmit((data) => sendContact.mutate(data, { onSuccess: () => reset() }));

  // El esquema devuelve códigos (p. ej. "emailInvalid"); aquí se traducen al idioma activo.
  const errorText = (error?: FieldError) =>
    error && (isErrorCode(error.message) ? t(`contact.errors.${error.message}`) : error.message);

  if (sendContact.isSuccess) {
    return <p role="status">{t('contact.success')}</p>;
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4">
      <Field label={t('contact.fields.fullName')} error={errorText(errors.fullName)}>
        <input className={inputClass} autoComplete="name" {...register('fullName')} />
      </Field>
      <Field label={t('contact.fields.email')} error={errorText(errors.email)}>
        <input className={inputClass} type="email" autoComplete="email" {...register('email')} />
      </Field>
      <Field label={t('contact.fields.message')} error={errorText(errors.message)}>
        <textarea className={inputClass} rows={5} {...register('message')} />
      </Field>
      {sendContact.isError && (
        <p role="alert" className="text-sm text-danger">
          {t('contact.errors.network')}
        </p>
      )}
      <Button type="submit" disabled={sendContact.isPending}>
        {sendContact.isPending ? t('contact.sending') : t('contact.send')}
      </Button>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="grid gap-1">
      <span className="text-sm">{label}</span>
      {children}
      {error && <span className="text-sm text-danger">{error}</span>}
    </label>
  );
}
