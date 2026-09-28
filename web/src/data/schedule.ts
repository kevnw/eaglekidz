import type { AgeGroup, ServiceId } from './types';

export type ScheduleService = ServiceId | 'week';

export interface SlotDef {
  key: string;
  label: string;
  group?: AgeGroup;
  /** Production or Crowd, as on the sheet. */
  part?: 'Production' | 'Crowd';
  multi?: boolean;
}

export const WEEK_SLOTS: SlotDef[] = [
  { key: 'prep-leas', label: 'Prepare activity LE/AS' },
  { key: 'prep-st', label: 'Prepare activity ST' },
];

const groupSlots = (g: AgeGroup): SlotDef[] => [
  { key: `${g}.sermon`, label: 'Sermon', group: g, part: 'Production' },
  { key: `${g}.activity`, label: 'Activity', group: g, part: 'Production' },
  { key: `${g}.crowd`, label: 'Ka’ Pendamping', group: g, part: 'Crowd' },
];

export const MAIN_SLOTS: SlotDef[] = [
  { key: 'sic', label: 'SIC' },
  { key: 'paw', label: 'PAW' },
  { key: 'host', label: 'Host' },
  { key: 'mulmed', label: 'Mulmed' },
  { key: 'usher', label: 'Usher' },
  ...groupSlots('LE'),
  ...groupSlots('AS'),
  ...groupSlots('ST'),
];

export const VT_SLOTS: SlotDef[] = [
  { key: 'sic', label: 'SIC' },
  { key: 'host', label: 'Host' },
  { key: 'sermon', label: 'Sermon', part: 'Production' },
  { key: 'mulmed', label: 'Mulmed', part: 'Production' },
  { key: 'sm', label: 'SM', part: 'Production' },
  { key: 'usher', label: 'Usher', part: 'Crowd' },
  { key: 'crowd', label: 'Ka’ Pendamping', part: 'Crowd', multi: true },
];

export const slotsFor = (service: ScheduleService) => (service === 'week' ? WEEK_SLOTS : service === 'VT' ? VT_SLOTS : MAIN_SLOTS);

/** Schedule column order, as on the weekly sheet. VT runs alongside 11.00 on its own floor. */
export const SCHEDULE_ORDER: { id: ServiceId; label: string; time: string }[] = [
  { id: '9', label: '9 AM', time: '09.00' },
  { id: '11', label: '11 AM', time: '11.00' },
  { id: '1', label: '1 PM', time: '13.00' },
  { id: 'VT', label: 'VT · Voltage', time: '11.00' },
];

export const cellKey = (date: string, service: ScheduleService, slot: string) => `${date}|${service}|${slot}`;

export function slotLabel(service: ScheduleService, slot: string) {
  const def = slotsFor(service).find((s) => s.key === slot);
  if (!def) return slot;
  return def.group ? `${def.group} ${def.label}` : def.label;
}
