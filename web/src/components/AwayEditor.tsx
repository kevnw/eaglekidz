import { useEffect, useRef, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { addDays, formatLong, weekLetter } from '../data/dates';
import { actions, useStore } from '../data/store';

export function AwayEditor({ date, onClose }: { date: string; onClose: () => void }) {
  const s = useStore();
  const ref = useRef<HTMLDialogElement>(null);
  const [ministerId, setMinisterId] = useState('');
  const [from, setFrom] = useState(date);
  const [to, setTo] = useState(date);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const sundays = Array.from({ length: 30 }, (_, i) => addDays(date, (i - 4) * 7));
  const ministers = [...s.ministers].sort((a, b) => a.name.localeCompare(b.name));

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!ministerId) return setError('Choose who is away.');
    setBusy(true);
    setError('');
    try {
      await actions.markAway({ ministerId, from, to: to < from ? from : to, note: note.trim() || undefined });
      ref.current?.close();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  const option = (d: string) => (
    <option key={d} value={d}>
      {formatLong(d)} ({weekLetter(d)})
    </option>
  );

  return (
    <dialog ref={ref} className="sheet editor" onClose={onClose} onClick={(e) => e.target === e.currentTarget && ref.current?.close()} aria-labelledby="away-title">
      <form onSubmit={(e) => void submit(e)}>
        <header className="editor-head">
          <div>
            <h2 id="away-title" className="section-head">Mark someone away</h2>
            <p className="editor-sub">They’ll show as away on the schedule, and can’t be picked for a slot on those Sundays.</p>
          </div>
          <button type="button" className="icon-btn" onClick={() => ref.current?.close()} aria-label="Close">
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <label className="field">
          <span>Who</span>
          <select value={ministerId} onChange={(e) => setMinisterId(e.target.value)} autoFocus>
            <option value="">Choose a minister</option>
            {ministers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>

        <div className="field-pair">
          <label className="field">
            <span>From</span>
            <select
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                if (to < e.target.value) setTo(e.target.value);
              }}
            >
              {sundays.map(option)}
            </select>
          </label>
          <label className="field">
            <span>Until</span>
            <select value={to} onChange={(e) => setTo(e.target.value)}>
              {sundays.filter((d) => d >= from).map(option)}
            </select>
          </label>
        </div>

        <label className="field">
          <span>Note (only editors see this)</span>
          <input className="handwritten-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. travelling" maxLength={200} />
        </label>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <div className="dialog-actions">
          <button type="button" className="btn-quiet" onClick={() => ref.current?.close()}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={busy}>
            Mark away
          </button>
        </div>
      </form>
    </dialog>
  );
}
