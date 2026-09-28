import { randomUUID } from 'node:crypto';
import { SERVICES } from '../src/data/types';
import type { AgeGroup, Minister, Placement, Report, ServiceId, WeekLetter } from '../src/data/types';
import { clearCookie, equalSecret, hashPassword, readSession, sessionCookie, verifyPassword } from './auth';
import type { Session } from './auth';
import { fileRepo, postgresRepo } from './repo';
import type { Data, Repo } from './repo';

export interface Config {
  repo: Repo;
  secret: string;
  leadName: string;
  leadPassword: string;
  secureCookies: boolean;
}

export function configFromEnv(env = process.env): Config {
  const prod = env.NODE_ENV === 'production';
  const missing = prod ? ['DATABASE_URL', 'SESSION_SECRET', 'LEAD_NAME', 'LEAD_PASSWORD'].filter((k) => !env[k]) : [];
  if (missing.length) throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  return {
    repo: env.DATABASE_URL ? postgresRepo(env.DATABASE_URL, Number(env.PG_POOL_MAX) || 5) : fileRepo(env.DATA_FILE ?? '.data/db.json'),
    secret: env.SESSION_SECRET ?? 'local-development-secret',
    leadName: env.LEAD_NAME ?? 'Local lead',
    leadPassword: env.LEAD_PASSWORD ?? 'eaglekidz',
    secureCookies: prod,
  };
}

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...headers } });

const SERVICE_IDS = SERVICES.map((s) => s.id) as string[];
const isService = (v: unknown): v is ServiceId => typeof v === 'string' && SERVICE_IDS.includes(v);
const isDate = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);
const str = (v: unknown, max = 5000) => (typeof v === 'string' ? v.slice(0, max) : '');
const CELL_KEY = /^\d{4}-\d{2}-\d{2}\|(week|VT|9|11|1)\|[A-Za-z.-]{2,20}$/;

/** SICs can sign in only while they're marked SIC somewhere in the grouping. */
const sicIds = (d: Data) => new Set(d.placements.filter((p) => p.sic).map((p) => p.ministerId));

