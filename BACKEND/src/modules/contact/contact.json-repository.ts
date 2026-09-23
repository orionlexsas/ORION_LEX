import { randomUUID } from 'node:crypto';
import type { ContactRequest } from '@orion-lex/shared';
import { createJsonFileStore } from '../../lib/json-file-store';
import type { ContactRepository } from './contact.repository';

interface StoredContact extends ContactRequest {
  id: string;
  status: 'NEW' | 'READ' | 'ARCHIVED';
  createdAt: string;
}

/** Mensajes de contacto guardados en un archivo JSON local (mientras no hay base de datos). */
export function createJsonContactRepository(filePath: string): ContactRepository {
  const store = createJsonFileStore<StoredContact>(filePath);

  return {
    async create(data) {
      const record: StoredContact = {
        id: randomUUID(),
        ...data,
        status: 'NEW',
        createdAt: new Date().toISOString(),
      };
      await store.update((items) => [...items, record]);
      return { id: record.id, createdAt: new Date(record.createdAt) };
    },
  };
}
