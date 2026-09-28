import { useEffect, useRef, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { actions, useStore } from '../data/store';
import { AGE_GROUPS, SERVICES } from '../data/types';
import type { AgeGroup, ServiceId, WeekLetter } from '../data/types';

export interface Draft {
  placementId?: string;
  ministerId?: string;
  name: string;
  isNew: boolean;
  service: ServiceId;
  weeks: WeekLetter[];
  sic: boolean;
  ageGroup?: AgeGroup;
  note: string;
}

const WEEK_OPTIONS: { label: string; value: WeekLetter[] }[] = [
  { label: 'A only', value: ['A'] },
  { label: 'B only', value: ['B'] },
  { label: 'Both', value: ['A', 'B'] },
];

export function PlacementEditor({ draft, onClose }: { draft: Draft; onClose: () => void }) {
  const s = useStore();
  const ref = useRef<HTMLDialogElement>(null);
  const [d, setD] = useState(draft);
  const [error, setError] = useState('');
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));
  const editing = !!d.placementId;

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const name = d.name.trim();
    if (!name) return setError('Write the minister’s name.');
    const known = d.ministerId ?? s.ministers.find((m) => m.name.toLowerCase() === name.toLowerCase())?.id;
    const dupe = known && s.placements.find((p) => p.ministerId === known && p.service === d.service && p.id !== d.placementId);
    if (dupe) return setError(`${name} is already on ${SERVICES.find((x) => x.id === d.service)!.label}. Edit that entry instead.`);
    setBusy(true);
    setError('');
    try {
      const ministerId = known ?? (await actions.addMinister(name, d.isNew)).id;
      const m = s.ministers.find((x) => x.id === ministerId);
      if (!m || m.name !== name || m.isNew !== d.isNew) await actions.updateMinister(ministerId, { name, isNew: d.isNew });
      // Send an explicit null so clearing the age group or note sticks.
      const fields = { ministerId, service: d.service, weeks: d.weeks, sic: d.sic, ageGroup: d.service === 'VT' ? undefined : d.ageGroup, note: d.note.trim() };
      if (d.placementId) await actions.updatePlacement(d.placementId, { ...fields, ageGroup: fields.ageGroup ?? (null as never) });
      else await actions.addPlacement(fields);
      ref.current?.close();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  const remove = async () => {
    if (d.placementId) await actions.removePlacement(d.placementId).catch(() => {});
    ref.current?.close();
  };

  return (
    <dialog ref={ref} className="sheet editor" onClose={onClose} onClick={(e) => e.target === e.currentTarget && ref.current?.close()} aria-labelledby="ed-title">
      <form onSubmit={(e) => void submit(e)}>
        <header className="editor-head">
          <h2 id="ed-title" className="section-head">{editing ? `Edit ${draft.name}` : 'Add to the grouping'}</h2>
          <button type="button" className="icon-btn" onClick={() => ref.current?.close()} aria-label="Close">
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <label className="field">
          <span>Name</span>
          <input value={d.name} onChange={(e) => set('name', e.target.value)} list={editing ? undefined : 'minister-names'} autoComplete="off" autoFocus={!editing} />
          {!editing && (
            <datalist id="minister-names">
              {s.ministers.map((m) => (
                <option key={m.id} value={m.name} />
              ))}
            </datalist>
          )}
        </label>

        <fieldset className="field">
          <legend>Service</legend>
          <div className="segmented">
            {SERVICES.map((sv) => (
              <label key={sv.id}>
                <input type="radio" name="service" checked={d.service === sv.id} onChange={() => set('service', sv.id)} />
                <span>{sv.id === 'VT' ? 'VT' : sv.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="field">
          <legend>Weeks</legend>
          <div className="segmented">
            {WEEK_OPTIONS.map((o) => (
              <label key={o.label}>
                <input type="radio" name="weeks" checked={d.weeks.join('') === o.value.join('')} onChange={() => set('weeks', o.value)} />
                <span>{o.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {d.service !== 'VT' && (
          <fieldset className="field">
            <legend>Age group</legend>
            <div className="segmented">
              <label>
                <input type="radio" name="age" checked={!d.ageGroup} onChange={() => set('ageGroup', undefined)} />
                <span>None</span>
              </label>
              {(Object.keys(AGE_GROUPS) as AgeGroup[]).map((g) => (
                <label key={g} title={AGE_GROUPS[g]}>
                  <input type="radio" name="age" checked={d.ageGroup === g} onChange={() => set('ageGroup', g)} />
                  <span>{g}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <div className="checks">
          <label className="check">
            <input type="checkbox" checked={d.sic} onChange={(e) => set('sic', e.target.checked)} />
            <span className="name hl-sic">Service in Charge</span>
          </label>
          <label className="check">
            <input type="checkbox" checked={d.isNew} onChange={(e) => set('isNew', e.target.checked)} />
            <span className="name hl-new">New minister</span>
          </label>
        </div>

        <label className="field">
          <span>Note</span>
          <input className="handwritten-input" value={d.note} onChange={(e) => set('note', e.target.value)} placeholder="e.g. 1st week only, Sept–Dec" />
        </label>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <div className="dialog-actions">
          {editing && (
            <button type="button" className="btn-quiet btn-left" onClick={() => void remove()}>
              Remove from grouping
            </button>
          )}
          <button type="button" className="btn-quiet" onClick={() => ref.current?.close()}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={busy}>
            {editing ? 'Save' : 'Add'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
