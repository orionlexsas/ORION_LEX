import type { PrismaClient } from '../../generated/prisma/client';
import type { ContactRepository } from './contact.repository';

/** Mensajes de contacto en PostgreSQL (usar cuando se configure DATABASE_URL). */
export function createPrismaContactRepository(prisma: PrismaClient): ContactRepository {
  return {
    create(data) {
      return prisma.contactMessage.create({ data, select: { id: true, createdAt: true } });
    },
  };
}
