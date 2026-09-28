import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import postgres from 'postgres';
import { seedState } from '../src/data/seed';
import type { Minister, Placement, Report } from '../src/data/types';

export interface Data {
  ministers: Minister[];
  placements: Placement[];
  schedule: Record<string, string[]>;
  reports: Report[];
}

export interface Account {
  ministerId: string;
  passwordHash: string;
}

export interface Repo {
  load(): Promise<Data>;
  upsertMinister(m: Minister): Promise<void>;
  deleteMinister(id: string): Promise<void>;
  upsertPlacement(p: Placement): Promise<void>;
  deletePlacement(id: string): Promise<void>;
  setCell(key: string, people: string[]): Promise<void>;
  upsertReport(r: Report): Promise<void>;
  deleteReport(id: string): Promise<void>;
  accounts(): Promise<Account[]>;
  setAccount(a: Account): Promise<void>;
  deleteAccount(ministerId: string): Promise<void>;
}

/** Real ministry data only: the grouping and the October schedule. Sample reports stay out of the database. */
function initialData(): Data {
  const { ministers, placements, schedule } = seedState();
  return { ministers, placements, schedule, reports: [] };
}

/* ---------- Postgres (Railway) ---------- */

export function postgresRepo(url: string, max = 5): Repo {
  const sql = postgres(url, { max, idle_timeout: 20, onnotice: () => {} });
  let ready: Promise<void> | null = null;

  const init = () =>
    (ready ??= (async () => {
      await sql`create table if not exists ministers (id text primary key, name text not null, is_new boolean not null default false)`;
      await sql`create table if not exists placements (
        id text primary key, minister_id text not null references ministers(id) on delete cascade,
        service text not null, weeks text[] not null, sic boolean not null default false,
        age_group text, note text, ord integer not null default 0)`;
      await sql`create table if not exists schedule_cells (key text primary key, people jsonb not null)`;
      await sql`create table if not exists reports (
        id text primary key, date text not null, service text not null,
        went_well text not null default '', can_improve text not null default '', action_plans text not null default '',
        updated_at timestamptz not null default now(), unique (date, service))`;
      await sql`create table if not exists accounts (minister_id text primary key references ministers(id) on delete cascade, password_hash text not null)`;

      const [{ count }] = await sql`select count(*)::int as count from ministers`;
      if (count === 0) {
        const d = initialData();
        await sql.begin(async (tx) => {
          for (const m of d.ministers) await tx`insert into ministers (id, name, is_new) values (${m.id}, ${m.name}, ${m.isNew})`;
          for (const p of d.placements)
            await tx`insert into placements (id, minister_id, service, weeks, sic, age_group, note, ord)
              values (${p.id}, ${p.ministerId}, ${p.service}, ${p.weeks}, ${p.sic}, ${p.ageGroup ?? null}, ${p.note ?? null}, ${p.order})`;
          for (const [key, people] of Object.entries(d.schedule))
            await tx`insert into schedule_cells (key, people) values (${key}, ${tx.json(people)})`;
        });
      }
    })());

  return {
    async load() {
      await init();
      const [ms, ps, cs, rs] = await Promise.all([
        sql`select id, name, is_new from ministers order by name`,
        sql`select * from placements order by service, ord`,
        sql`select key, people from schedule_cells`,
        sql`select * from reports order by date desc, service`,
      ]);
      return {
        ministers: ms.map((m) => ({ id: m.id, name: m.name, isNew: m.is_new })),
        placements: ps.map((p) => ({
          id: p.id, ministerId: p.minister_id, service: p.service, weeks: p.weeks, sic: p.sic,
          ageGroup: p.age_group ?? undefined, note: p.note ?? undefined, order: p.ord,
        })),
        schedule: Object.fromEntries(cs.map((c) => [c.key, c.people as string[]])),
        reports: rs.map((r) => ({
          id: r.id, date: r.date, service: r.service, wentWell: r.went_well, canImprove: r.can_improve,
          actionPlans: r.action_plans, updatedAt: new Date(r.updated_at).toISOString(),
        })),
      };
    },
    async upsertMinister(m) {
      await init();
      await sql`insert into ministers (id, name, is_new) values (${m.id}, ${m.name}, ${m.isNew})
        on conflict (id) do update set name = excluded.name, is_new = excluded.is_new`;
    },
    async deleteMinister(id) {
      await init();
      await sql.begin(async (tx) => {
        await tx`delete from ministers where id = ${id}`;
        await tx`update schedule_cells set people = coalesce((select jsonb_agg(e) from jsonb_array_elements(people) e where e <> to_jsonb(${id}::text)), '[]'::jsonb)`;
        await tx`delete from schedule_cells where jsonb_array_length(people) = 0`;
      });
    },
    async upsertPlacement(p) {
      await init();
      await sql`insert into placements (id, minister_id, service, weeks, sic, age_group, note, ord)
        values (${p.id}, ${p.ministerId}, ${p.service}, ${p.weeks}, ${p.sic}, ${p.ageGroup ?? null}, ${p.note ?? null}, ${p.order})
        on conflict (id) do update set minister_id = excluded.minister_id, service = excluded.service, weeks = excluded.weeks,
          sic = excluded.sic, age_group = excluded.age_group, note = excluded.note, ord = excluded.ord`;
    },
    async deletePlacement(id) {
      await init();
      await sql`delete from placements where id = ${id}`;
    },
    async setCell(key, people) {
      await init();
      if (people.length)
        await sql`insert into schedule_cells (key, people) values (${key}, ${sql.json(people)})
          on conflict (key) do update set people = excluded.people`;
      else await sql`delete from schedule_cells where key = ${key}`;
    },
    async upsertReport(r) {
      await init();
      await sql`insert into reports (id, date, service, went_well, can_improve, action_plans, updated_at)
        values (${r.id}, ${r.date}, ${r.service}, ${r.wentWell}, ${r.canImprove}, ${r.actionPlans}, ${r.updatedAt})
        on conflict (id) do update set date = excluded.date, service = excluded.service, went_well = excluded.went_well,
          can_improve = excluded.can_improve, action_plans = excluded.action_plans, updated_at = excluded.updated_at`;
    },
    async deleteReport(id) {
      await init();
      await sql`delete from reports where id = ${id}`;
    },
    async accounts() {
      await init();
      const rows = await sql`select minister_id, password_hash from accounts`;
      return rows.map((r) => ({ ministerId: r.minister_id, passwordHash: r.password_hash }));
    },
    async setAccount(a) {
      await init();
      await sql`insert into accounts (minister_id, password_hash) values (${a.ministerId}, ${a.passwordHash})
        on conflict (minister_id) do update set password_hash = excluded.password_hash`;
    },
    async deleteAccount(ministerId) {
      await init();
      await sql`delete from accounts where minister_id = ${ministerId}`;
    },
  };
}

