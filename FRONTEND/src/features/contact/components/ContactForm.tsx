import { useState, type ReactNode } from 'react';
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
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon';
import { useContent } from '@/content';
import { whatsappUrl } from '@/lib/whatsapp';

const inputClass =
  'w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none focus:border-gold';

const isErrorCode = (value: unknown): value is ContactErrorCode =>
  contactErrorCodes.includes(value as ContactErrorCode);

/**
 * Formulario de contacto. Usa el mismo esquema de validación que el backend.
 * Por ahora no guarda nada: abre WhatsApp con el mensaje ya escrito (el sitio publicado
 * aún no tiene base de datos). Para volver a enviarlo a la API, ver `BACKEND/src/modules/contact`.
 */
export function ContactForm() {
  const { t } = useTranslation();
  const { site } = useContent();
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactRequest>({ resolver: zodResolver(contactRequestSchema) });

  const onSubmit = handleSubmit((data) => {
    const text = t('contact.whatsappMessage', data);
    window.open(whatsappUrl(site.contact.whatsapp.number, text), '_blank', 'noopener,noreferrer');
    reset();
    setSent(true);
  });

  // El esquema devuelve códigos (p. ej. "emailInvalid"); aquí se traducen al idioma activo.
  const errorText = (error?: FieldError) =>
    error && (isErrorCode(error.message) ? t(`contact.errors.${error.message}`) : error.message);

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
      {sent && <p role="status">{t('contact.success')}</p>}
      <Button type="submit">
        <WhatsAppIcon className="size-5 shrink-0" />
        {t('contact.send')}
        <span className="sr-only"> {t('a11y.opensWhatsApp')}</span>
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
