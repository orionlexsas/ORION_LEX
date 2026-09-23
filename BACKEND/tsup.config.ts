import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  format: 'esm',
  target: 'node22',
  platform: 'node',
  clean: true,
  sourcemap: true,
  // El paquete compartido se publica como TypeScript, así que se incluye en el bundle.
  noExternal: ['@orion-lex/shared'],
});
