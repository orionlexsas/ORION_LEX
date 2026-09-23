import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createJsonContactRepository } from './contact.json-repository';

describe('createJsonContactRepository', () => {
  let dir: string;
  beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), 'orion-lex-'));
  });
  afterEach(() => rm(dir, { recursive: true, force: true }));

  it('guarda mensajes simultáneos sin perder ninguno', async () => {
    const file = path.join(dir, 'contact-messages.json');
    const repo = createJsonContactRepository(file);
    const msg = {
      fullName: 'Ana Pérez',
      email: 'ana@example.com',
      message: 'Hola, necesito ayuda.',
    };

    await Promise.all([repo.create(msg), repo.create(msg), repo.create(msg)]);

    const saved = JSON.parse(await readFile(file, 'utf8'));
    expect(saved).toHaveLength(3);
    expect(saved[0]).toMatchObject({ ...msg, status: 'NEW' });
  });
});
