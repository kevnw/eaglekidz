import { seedSchedule } from './scheduleSeed';
import type { AgeGroup, Minister, Placement, ServiceId, WeekLetter } from './types';

// The ministry's current grouping, transcribed from the lead's spreadsheet.
type Row = [name: string, weeks: 'A' | 'B' | 'AB', opts?: { sic?: boolean; isNew?: boolean; age?: AgeGroup; note?: string }];

const GROUPING: Record<ServiceId, Row[]> = {
  VT: [
    ['Bella', 'AB', { sic: true }],
    ['Feilin', 'AB'],
    ['Lucas', 'AB'],
    ['Kevin W', 'AB'],
    ['Nathan', 'A'],
    ['Jeremy', 'B'],
    ['Stella', 'A', { isNew: true }],
    ['Aurel', 'B'],
    ['Caroline', 'B'],
  ],
  '9': [
    ['Dewina', 'AB', { sic: true }],
    ['Kevin T', 'AB', { sic: true, age: 'ST' }],
    ['Wesly', 'AB', { isNew: true, age: 'AS' }],
    ['Karlin', 'A'],
    ['Berlin', 'B'],
    ['Kimberly', 'A'],
  ],
  '11': [
    ['Elvina', 'AB', { sic: true }],
    ['Calista', 'AB', { sic: true }],
    ['Hanna', 'AB', { isNew: true }],
    ['Grace', 'A', { sic: true }],
    ['Victoria', 'A'],
    ['Jeslyn', 'B'],
    ['Valerie', 'A'],
    ['Bella L', 'B'],
    ['Claudia', 'B'],
    ['Yenny', 'A', { note: '1st week only, Sept–Dec' }],
  ],
  '1': [
    ['Jasper', 'AB', { isNew: true, age: 'ST' }],
    ['Carissa', 'AB'],
    ['Fiona', 'A', { sic: true }],
    ['Rosmina', 'B', { sic: true }],
    ['Jessica', 'A'],
    ['Hanny', 'B'],
    ['Nicole', 'A'],
  ],
};

/** On the minister list without a current slot. */
const UNPLACED = ['Vhionel'];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

export function seedState() {
  const ministers: Minister[] = [];
  const placements: Placement[] = [];
  for (const [service, rows] of Object.entries(GROUPING) as [ServiceId, Row[]][]) {
    rows.forEach(([name, weeks, opts = {}], i) => {
      const id = slug(name);
      if (!ministers.some((m) => m.id === id)) ministers.push({ id, name, isNew: !!opts.isNew });
      placements.push({
        id: `${service}-${id}`,
        ministerId: id,
        service,
        weeks: weeks.split('') as WeekLetter[],
        sic: !!opts.sic,
        ageGroup: opts.age,
        note: opts.note,
        order: i,
      });
    });
  }
  for (const name of UNPLACED) ministers.push({ id: slug(name), name, isNew: false });

  const byName = new Map(ministers.map((m) => [m.name.toLowerCase(), m.id]));
  const schedule = seedSchedule((name) => byName.get(name.toLowerCase()) ?? name);

  return { ministers, placements, schedule };
}