export function createHandler(cfg: Config) {
  const { repo } = cfg;

  async function currentUser(req: Request, data: Data) {
    const s = readSession(req.headers.get('cookie'), cfg.secret);
    if (!s) return null;
    if (s.role === 'lead') {
      const asMinister = data.ministers.find((m) => m.name.toLowerCase() === cfg.leadName.toLowerCase());
      return { session: s, name: cfg.leadName, ministerId: asMinister?.id ?? null };
    }
    const m = data.ministers.find((x) => x.id === s.sub);
    if (!m || !sicIds(data).has(m.id)) return null;
    return { session: s, name: m.name, ministerId: m.id };
  }

  async function route(req: Request, path: string): Promise<Response> {
    const method = req.method;
    const body = method === 'GET' || method === 'DELETE' ? {} : ((await req.json().catch(() => ({}))) as Record<string, unknown>);
    const data = await repo.load();
    const user = await currentUser(req, data);
    const parts = path.split('/').filter(Boolean);

    const requireEditor = () => {
      if (!user) throw new HttpError(401, 'Sign in to make changes.');
      return user;
    };
    const requireLead = () => {
      if (user?.session.role !== 'lead') throw new HttpError(403, 'Only the ministry lead can manage access.');
    };

    /* Session */
    if (path === 'bootstrap' && method === 'GET') {
      const ministers = data.ministers.map(({ id, name, isNew }) => ({ id, name, isNew }));
      const me = user && { role: user.session.role, name: user.name, ministerId: user.ministerId };
      if (!user) return json({ me: null, ministers, schedule: data.schedule, placements: [], reports: [] });
      return json({ me, ...data });
    }

    if (path === 'login-options' && method === 'GET') {
      const accounts = await repo.accounts();
      const sics = sicIds(data);
      const options = data.ministers
        .filter((m) => sics.has(m.id) && accounts.some((a) => a.ministerId === m.id))
        .map((m) => ({ id: m.id, name: m.name }))
        .sort((a, b) => a.name.localeCompare(b.name));
      return json([{ id: 'lead', name: cfg.leadName, lead: true }, ...options]);
    }

    if (path === 'login' && method === 'POST') {
      const id = str(body.id, 100);
      const password = str(body.password, 200);
      let session: Omit<Session, 'exp'> | null = null;
      if (id === 'lead') {
        if (cfg.leadPassword && equalSecret(password, cfg.leadPassword)) session = { sub: 'lead', role: 'lead' };
      } else {
        const account = (await repo.accounts()).find((a) => a.ministerId === id);
        if (account && sicIds(data).has(id) && verifyPassword(password, account.passwordHash)) session = { sub: id, role: 'sic' };
      }
      if (!session) {
        await new Promise((r) => setTimeout(r, 400));
        throw new HttpError(401, 'That name and password don’t match.');
      }
      return json({ ok: true }, 200, { 'set-cookie': sessionCookie(session, cfg.secret, cfg.secureCookies) });
    }

    if (path === 'logout' && method === 'POST') {
      return json({ ok: true }, 200, { 'set-cookie': clearCookie(cfg.secureCookies) });
    }

    /* Schedule */
    if (path === 'cells' && method === 'PUT') {
      requireEditor();
      const key = str(body.key, 60);
      if (!CELL_KEY.test(key)) throw new HttpError(400, 'Unknown schedule slot.');
      const people = Array.isArray(body.people) ? body.people.map((p) => str(p, 80).trim()).filter(Boolean).slice(0, 12) : [];
      await repo.setCell(key, [...new Set(people)]);
      return json({ ok: true });
    }

    if (path === 'cells/copy' && method === 'POST') {
      requireEditor();
      if (!isDate(body.from) || !isDate(body.to)) throw new HttpError(400, 'Pick the Sundays to copy between.');
      if (Object.keys(data.schedule).some((k) => k.startsWith(`${body.to}|`))) throw new HttpError(409, 'That Sunday already has a schedule.');
      const copied = Object.entries(data.schedule).filter(([k]) => k.startsWith(`${body.from}|`));
      for (const [k, people] of copied) await repo.setCell(k.replace(body.from as string, body.to as string), people);
      return json({ copied: copied.length });
    }

    /* Ministers */
    if (parts[0] === 'ministers') {
      requireEditor();
      if (method === 'POST') {
        const name = str(body.name, 80).trim();
        if (!name) throw new HttpError(400, 'Write the minister’s name.');
        const m: Minister = { id: randomUUID(), name, isNew: !!body.isNew };
        await repo.upsertMinister(m);
        return json(m, 201);
      }
      const existing = data.ministers.find((m) => m.id === parts[1]);
      if (!existing) throw new HttpError(404, 'Minister not found.');
      if (method === 'PUT') {
        const m: Minister = { ...existing, name: str(body.name, 80).trim() || existing.name, isNew: typeof body.isNew === 'boolean' ? body.isNew : existing.isNew };
        await repo.upsertMinister(m);
        return json(m);
      }
      if (method === 'DELETE') {
        await repo.deleteMinister(existing.id);
        return json({ ok: true });
      }
    }

    /* Grouping */
    if (parts[0] === 'placements') {
      requireEditor();
      const readPlacement = (base?: Placement): Placement => {
        const service = body.service ?? base?.service;
        if (!isService(service)) throw new HttpError(400, 'Pick a service.');
        const ministerId = str(body.ministerId ?? base?.ministerId, 100);
        if (!data.ministers.some((m) => m.id === ministerId)) throw new HttpError(400, 'Minister not found.');
        const weeks = (Array.isArray(body.weeks) ? body.weeks : base?.weeks ?? []).filter((w): w is WeekLetter => w === 'A' || w === 'B');
        if (!weeks.length) throw new HttpError(400, 'Pick A, B or both weeks.');
        const dupe = data.placements.find((p) => p.ministerId === ministerId && p.service === service && p.id !== base?.id);
        if (dupe) throw new HttpError(409, 'Already on this service. Edit that entry instead.');
        const age = body.ageGroup === undefined ? base?.ageGroup : body.ageGroup;
        return {
          id: base?.id ?? randomUUID(),
          ministerId,
          service,
          weeks: [...new Set(weeks)].sort(),
          sic: typeof body.sic === 'boolean' ? body.sic : !!base?.sic,
          ageGroup: service !== 'VT' && (age === 'LE' || age === 'AS' || age === 'ST') ? (age as AgeGroup) : undefined,
          note: (body.note === undefined ? base?.note : str(body.note, 200).trim()) || undefined,
          order: base?.order ?? Math.max(-1, ...data.placements.filter((p) => p.service === service).map((p) => p.order)) + 1,
        };
      };
      if (method === 'POST') {
        const p = readPlacement();
        await repo.upsertPlacement(p);
        return json(p, 201);
      }
      const existing = data.placements.find((p) => p.id === parts[1]);
      if (!existing) throw new HttpError(404, 'Grouping entry not found.');
      if (method === 'PUT') {
        const p = readPlacement(existing);
        await repo.upsertPlacement(p);
        return json(p);
      }
      if (method === 'DELETE') {
        await repo.deletePlacement(existing.id);
        return json({ ok: true });
      }
    }

    /* Reports */
    if (parts[0] === 'reports') {
      requireEditor();
      if (method === 'POST' || method === 'PUT') {
        const existing = parts[1] ? data.reports.find((r) => r.id === parts[1]) : undefined;
        if (method === 'PUT' && !existing) throw new HttpError(404, 'Report not found.');
        if (!isDate(body.date) || !isService(body.service)) throw new HttpError(400, 'Pick a Sunday and a service.');
        const clash = data.reports.find((r) => r.date === body.date && r.service === body.service && r.id !== existing?.id);
        if (clash) throw new HttpError(409, 'There’s already a report for this service on this Sunday.');
        const r: Report = {
          id: existing?.id ?? randomUUID(),
          date: body.date,
          service: body.service,
          wentWell: str(body.wentWell),
          canImprove: str(body.canImprove),
          actionPlans: str(body.actionPlans),
          updatedAt: new Date().toISOString(),
        };
        if (!r.wentWell.trim() && !r.canImprove.trim() && !r.actionPlans.trim()) throw new HttpError(400, 'Write at least one section before saving.');
        await repo.upsertReport(r);
        return json(r, existing ? 200 : 201);
      }
      if (method === 'DELETE' && parts[1]) {
        await repo.deleteReport(parts[1]);
        return json({ ok: true });
      }
    }

    /* Access (lead only) */
    if (parts[0] === 'accounts') {
      requireLead();
      if (method === 'GET') {
        const accounts = await repo.accounts();
        const sics = sicIds(data);
        return json(
          data.ministers
            .filter((m) => sics.has(m.id) || accounts.some((a) => a.ministerId === m.id))
            .map((m) => ({ ministerId: m.id, name: m.name, isSic: sics.has(m.id), hasPassword: accounts.some((a) => a.ministerId === m.id) }))
            .sort((a, b) => a.name.localeCompare(b.name)),
        );
      }
      const id = parts[1];
      if (!data.ministers.some((m) => m.id === id)) throw new HttpError(404, 'Minister not found.');
      if (method === 'PUT') {
        const password = str(body.password, 200);
        if (!sicIds(data).has(id)) throw new HttpError(400, 'Only ministers marked SIC in the grouping can sign in.');
        if (password.length < 8) throw new HttpError(400, 'Use at least 8 characters.');
        await repo.setAccount({ ministerId: id, passwordHash: hashPassword(password) });
        return json({ ok: true });
      }
      if (method === 'DELETE') {
        await repo.deleteAccount(id);
        return json({ ok: true });
      }
    }

    throw new HttpError(404, 'Not found.');
  }

  return async function handle(req: Request): Promise<Response> {
    const path = new URL(req.url).pathname.replace(/^\/api\/?/, '');
    try {
      return await route(req, path);
    } catch (e) {
      if (e instanceof HttpError) return json({ error: e.message }, e.status);
      console.error(e);
      return json({ error: 'Something went wrong on the server. Try again.' }, 500);
    }
  };
}
