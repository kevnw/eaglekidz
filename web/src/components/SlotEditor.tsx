import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Check, ChevronDown, Plus, X } from 'lucide-react';
import { formatLong, weekLetter } from '../data/dates';
import { actions, cell, personName, useStore } from '../data/store';
import { SCHEDULE_ORDER, cellKey, slotLabel } from '../data/schedule';
import type { ScheduleService } from '../data/schedule';

export interface SlotRef {
  date: string;
  service: ScheduleService;
  slot: string;
}

export function SlotEditor({ at, onClose }: { at: SlotRef; onClose: () => void }) {
  const s = useStore();
  const ref = useRef<HTMLDialogElement>(null);
  const [guest, setGuest] = useState('');
  const key = cellKey(at.date, at.service, at.slot);
  const people = cell(s, key);
  const letter = weekLetter(at.date);
  const serviceLabel = at.service === 'week' ? 'This week' : SCHEDULE_ORDER.find((x) => x.id === at.service)!.label;

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  // The service's own team for this week comes first; everyone else is one tap further.
  const team =
    at.service === 'week'
      ? []
      : s.placements
          .filter((p) => p.service === at.service && p.weeks.includes(letter))
          .sort((a, b) => Number(b.sic) - Number(a.sic) || a.order - b.order)
          .map((p) => p.ministerId);
  const others = s.ministers
    .filter((m) => !team.includes(m.id))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((m) => m.id);
  const guests = people.filter((p) => !s.ministers.some((m) => m.id === p));

  const toggle = (id: string) => {
    void actions.setCell(key, people.includes(id) ? people.filter((x) => x !== id) : [...people, id]).catch(() => {});
  };
  const addGuest = (e: FormEvent) => {
    e.preventDefault();
    const name = guest.trim();
    if (!name) return;
    const match = s.ministers.find((m) => m.name.toLowerCase() === name.toLowerCase());
    const entry = match?.id ?? name;
    if (!people.includes(entry)) void actions.setCell(key, [...people, entry]).catch(() => {});
    setGuest('');
  };

  const option = (id: string) => {
    const on = people.includes(id);
    return (
      <button key={id} type="button" className="pick" aria-pressed={on} onClick={() => toggle(id)}>
        {on ? <Check size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
        {personName(s, id)}
      </button>
    );
  };

  return (
    <dialog ref={ref} className="sheet editor" onClose={onClose} onClick={(e) => e.target === e.currentTarget && ref.current?.close()} aria-labelledby="slot-title">
      <header className="editor-head">
        <div>
          <h2 id="slot-title" className="section-head">
            {slotLabel(at.service, at.slot)} · {serviceLabel}
          </h2>
          <p className="editor-sub">
            {formatLong(at.date)}, {letter} week
          </p>
        </div>
        <button type="button" className="icon-btn" onClick={() => ref.current?.close()} aria-label="Close">
          <X size={20} aria-hidden="true" />
        </button>
      </header>

      {team.length > 0 && (
        <section className="pick-group">
          <h3 className="field-label">{serviceLabel} team, {letter} week</h3>
          <div className="picks">
            {team.map(option)}
          </div>
        </section>
      )}

      <details className="pick-group" open={team.length === 0}>
        <summary className="field-label">
          {team.length ? 'Everyone else' : 'Ministers'} <ChevronDown size={16} aria-hidden="true" className="summary-chevron" />
        </summary>
        <div className="picks">
          {others.map(option)}
        </div>
      </details>

      <form className="guest" onSubmit={addGuest}>
        <label className="field">
          <span>Someone not on the list</span>
          <input value={guest} onChange={(e) => setGuest(e.target.value)} placeholder="e.g. PS Inge" autoComplete="off" />
        </label>
        <button type="submit" className="btn-quiet">
          Add
        </button>
      </form>
      {guests.length > 0 && (
        <div className="picks">
          {guests.map(option)}
        </div>
      )}

      <div className="dialog-actions">
        {people.length > 0 && (
          <button type="button" className="btn-quiet btn-left" onClick={() => void actions.setCell(key, []).catch(() => {})}>
            Clear slot
          </button>
        )}
        <button type="button" className="btn-primary" onClick={() => ref.current?.close()}>
          Done
        </button>
      </div>
    </dialog>
  );
}
