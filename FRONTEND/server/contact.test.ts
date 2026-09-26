import { describe, expect, it, vi } from 'vitest';
import { buildContactEmail, handleContact, type MailMessage } from './contact';

const valid = {
  fullName: 'Ana Pérez',
  phone: '+57 313 000 0000',
  email: 'ana@example.com',
  subject: 'Eliminación de comparendos',
  message: 'Tengo un comparendo de 2019 que no reconozco.',
  privacyAccepted: true,
};

function setup() {
  const sent: MailMessage[] = [];
  const deps = {
    sendMail: vi.fn(async (message: MailMessage) => {
      sent.push(message);
    }),
    from: 'abogados@orionlex.co',
    to: 'abogados@orionlex.co',
    now: () => new Date('2026-09-25T12:00:00Z'),
  };
  return { deps, sent };
}

describe('formulario de contacto (función de Vercel)', () => {
  it('envía un correo al despacho con los datos y responder-a del cliente', async () => {
    const { deps, sent } = setup();
    const result = await handleContact('POST', valid, deps);

    expect(result.status).toBe(201);
    expect(result.body).toMatchObject({ createdAt: '2026-09-25T12:00:00.000Z' });
    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({
      to: 'abogados@orionlex.co',
      replyTo: '"Ana Pérez" <ana@example.com>',
      subject: 'Nueva consulta web: Eliminación de comparendos — Ana Pérez',
    });
    expect(sent[0]!.text).toContain('Teléfono: +57 313 000 0000');
  });

  it('acepta el cuerpo como texto JSON', async () => {
    const { deps } = setup();
    const result = await handleContact('POST', JSON.stringify(valid), deps);
    expect(result.status).toBe(201);
  });

  it('rechaza datos inválidos sin enviar correo', async () => {
    const { deps } = setup();
    const result = await handleContact('POST', { ...valid, email: 'no-es-correo' }, deps);
    expect(result.status).toBe(400);
    expect(result.body).toMatchObject({ error: { code: 'VALIDATION_ERROR' } });
    expect(deps.sendMail).not.toHaveBeenCalled();
  });

  it('exige aceptar la política de datos', async () => {
    const { deps } = setup();
    const result = await handleContact('POST', { ...valid, privacyAccepted: false }, deps);
    expect(result.status).toBe(400);
    expect(deps.sendMail).not.toHaveBeenCalled();
  });

  it('descarta en silencio los envíos de robots (campo trampa lleno)', async () => {
    const { deps } = setup();
    const result = await handleContact('POST', { ...valid, website: 'http://spam.example' }, deps);
    expect(result.status).toBe(201);
    expect(deps.sendMail).not.toHaveBeenCalled();
  });

  it('solo acepta POST', async () => {
    const { deps } = setup();
    expect((await handleContact('GET', undefined, deps)).status).toBe(405);
  });

  it('escapa el HTML que escriba el visitante', () => {
    const email = buildContactEmail(
      { ...valid, message: '<script>alert(1)</script> hola', privacyAccepted: true },
      'a@b.co',
      'a@b.co',
    );
    expect(email.html).not.toContain('<script>');
    expect(email.html).toContain('&#60;script&#62;');
  });
});
