import type { WeekLetter } from './types';

export function toISO(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function fromISO(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso: string, n: number): string {
  const d = fromISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

/** Today if it's Sunday, otherwise the coming Sunday. */
export function upcomingSunday(from = new Date()): string {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  d.setDate(d.getDate() + ((7 - d.getDay()) % 7));
  return toISO(d);
}

export function weekOfMonth(iso: string): number {
  return Math.ceil(fromISO(iso).getDate() / 7);
}

/** 1st, 3rd and 5th Sundays are A weeks; 2nd and 4th are B weeks. */
export function weekLetter(iso: string): WeekLetter {
  return weekOfMonth(iso) % 2 === 1 ? 'A' : 'B';
}

export function ordinal(n: number): string {
  return `${n}${['th', 'st', 'nd', 'rd'][n] ?? 'th'}`;
}

export function formatLong(iso: string): string {
  return fromISO(iso).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function formatShort(iso: string): string {
  return fromISO(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function formatDayMonth(iso: string) {
  const d = fromISO(iso);
  return {
    day: d.getDate(),
    month: d.toLocaleDateString('en-GB', { month: 'short' }),
  };
}

/** Every Sunday in the month containing `iso`. */
export function sundaysInMonth(iso: string): string[] {
  const d = fromISO(iso);
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  first.setDate(1 + ((7 - first.getDay()) % 7));
  const out: string[] = [];
  for (const x = first; x.getMonth() === d.getMonth(); x.setDate(x.getDate() + 7)) out.push(toISO(x));
  return out;
}

/** First Sunday of the month `delta` months away from the month containing `iso`. */
export function shiftMonth(iso: string, delta: number): string {
  const d = fromISO(iso);
  return sundaysInMonth(toISO(new Date(d.getFullYear(), d.getMonth() + delta, 1)))[0];
}

export function formatMonth(iso: string): string {
  return fromISO(iso).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}
