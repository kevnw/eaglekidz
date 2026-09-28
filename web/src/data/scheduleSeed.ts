import { cellKey } from './schedule';
import type { ScheduleService } from './schedule';

// October 2026, transcribed from the lead's weekly schedule sheet.
// Main services list: SIC, PAW, Host, Mulmed, Usher, then LE / AS / ST as [sermon, activity, ka' pendamping].
type Main = [sic: string, paw: string, host?: string, mulmed?: string, usher?: string, le?: string[], as?: string[], st?: string[]];
type Vt = [sic: string, host: string, sermon: string, mulmed: string, sm: string, usher: string, crowd: string[]];

const WEEKS: { date: string; prep?: { leas?: string; st?: string }; nine: Main; eleven: Main; one: Main; vt: Vt }[] = [
  {
    date: '2026-10-04',
    prep: { leas: 'Wesly', st: 'Karlin' },
    nine: ['Kevin T', 'Kimberly', 'Wesly', 'Karlin', 'Dewina', ['Dewina', 'Kimberly', 'Kimberly'], ['Dewina', 'Wesly', 'Wesly'], ['Kevin T', 'Karlin', 'Karlin']],
    eleven: ['Elvina', 'Valerie', 'Grace', 'Victoria', 'Elvina', ['Hanna', 'Elvina', 'Elvina'], ['Victoria', 'Grace', 'Grace'], ['Yenny', 'Valerie', 'Valerie']],
    one: ['Fiona', 'Nicole', 'Jessica', 'Jasper', 'Carissa', ['Fiona', 'Jessica', 'Jessica'], ['Fiona', 'Carissa', 'Carissa'], ['Jasper', 'Nicole', 'Nicole']],
    vt: ['Bella', 'Nathan', 'Dewina', 'Feilin', 'Lucas', 'Stella', ['Bella', 'Stella', 'Lucas', 'Nathan']],
  },
  {
    date: '2026-10-11',
    nine: ['Kevin T', 'Dewina', 'Berlin', 'Wesly', 'Kevin T', ['Wesly', 'Dewina', 'Dewina'], ['Wesly', 'Dewina', 'Dewina'], ['Berlin', 'Kevin T', 'Kevin T']],
    eleven: ['Calista', 'Jeslyn'],
    one: ['Rosmina', 'Carissa', 'Jasper', 'Hanny', 'Rosmina', ['Rosmina', 'Carissa', 'Carissa'], ['Rosmina', 'Carissa', 'Carissa'], ['Hanny', 'Jasper', 'Jasper']],
    vt: ['Bella', 'Caroline', 'Bella', 'Jeremy', 'Feilin', 'Lucas', ['Caroline', 'Feilin', 'Lucas']],
  },
  {
    date: '2026-10-18',
    prep: { st: 'Kevin T' },
    nine: ['Dewina', 'Kimberly', 'Kevin T', 'Wesly', 'Karlin', ['Dewina', 'Kimberly', 'Kimberly'], ['Dewina', 'Wesly', 'Wesly'], ['Karlin', 'Kevin T', 'Kevin T']],
    eleven: ['Grace', 'Calista'],
    one: ['Fiona', 'Fiona', 'Jessica', 'Jasper', 'Carissa', ['Jessica', 'Carissa', 'Carissa'], ['Jessica', 'Fiona', 'Fiona'], ['Nicole', 'Jasper', 'Jasper']],
    vt: ['Bella', 'Stella', 'Kevin W', 'Feilin', 'Lucas', 'Nathan', ['Bella', 'Stella', 'Lucas', 'Nathan']],
  },
  {
    date: '2026-10-25',
    nine: ['Kevin T', 'Dewina', 'Wesly', 'Berlin', 'Kevin T', ['Wesly', 'Dewina', 'Dewina'], ['Wesly', 'Dewina', 'Dewina'], ['Kevin T', 'Berlin', 'Berlin']],
    eleven: ['Elvina', 'Claudia'],
    one: ['Rosmina', 'Carissa', 'Rosmina', 'Jasper', 'Hanny', ['Carissa', 'Rosmina', 'Rosmina'], ['Carissa', 'Rosmina', 'Rosmina'], ['Hanny', 'Jasper', 'Jasper']],
    vt: ['Bella', 'Stella', 'PS Inge', 'Nathan', 'Feilin', 'Lucas', ['Bella', 'Stella', 'Feilin', 'Lucas']],
  },
];

/** Names are resolved to minister ids where they match; anything else (e.g. a guest speaker) stays as written. */
export function seedSchedule(idForName: (name: string) => string): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  const put = (date: string, service: ScheduleService, slot: string, names?: string | string[]) => {
    const list = (Array.isArray(names) ? names : names ? [names] : []).filter(Boolean);
    if (list.length) out[cellKey(date, service, slot)] = list.map(idForName);
  };
  for (const w of WEEKS) {
    put(w.date, 'week', 'prep-leas', w.prep?.leas);
    put(w.date, 'week', 'prep-st', w.prep?.st);
    for (const [service, row] of [['9', w.nine], ['11', w.eleven], ['1', w.one]] as const) {
      const [sic, paw, host, mulmed, usher, le, as, st] = row;
      put(w.date, service, 'sic', sic);
      put(w.date, service, 'paw', paw);
      put(w.date, service, 'host', host);
      put(w.date, service, 'mulmed', mulmed);
      put(w.date, service, 'usher', usher);
      for (const [g, trio] of [['LE', le], ['AS', as], ['ST', st]] as const) {
        put(w.date, service, `${g}.sermon`, trio?.[0]);
        put(w.date, service, `${g}.activity`, trio?.[1]);
        put(w.date, service, `${g}.crowd`, trio?.[2]);
      }
    }
    const [sic, host, sermon, mulmed, sm, usher, crowd] = w.vt;
    put(w.date, 'VT', 'sic', sic);
    put(w.date, 'VT', 'host', host);
    put(w.date, 'VT', 'sermon', sermon);
    put(w.date, 'VT', 'mulmed', mulmed);
    put(w.date, 'VT', 'sm', sm);
    put(w.date, 'VT', 'usher', usher);
    put(w.date, 'VT', 'crowd', crowd);
  }
  return out;
}
