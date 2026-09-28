import { useSyncExternalStore } from 'react';
import type { Minister, Placement, Report, ServiceId, Session, State } from './types';

// Client cache of the API. Writes update the cache first so the sheet responds at once,
// then reload from the server if the request fails.
const VIEWER_KEY = 'eaglekidz:viewer';

function readViewer() {
  try {
    return localStorage.getItem(VIEWER_KEY);
  } catch {
    return null;
  }
}

let state: State = {
  ministers: [],
  placements: [],
  reports: [],
  schedule: {},
  session: null,
  viewerId: readViewer(),
  status: 'loading',
  error: null,
};
const listeners = new Set<() => void>();

function set(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function useStore(): State {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
  );
}

export class ApiError extends Error {}

export async function api<T = unknown>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch(`/api/${path}`, {
    method: init.method ?? 'GET',
    headers: init.body === undefined ? undefined : { 'content-type': 'application/json' },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    credentials: 'same-origin',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError((data as { error?: string }).error ?? 'Couldn’t reach the server. Check your connection and try again.');
  return data as T;
}

type Bootstrap = Pick<State, 'ministers' | 'placements' | 'reports' | 'schedule'> & { me: Session | null };

export async function reload() {
  try {
    const d = await api<Bootstrap>('bootstrap');
    set({ ministers: d.ministers, placements: d.placements, reports: d.reports, schedule: d.schedule, session: d.me, status: 'ready', error: null });
  } catch (e) {
    set({ status: state.status === 'ready' ? 'ready' : 'error', error: (e as Error).message });
  }
}

/** Apply locally, send, and put the server's truth back if it refuses. */
async function write<T>(optimistic: Partial<State> | null, request: () => Promise<T>): Promise<T> {
  if (optimistic) set(optimistic);
  try {
    return await request();
  } catch (e) {
    set({ error: (e as Error).message });
    await reload();
    throw e;
  }
}

export const actions = {
  dismissError() {
    set({ error: null });
  },
  setViewer(id: string | null) {
    try {
      if (id) localStorage.setItem(VIEWER_KEY, id);
      else localStorage.removeItem(VIEWER_KEY);
    } catch {
      // The pick just won't be remembered.
    }
    set({ viewerId: id });
  },
  async login(id: string, password: string) {
    await api('login', { method: 'POST', body: { id, password } });
    await reload();
  },
  async logout() {
    await api('logout', { method: 'POST' });
    set({ placements: [], reports: [], session: null });
    await reload();
  },
  setCell(key: string, people: string[]) {
    const schedule = { ...state.schedule };
    if (people.length) schedule[key] = people;
    else delete schedule[key];
    return write({ schedule }, () => api('cells', { method: 'PUT', body: { key, people } }));
  },
  async copySchedule(from: string, to: string) {
    await write(null, () => api('cells/copy', { method: 'POST', body: { from, to } }));
    await reload();
  },
  async addMinister(name: string, isNew = false) {
    const m = await write(null, () => api<Minister>('ministers', { method: 'POST', body: { name, isNew } }));
    set({ ministers: [...state.ministers, m] });
    return m;
  },
  updateMinister(id: string, patch: Partial<Omit<Minister, 'id'>>) {
    return write({ ministers: state.ministers.map((m) => (m.id === id ? { ...m, ...patch } : m)) }, () =>
      api(`ministers/${id}`, { method: 'PUT', body: patch }),
    );
  },
  async addPlacement(p: Omit<Placement, 'id' | 'order'>) {
    const saved = await write(null, () => api<Placement>('placements', { method: 'POST', body: p }));
    set({ placements: [...state.placements, saved] });
  },
  async updatePlacement(id: string, patch: Partial<Omit<Placement, 'id'>>) {
    const saved = await write({ placements: state.placements.map((p) => (p.id === id ? { ...p, ...patch } : p)) }, () =>
      api<Placement>(`placements/${id}`, { method: 'PUT', body: patch }),
    );
    set({ placements: state.placements.map((p) => (p.id === id ? saved : p)) });
  },
  removePlacement(id: string) {
    return write({ placements: state.placements.filter((p) => p.id !== id) }, () => api(`placements/${id}`, { method: 'DELETE' }));
  },
  async saveReport(r: Omit<Report, 'id' | 'updatedAt'> & { id?: string }) {
    const saved = r.id
      ? await api<Report>(`reports/${r.id}`, { method: 'PUT', body: r })
      : await api<Report>('reports', { method: 'POST', body: r });
    set({ reports: [saved, ...state.reports.filter((x) => x.id !== saved.id)] });
    return saved;
  },
  deleteReport(id: string) {
    return write({ reports: state.reports.filter((r) => r.id !== id) }, () => api(`reports/${id}`, { method: 'DELETE' }));
  },
};

/* Queries */

export const canEdit = (s: State) => !!s.session;
export const isLead = (s: State) => s.session?.role === 'lead';

/** Whose name gets the ballpoint ring: the signed-in person, or the viewer's own pick. */
export const meId = (s: State) => s.session?.ministerId ?? s.viewerId;

export function ministerById(s: State, id: string) {
  return s.ministers.find((m) => m.id === id);
}

/** A schedule entry is a minister id, or a plain name for someone not on the list. */
export function personName(s: State, entry: string) {
  return ministerById(s, entry)?.name ?? entry;
}

export function cell(s: State, key: string): string[] {
  return s.schedule[key] ?? [];
}

export function placementsFor(s: State, service: ServiceId) {
  return s.placements.filter((p) => p.service === service).sort((a, b) => a.order - b.order);
}

export function unplaced(s: State) {
  const placed = new Set(s.placements.map((p) => p.ministerId));
  return s.ministers.filter((m) => !placed.has(m.id)).sort((a, b) => a.name.localeCompare(b.name));
}

/** The most recent report for a service before a date, for carrying action plans forward. */
export function previousReport(s: State, service: ServiceId, date: string) {
  return s.reports
    .filter((r) => r.service === service && r.date < date && r.actionPlans.trim())
    .sort((a, b) => b.date.localeCompare(a.date))[0];
}
