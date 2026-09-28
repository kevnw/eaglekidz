import { useState, type FormEvent } from 'react';
import { ArrowLeft } from 'lucide-react';
import { addDays, formatLong, formatShort, upcomingSunday, weekLetter } from '../data/dates';
import { actions, useStore } from '../data/store';
import { SCHEDULE_ORDER } from '../data/schedule';
import { SERVICES } from '../data/types';
import type { ServiceId } from '../data/types';
import { go } from '../router';
import { Pin } from './Marks';
import { lastSunday } from './Reports';

const SECTIONS = [
  { key: 'wentWell', label: 'What went well' },
  { key: 'canImprove', label: 'What can be improved' },
  { key: 'actionPlans', label: 'Action plans', hint: 'One per line. These show on the rota for this service next time.' },
] as const;

type Fields = { date: string; service: ServiceId; wentWell: string; canImprove: string; actionPlans: string };

export function ReportEditor({ id, date, service }: { id?: string; date?: string; service?: string }) {
  const s = useStore();
  const existing = id ? s.reports.find((r) => r.id === id) : undefined;
  const [f, setF] = useState<Fields>(() => ({
    date: existing?.date ?? date ?? lastSunday(),
    service: existing?.service ?? ((SERVICES.some((x) => x.id === service) ? service : '9') as ServiceId),
    wentWell: existing?.wentWell ?? '',
    canImprove: existing?.canImprove ?? '',
    actionPlans: existing?.actionPlans ?? '',
  }));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (id && !existing) {
    return (
      <div className="page">
        <article className="sheet">
          <h1 className="sheet-title">Report not found</h1>
          <p>It may have been deleted. <a href="#/reports">Back to reports</a></p>
        </article>
      </div>
    );
  }

  const clash = s.reports.find((r) => r.date === f.date && r.service === f.service && r.id !== existing?.id);
  const next = upcomingSunday();
  const sundays = Array.from({ length: 10 }, (_, i) => addDays(next, -i * 7));
  if (!sundays.includes(f.date)) sundays.push(f.date);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (clash) return setError('There’s already a report for this service on this Sunday. Open that one instead.');
    if (!f.wentWell.trim() && !f.canImprove.trim() && !f.actionPlans.trim()) return setError('Write at least one section before saving.');
    setBusy(true);
    try {
      await actions.saveReport({ id: existing?.id, ...f });
      go('/reports');
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  const remove = async () => {
    if (existing && confirm('Delete this report? This can’t be undone.')) {
      await actions.deleteReport(existing.id).catch(() => {});
      go('/reports');
    }
  };

  return (
    <div className="page">
      <a href="#/reports" className="back-link">
        <ArrowLeft size={18} aria-hidden="true" /> Reports
      </a>
      <article className="sheet lined-sheet">
        <Pin className="pin-l" />
        <Pin className="pin-r" />
        <form onSubmit={(e) => void submit(e)}>
          <header className="sheet-head">
            <h1 className="sheet-title">{existing ? 'Report' : 'New report'}</h1>
          </header>

          <div className="report-meta">
            <label className="field">
              <span>Sunday</span>
              <select value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })}>
                {sundays.sort((a, b) => b.localeCompare(a)).map((d) => (
                  <option key={d} value={d}>
                    {formatLong(d)} ({weekLetter(d)} week)
                  </option>
                ))}
              </select>
            </label>
            <fieldset className="field">
              <legend>Service</legend>
              <div className="segmented">
                {SCHEDULE_ORDER.map((sv) => (
                  <label key={sv.id}>
                    <input type="radio" name="service" checked={f.service === sv.id} onChange={() => setF({ ...f, service: sv.id })} />
                    <span>{sv.id === 'VT' ? 'VT' : sv.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          {clash && (
            <p className="error" role="alert">
              {SERVICES.find((x) => x.id === f.service)!.label} on {formatShort(f.date)} already has a report. <a href={`#/reports/${clash.id}`}>Open it</a>
            </p>
          )}

          {SECTIONS.map((sec) => (
            <label key={sec.key} className="lined-field">
              <span className="lined-label">{sec.label}</span>
              {'hint' in sec && <span className="lined-hint">{sec.hint}</span>}
              <textarea value={f[sec.key]} onChange={(e) => setF({ ...f, [sec.key]: e.target.value })} rows={4} />
            </label>
          ))}

          {error && !clash && (
            <p className="error" role="alert">
              {error}
            </p>
          )}

          <div className="dialog-actions">
            {existing && (
              <button type="button" className="btn-quiet btn-left" onClick={() => void remove()}>
                Delete
              </button>
            )}
            <a className="btn-quiet" href="#/reports">
              Cancel
            </a>
            <button type="submit" className="btn-primary" disabled={!!clash || busy}>
              Save report
            </button>
          </div>
        </form>
      </article>
    </div>
  );
}
