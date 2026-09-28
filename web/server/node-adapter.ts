import type { IncomingMessage, ServerResponse } from 'node:http';

export async function toWebRequest(req: IncomingMessage): Promise<Request> {
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) if (typeof v === 'string') headers.set(k, v);
  const method = req.method ?? 'GET';
  return new Request(new URL(req.url ?? '/', 'http://localhost'), {
    method,
    headers,
    body: method === 'GET' || method === 'HEAD' ? undefined : Buffer.concat(chunks),
  });
}

export async function sendWebResponse(res: ServerResponse, r: Response) {
  res.writeHead(r.status, Object.fromEntries(r.headers));
  res.end(Buffer.from(await r.arrayBuffer()));
}
