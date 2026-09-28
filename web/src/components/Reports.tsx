import { PenLine } from 'lucide-react';
import { addDays, formatLong, upcomingSunday, weekLetter } from '../data/dates';
import { SCHEDULE_ORDER } from '../data/schedule';
import { useStore } from '../data/store';
import { Pin } from './Marks';

/** Most recent Sunday that has already happened (or today, if it's Sunday). */
export function lastSunday() {
  const next = upcomingSunday();
  return new Date().getDay() === 0 ? next : addDays(next, -7);
}

export function Reports() {
  const s = useStore();
  const latest = lastSunday();
  const dates = [...new Set([latest, ...s.reports.map((r) => r.date)])].sort((a, b) => b.localeCompare(a));

  return (
    <div className="page">
      <article className="sheet reports-sheet">
        <Pin className="pin-l" />
        <Pin className="pin-r" />
        <header className="sheet-head">
          <div>
            <h1 className="sheet-title">Reports</h1>
            <p className="sheet-sub">One per service each Sunday: what went well, what can be improved, and the action plans. Action plans show on the schedule for that service the next time.</p>
          </div>
          <a className="btn-primary" href={`#/reports/new?date=${latest}`}>
            <PenLine size={18} aria-hidden="true" /> Write report
          </a>
        </header>

        {dates.map((date) => (
          <section key={date} className="report-day" aria-labelledby={`d-${date}`}>
            <h2 id={`d-${date}`} className="day-head">
              {formatLong(date)} <span className="day-letter">{weekLetter(date)} week</span>
            </h2>
            <div className="report-row">
              {SCHEDULE_ORDER.map((svc) => {
                const r = s.reports.find((x) => x.date === date && x.service === svc.id);
                return r ? (
                  <a key={svc.id} href={`#/reports/${r.id}`} className="report-slot report-card">
                    <span className="rc-service">{svc.label}</span>
                    <dl className="rc-body">
                      <dt>Went well</dt>
                      <dd>{r.wentWell || '—'}</dd>
                      <dt>Can improve</dt>
                      <dd>{r.canImprove || '—'}</dd>
                      <dt>Action plans</dt>
                      <dd className="handwritten">{r.actionPlans || '—'}</dd>
                    </dl>
                  </a>
                ) : (
                  <div key={svc.id} className="report-slot report-missing">
                    <span className="rc-service">{svc.label}</span>
                    <a className="text-link" href={`#/reports/new?date=${date}&service=${svc.id}`}>
                      <PenLine size={16} aria-hidden="true" /> Write one
                    </a>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </article>
    </div>
  );
}
