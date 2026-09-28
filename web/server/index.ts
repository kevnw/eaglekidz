import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { configFromEnv, createHandler } from './handler';
import { toWebRequest, sendWebResponse } from './node-adapter';

// Production server (Railway): serves the built app and the /api from one process.
const handle = createHandler(configFromEnv());
const root = join(import.meta.dirname, '..', 'dist');
const port = Number(process.env.PORT ?? 3000);

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  if (url.pathname.startsWith('/api/')) return sendWebResponse(res, await handle(await toWebRequest(req)));
  if (url.pathname === '/health') return res.writeHead(200).end('ok');

  const file = normalize(join(root, url.pathname === '/' ? 'index.html' : url.pathname));
  if (!file.startsWith(root)) return res.writeHead(403).end();
  try {
    const body = await readFile(file);
    const immutable = url.pathname.startsWith('/assets/');
    res.writeHead(200, {
      'content-type': TYPES[extname(file)] ?? 'application/octet-stream',
      'cache-control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
    });
    res.end(body);
  } catch {
    res.writeHead(200, { 'content-type': TYPES['.html'], 'cache-control': 'no-cache' });
    res.end(await readFile(join(root, 'index.html')));
  }
}).listen(port, () => console.log(`Eagle Kidz listening on :${port}`));
