export type ServiceId = 'VT' | '9' | '11' | '1';
export type WeekLetter = 'A' | 'B';
export type AgeGroup = 'LE' | 'AS' | 'ST';

export interface ServiceInfo {
  id: ServiceId;
  label: string;
  short: string;
  floor?: string;
}

export const SERVICES: ServiceInfo[] = [
  { id: 'VT', label: 'Voltage', short: 'VT', floor: 'Own floor' },
  { id: '9', label: '9 AM', short: '9' },
  { id: '11', label: '11 AM', short: '11' },
  { id: '1', label: '1 PM', short: '1' },
];

export const AGE_GROUPS: Record<AgeGroup, string> = {
  LE: 'Little Eagle',
  AS: 'All Stars',
  ST: 'Super Trooper',
};

export interface Minister {
  id: string;
  name: string;
  isNew: boolean;
}

/** One slot in the grouping: a minister on a service, for A weeks, B weeks, or both. */
export interface Placement {
  id: string;
  ministerId: string;
  service: ServiceId;
  weeks: WeekLetter[];
  sic: boolean;
  ageGroup?: AgeGroup;
  note?: string;
  order: number;
}

export interface Report {
  id: string;
  date: string;
  service: ServiceId;
  wentWell: string;
  canImprove: string;
  actionPlans: string;
  updatedAt: string;
}

export interface Session {
  role: 'lead' | 'sic';
  name: string;
  /** The signed-in person's minister record, when they're on the list. */
  ministerId: string | null;
}

export interface State {
  ministers: Minister[];
  placements: Placement[];
  reports: Report[];
  /** Weekly schedule: `date|service|slot` → minister ids, or a plain name for someone outside the list. */
  schedule: Record<string, string[]>;
  session: Session | null;
  /** "Who are you?" pick for people who aren't signed in; kept in this browser only. */
  viewerId: string | null;
  status: 'loading' | 'ready' | 'error';
  error: string | null;
}
