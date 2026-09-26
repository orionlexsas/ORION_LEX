import type { PrismaClient } from '../../generated/prisma/client';
import type { ContactRepository } from './contact.repository';

/** Mensajes de contacto en PostgreSQL (usar cuando se configure DATABASE_URL). */
export function createPrismaContactRepository(prisma: PrismaClient): ContactRepository {
  return {
    // El asunto se guarda en la columna practiceArea; la aceptación de datos es obligatoria
    // para llegar aquí, así que no se guarda aparte.
    create({ subject, privacyAccepted: _accepted, ...data }) {
      return prisma.contactMessage.create({
        data: { ...data, practiceArea: subject },
        select: { id: true, createdAt: true },
      });
    },
  };
}
