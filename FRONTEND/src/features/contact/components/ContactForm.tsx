import { useId, type ReactNode } from 'react';
import { Link } from 'react-router';
import { useForm, type FieldError } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { CircleCheck, LoaderCircle } from 'lucide-react';
import {
  contactErrorCodes,
  contactRequestSchema,
  type ContactErrorCode,
  type ContactRequest,
} from '@orion-lex/shared';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { useSendContact } from '../hooks/use-send-contact';

const inputClass =
  'w-full rounded-md border border-foreground/20 bg-background px-4 py-3 text-base outline-none transition-colors placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/25 aria-[invalid=true]:border-danger';

const isErrorCode = (value: unknown): value is ContactErrorCode =>
  contactErrorCodes.includes(value as ContactErrorCode);

interface ContactFormProps {
  /** Opciones del campo "Asunto" (servicios); se agrega "Otro asunto" al final. */
  subjects: string[];
}

/**
 * Formulario de contacto. Valida con el mismo esquema que el servidor y envía la consulta al
 * correo del despacho. Muestra "Enviando…", el error si falla y evita envíos dobles.
 */
export function ContactForm({ subjects }: ContactFormProps) {
  const { t } = useTranslation();
  const sendContact = useSendContact();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactRequest>({
    resolver: zodResolver(contactRequestSchema),
    defaultValues: { subject: '' },
  });

  const onSubmit = handleSubmit((data, event) => {
    // Evita un segundo envío mientras el primero está en curso.
    if (sendContact.isPending) return;
    const form = event?.target as HTMLFormElement | undefined;
    const website = form ? new FormData(form).get('website') : null;
    sendContact.mutate(
      { ...data, website: typeof website === 'string' ? website : undefined },
      { onSuccess: () => reset() },
    );
  });

  // El esquema devuelve códigos (p. ej. "emailInvalid"); aquí se traducen al idioma activo.
  const errorText = (error?: FieldError) =>
    error && (isErrorCode(error.message) ? t(`contact.errors.${error.message}`) : error.message);

  if (sendContact.isSuccess) {
    return (
      <div role="status" className="rounded-lg border border-success/40 bg-success/8 p-8">
        <CircleCheck className="size-10 text-success" aria-hidden="true" />
        <p className="mt-4 text-lg leading-relaxed font-medium">{t('contact.success')}</p>
        <button
          type="button"
          onClick={() => sendContact.reset()}
          className="mt-6 cursor-pointer text-sm font-semibold text-accent-text underline underline-offset-4"
        >
          {t('contact.sendAnother')}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5" aria-busy={sendContact.isPending}>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t('contact.fields.fullName')} error={errorText(errors.fullName)} required>
          {(props) => (
            <input
              {...props}
              className={inputClass}
              autoComplete="name"
              {...register('fullName')}
            />
          )}
        </Field>
        <Field label={t('contact.fields.phone')} error={errorText(errors.phone)} required>
          {(props) => (
            <input
              {...props}
              className={inputClass}
              type="tel"
              autoComplete="tel"
              {...register('phone')}
            />
          )}
        </Field>
      </div>
      <Field label={t('contact.fields.email')} error={errorText(errors.email)} required>
        {(props) => (
          <input
            {...props}
            className={inputClass}
            type="email"
            autoComplete="email"
            {...register('email')}
          />
        )}
      </Field>
      <Field label={t('contact.fields.subject')} error={errorText(errors.subject)}>
        {(props) => (
          <select {...props} className={cn(inputClass, 'cursor-pointer')} {...register('subject')}>
            <option value="">{t('contact.subjectPlaceholder')}</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
            <option value={t('contact.otherSubject')}>{t('contact.otherSubject')}</option>
          </select>
        )}
      </Field>
      <Field label={t('contact.fields.message')} error={errorText(errors.message)} required>
        {(props) => (
          <textarea {...props} className={inputClass} rows={5} {...register('message')} />
        )}
      </Field>

      {/* Campo trampa para robots: oculto a personas y lectores de pantalla. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div>
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
          <input
            type="checkbox"
            className="mt-0.5 size-5 shrink-0 cursor-pointer accent-[var(--color-accent)]"
            aria-invalid={Boolean(errors.privacyAccepted)}
            aria-describedby={errors.privacyAccepted ? 'privacy-error' : undefined}
            {...register('privacyAccepted')}
          />
          <span>
            {t('contact.privacyPrefix')}{' '}
            <Link
              to="/privacidad"
              target="_blank"
              className="font-semibold underline underline-offset-4"
            >
              {t('contact.privacyLink')}
            </Link>
            .
          </span>
        </label>
        {errors.privacyAccepted && (
          <p id="privacy-error" className="mt-2 text-sm text-danger">
            {errorText(errors.privacyAccepted)}
          </p>
        )}
      </div>

      {sendContact.isError && (
        <p role="alert" className="rounded-md bg-danger/10 px-4 py-3 text-sm text-danger">
          {t('contact.errors.network')}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={sendContact.isPending}
        className="sm:justify-self-start"
      >
        {sendContact.isPending && (
          <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
        )}
        {sendContact.isPending ? t('contact.sending') : t('contact.send')}
      </Button>
    </form>
  );
}

interface FieldProps {
  label: string;
  error?: string;
  required?: boolean;
  /** Recibe id y atributos de accesibilidad para el control. */
  children: (props: {
    id: string;
    'aria-invalid': boolean;
    'aria-describedby'?: string;
    'aria-required'?: boolean;
  }) => ReactNode;
}

function Field({ label, error, required, children }: FieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && (
          <span aria-hidden="true" className="text-accent-text">
            {' '}
            *
          </span>
        )}
      </label>
      {children({
        id,
        'aria-invalid': Boolean(error),
        'aria-describedby': error ? errorId : undefined,
        'aria-required': required,
      })}
      {error && (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
