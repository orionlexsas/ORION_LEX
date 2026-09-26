import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { createApp } from '../../app';
import type { ContactService } from './contact.service';

function setup() {
  const contactService: ContactService = {
    submit: vi.fn().mockResolvedValue({ id: 'msg_1', createdAt: new Date('2026-01-01') }),
  };
  const app = createApp({
    config: { CORS_ORIGIN: 'http://localhost:5173', NODE_ENV: 'test' },
    contactService,
  });
  return { app, contactService };
}

describe('POST /api/v1/contact', () => {
  it('guarda un mensaje válido', async () => {
    const { app, contactService } = setup();
    const res = await request(app).post('/api/v1/contact').send({
      fullName: 'Ana Pérez',
      phone: '313 000 0000',
      email: 'ana@example.com',
      message: 'Necesito asesoría laboral.',
      privacyAccepted: true,
    });
    expect(res.status).toBe(201);
    expect(res.body.id).toBe('msg_1');
    expect(contactService.submit).toHaveBeenCalledOnce();
  });

  it('rechaza datos inválidos sin llamar al servicio', async () => {
    const { app, contactService } = setup();
    const res = await request(app).post('/api/v1/contact').send({ email: 'no-es-correo' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(contactService.submit).not.toHaveBeenCalled();
  });
});
