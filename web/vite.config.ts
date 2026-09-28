import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/** In development the same API handler runs inside Vite, backed by a local JSON file. */
function api(): Plugin {
  return {
    name: 'eaglekidz-api',
    async configureServer(server) {
      const { configFromEnv, createHandler } = await server.ssrLoadModule('/server/handler.ts');
      const { toWebRequest, sendWebResponse } = await server.ssrLoadModule('/server/node-adapter.ts');
      const handle = createHandler(configFromEnv());
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next();
        await sendWebResponse(res, await handle(await toWebRequest(req)));
      });
    },
  };
}

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), api()],
  // The server bundle only needs code; static files ship from dist/.
  build: { copyPublicDir: !isSsrBuild },
}));
