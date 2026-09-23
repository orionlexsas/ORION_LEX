import type { ContactRequest } from '@orion-lex/shared';
import type { ContactRepository } from './contact.repository';

/** Reglas de negocio del contacto. No conoce Express ni HTTP. */
export function createContactService(repository: ContactRepository) {
  return {
    async submit(data: ContactRequest) {
      const saved = await repository.create(data);
      // TODO: avisar al despacho por correo (lib/mailer) cuando se configure el proveedor.
      return saved;
    },
  };
}

export type ContactService = ReturnType<typeof createContactService>;
