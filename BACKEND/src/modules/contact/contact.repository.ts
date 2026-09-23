import type { ContactRequest } from '@orion-lex/shared';

export interface SavedContact {
  id: string;
  createdAt: Date;
}

/**
 * Contrato del almacenamiento de mensajes. El servicio depende de esto, no de una base
 * concreta: hoy se guarda en JSON (contact.json-repository) y luego en PostgreSQL
 * (contact.prisma-repository) sin tocar el resto del módulo.
 */
export interface ContactRepository {
  create(data: ContactRequest): Promise<SavedContact>;
}
