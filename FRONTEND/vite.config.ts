import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import type { IncomingMessage, ServerResponse } from 'node:http';

/**
 * En desarrollo, la API del panel (/api/v1/admin/*) la atiende el mismo servidor de Vite con
 * el código de server/admin (el mismo que usa la función de Vercel), guardando en los archivos
 * del proyecto. Se registra antes del proxy, así que el resto de /api sigue yendo al backend.
 */
function adminApi(): Plugin {
  return {
    name: 'orion-admin-api',
    apply: 'serve',
    configureServer(server) {
      // '' = todas las variables de .env/.env.local (también las que no empiezan por VITE_).
      const env = loadEnv(server.config.mode, server.config.root, '');
      const rootDir = fileURLToPath(new URL('..', import.meta.url));
      server.middlewares.use('/api/v1/admin', async (req, res, next) => {
        try {
          const { handleDevRequest } = (await server.ssrLoadModule('/server/admin/node.ts')) as {
            handleDevRequest: (
              req: IncomingMessage,
              res: ServerResponse,
              env: Record<string, string>,
              rootDir: string,
            ) => Promise<void>;
          };
          await handleDevRequest(req, res, env, rootDir);
        } catch (error) {
          next(error);
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), adminApi()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    // En desarrollo, /api se reenvía al backend: sin problemas de CORS.
    proxy: { '/api': 'http://localhost:4000' },
    // El historial local del panel no es parte de la web.
    watch: { ignored: ['**/.admin-local/**'] },
  },
});