/* ---------- JSON file (local development) ---------- */

export function fileRepo(path: string): Repo {
  type Db = Data & { accounts: Account[] };
  const read = (): Db => {
    try {
      return JSON.parse(readFileSync(path, 'utf8')) as Db;
    } catch {
      const db = { ...initialData(), accounts: [] };
      write(db);
      return db;
    }
  };
  const write = (db: Db) => {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, JSON.stringify(db, null, 2));
  };
  const change = async (fn: (db: Db) => void) => {
    const db = read();
    fn(db);
    write(db);
  };
  const upsert = <T extends { id: string }>(list: T[], item: T) => {
    const i = list.findIndex((x) => x.id === item.id);
    if (i >= 0) list[i] = item;
    else list.push(item);
  };

  return {
    async load() {
      const { ministers, placements, schedule, reports } = read();
      return { ministers, placements, schedule, reports };
    },
    upsertMinister: (m) => change((db) => upsert(db.ministers, m)),
    deleteMinister: (id) =>
      change((db) => {
        db.ministers = db.ministers.filter((m) => m.id !== id);
        db.placements = db.placements.filter((p) => p.ministerId !== id);
        db.accounts = db.accounts.filter((a) => a.ministerId !== id);
        for (const [k, v] of Object.entries(db.schedule)) {
          const next = v.filter((x) => x !== id);
          if (next.length) db.schedule[k] = next;
          else delete db.schedule[k];
        }
      }),
    upsertPlacement: (p) => change((db) => upsert(db.placements, p)),
    deletePlacement: (id) => change((db) => void (db.placements = db.placements.filter((p) => p.id !== id))),
    setCell: (key, people) =>
      change((db) => {
        if (people.length) db.schedule[key] = people;
        else delete db.schedule[key];
      }),
    upsertReport: (r) => change((db) => upsert(db.reports, r)),
    deleteReport: (id) => change((db) => void (db.reports = db.reports.filter((r) => r.id !== id))),
    accounts: async () => read().accounts,
    setAccount: (a) =>
      change((db) => {
        db.accounts = [...db.accounts.filter((x) => x.ministerId !== a.ministerId), a];
      }),
    deleteAccount: (id) => change((db) => void (db.accounts = db.accounts.filter((a) => a.ministerId !== id))),
  };
}
