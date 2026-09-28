import { useState } from 'react';
import { ChevronLeft, ChevronRight, Copy, PenLine, UserMinus, X } from 'lucide-react';
import { addDays, formatLong, formatMonth, formatShort, shiftMonth, sundaysInMonth, upcomingSunday, weekLetter } from '../data/dates';
import { MAIN_SLOTS, SCHEDULE_ORDER, VT_SLOTS, WEEK_SLOTS, cellKey, slotLabel, slotsFor } from '../data/schedule';
import type { ScheduleService, SlotDef } from '../data/schedule';
import { actions, awayOn, canEdit, cell, isAway, meId, ministerById, previousReport, useStore } from '../data/store';
import { AGE_GROUPS } from '../data/types';
import type { AgeGroup, ServiceId, State } from '../data/types';
import { Handwritten, Legend, Pin } from './Marks';
import { Names } from './Names';
import { AwayEditor } from './AwayEditor';
import { SlotEditor, type SlotRef } from './SlotEditor';

const hasSchedule = (s: State, date: string) => Object.keys(s.schedule).some((k) => k.startsWith(`${date}|`));

function myRoles(s: State, date: string) {
  const me = meId(s);
  if (!me) return [];
  const out: string[] = [];
  for (const svc of [{ id: 'week' as const, label: '' }, ...SCHEDULE_ORDER]) {
    for (const slot of slotsFor(svc.id)) {
      if (cell(s, cellKey(date, svc.id, slot.key)).includes(me)) out.push(svc.id === 'week' ? slot.label : `${slotLabel(svc.id, slot.key)} at ${svc.label}`);
    }
  }
  return out;
}

function filled(s: State, date: string, service: ServiceId) {
  const slots = slotsFor(service);
  return { done: slots.filter((x) => cell(s, cellKey(date, service, x.key)).length).length, total: slots.length };
}

export function Schedule({ date: requested }: { date?: string }) {
  const s = useStore();
  const editor = canEdit(s);
  const today = upcomingSunday();
  const date = requested ?? today;
  const letter = weekLetter(date);
  const month = sundaysInMonth(date);
  const [editing, setEditing] = useState<SlotRef | null>(null);
  const [markingAway, setMarkingAway] = useState(false);
  const away = awayOn(s, date);
  // Slots holding someone who is away that Sunday.
  const clashes = Object.entries(s.schedule).filter(([k, v]) => k.startsWith(`${date}|`) && v.some((p) => isAway(s, p, date))).length;
  const me = meId(s);
  const meName = me ? (s.ministers.find((m) => m.id === me)?.name ?? null) : null;
  const roles = myRoles(s, date);
  const any = hasSchedule(s, date);
  const [service, setService] = useState<ServiceId>(() => SCHEDULE_ORDER.find((x) => roles.some((r) => r.endsWith(x.label)))?.id ?? '9');

  // Offer to start from the last Sunday with the same A/B letter that has a schedule.
  const copySource = !any && editor ? [1, 2, 3, 4, 5, 6].map((n) => addDays(date, -7 * n)).find((d) => weekLetter(d) === letter && hasSchedule(s, d)) : undefined;

  const slot = (svc: ScheduleService, def: SlotDef) => {
    const people = cell(s, cellKey(date, svc, def.key));
    const names = <Names people={people} sic={def.key === 'sic'} date={date} />;
    if (!editor) return names;
    return (
      <button type="button" className="slot-btn" onClick={() => setEditing({ date, service: svc, slot: def.key })} aria-label={`${slotLabel(svc, def.key)}, ${svc === 'week' ? 'this week' : SCHEDULE_ORDER.find((x) => x.id === svc)?.label}: ${people.length ? 'change' : 'assign'}`}>
        {names}
      </button>
    );
  };

  const roleLabel = (def: SlotDef) => (
    <th key="label" scope="row" className={`role ${def.key === 'sic' ? 'role-sic' : ''}`}>
      {def.label}
      {def.part && <span className="role-part">{def.part}</span>}
    </th>
  );

  const groups: (AgeGroup | undefined)[] = [undefined, 'LE', 'AS', 'ST'];
  const mainRows = (g: AgeGroup | undefined) => MAIN_SLOTS.filter((d) => d.group === g);
  const main = SCHEDULE_ORDER.filter((x) => x.id !== 'VT');

  const serviceFoot = (id: ServiceId) => {
    const prev = editor ? previousReport(s, id, date) : undefined;
    if (!prev) return null;
    return (
      <div className="svc-foot">
        <div className="carry">
          <Pin className="carry-pin" />
          <p className="carry-head">Action plans from {formatShort(prev.date)}</p>
          <Handwritten>{prev.actionPlans}</Handwritten>
        </div>
      </div>
    );
  };

  return (
    <div className="page">
      <nav className="month-bar" aria-label="Choose a Sunday">
        <div className="month-head">
          <a className="strip-arrow" href={`#/?date=${shiftMonth(date, -1)}`} aria-label="Previous month">
            <ChevronLeft size={22} aria-hidden="true" />
          </a>
          <h1 className="month-title">{formatMonth(date)}</h1>
          <a className="strip-arrow" href={`#/?date=${shiftMonth(date, 1)}`} aria-label="Next month">
            <ChevronRight size={22} aria-hidden="true" />
          </a>
        </div>
        <ol className="week-tabs" style={{ gridTemplateColumns: `repeat(${month.length}, 1fr)` }}>
          {month.map((d, i) => (
            <li key={d}>
              <a href={`#/?date=${d}`} className="sunday-tab" aria-current={d === date ? 'date' : undefined} aria-label={`Week ${i + 1}, ${formatLong(d)}, ${weekLetter(d)} week`}>
                <span className="st-week">Week {i + 1}</span>
                <span className="st-day">{formatShort(d)}</span>
                <span className="st-letter">{weekLetter(d)}</span>
                {d === today && <span className="st-today">This Sunday</span>}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <article className="sheet" key={date}>
        <Pin className="pin-l" />
        <Pin className="pin-r" />
        <header className="sheet-head">
          <div>
            <h2 className="sheet-title">{formatLong(date)}</h2>
            <p className="sheet-sub">
              Week {month.indexOf(date) + 1} of {formatMonth(date).split(' ')[0]}
              {date !== today && (
                <>
                  {' · '}
                  <a href="#/">Back to this Sunday</a>
                </>
              )}
            </p>
          </div>
          <div className="week-stamp" aria-label={`${letter} week`}>
            <span className="ws-letter">{letter}</span>
            <span className="ws-label">{letter === 'A' ? 'Odd' : 'Even'} week</span>
          </div>
        </header>

        {meName && me && isAway(s, me, date) ? (
          <Handwritten>{meName}, you’re marked away this Sunday.</Handwritten>
        ) : (
          meName &&
          any && (
            <Handwritten>
              {roles.length ? `${meName}: ${roles.join('; ')}.` : `${meName}, you’re not on the schedule this Sunday.`}
            </Handwritten>
          )
        )}

        {(away.length > 0 || editor) && (
          <section className="away" aria-labelledby="away-h">
            <h3 id="away-h" className="away-head">Away this Sunday</h3>
            {away.length ? (
              <ul className="away-list">
                {away.map((u) => (
                  <li key={u.id} className="away-item">
                    <span className="away-name">{ministerById(s, u.ministerId)?.name}</span>
                    {u.from !== u.to && (
                      <span className="away-range">
                        {formatShort(u.from)}–{formatShort(u.to)}
                      </span>
                    )}
                    {u.note && <span className="handwritten">{u.note}</span>}
                    {editor && (
                      <button type="button" className="icon-btn away-remove" onClick={() => void actions.removeAway(u.id).catch(() => {})} aria-label={`${ministerById(s, u.ministerId)?.name} isn’t away after all`}>
                        <X size={16} aria-hidden="true" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="away-none">Nobody.</p>
            )}
            {editor && clashes > 0 && (
              <p className="away-clash">
                {clashes === 1 ? '1 slot has' : `${clashes} slots have`} someone who’s away. They’re crossed out below.
              </p>
            )}
            {editor && (
              <button type="button" className="btn-quiet away-add" onClick={() => setMarkingAway(true)}>
                <UserMinus size={16} aria-hidden="true" /> Mark someone away
              </button>
            )}
          </section>
        )}

        {!any && (
          <div className="unscheduled">
            <p className="empty">No schedule for this Sunday yet.</p>
            {editor &&
              (copySource ? (
                <button type="button" className="btn-quiet" onClick={() => void actions.copySchedule(copySource, date).catch(() => {})}>
                  <Copy size={16} aria-hidden="true" /> Copy from {formatShort(copySource)} ({letter} week)
                </button>
              ) : (
                <Handwritten>Tap any slot below to start.</Handwritten>
              ))}
          </div>
        )}

        {(any || editor) && (
          <>
            <table className="week-prep">
              <tbody>
                {WEEK_SLOTS.map((def) => (
                  <tr key={def.key}>
                    {roleLabel(def)}
                    <td>
                      {slot('week', def)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Phone and tablet: one service at a time. */}
            <div className="by-service">
              <div className="segmented service-switch" role="radiogroup" aria-label="Service">
                {SCHEDULE_ORDER.map((x) => (
                  <label key={x.id}>
                    <input type="radio" name="svc" checked={service === x.id} onChange={() => setService(x.id)} />
                    <span>{x.id === 'VT' ? 'VT' : x.label}</span>
                  </label>
                ))}
              </div>
              {(() => {
                const svc = SCHEDULE_ORDER.find((x) => x.id === service)!;
                const f = filled(s, date, service);
                const rows = service === 'VT' ? [{ g: undefined, defs: VT_SLOTS }] : groups.map((g) => ({ g, defs: mainRows(g) }));
                return (
                  <>
                  <div className="sched-cap">
                    <span>
                      {svc.label} · {letter} week
                    </span>
                    <span className="fill-count">
                      {f.done} of {f.total} filled
                    </span>
                  </div>
                  <table className="sched sched-one">
                    {rows.map(({ g, defs }) => (
                      <tbody key={g ?? 'all'}>
                        {g && (
                          <tr className="group-row">
                            <th colSpan={2} scope="rowgroup">
                              {g} · {AGE_GROUPS[g]}
                            </th>
                          </tr>
                        )}
                        {defs.map((def) => (
                          <tr key={def.key}>
                            {roleLabel(def)}
                            <td>
                              {slot(service, def)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    ))}
                  </table>
                  </>
                );
              })()}
              {serviceFoot(service)}
            </div>

            {/* Desktop: the whole Sunday as one sheet, like the lead's spreadsheet. */}
            <div className="all-services">
              <div className="main-col">
              <table className="sched">
                <thead>
                  <tr>
                    <td />
                    {main.map((x) => {
                      const f = filled(s, date, x.id);
                      return (
                        <th key={x.id} scope="col">
                          {x.label}
                          <span className="fill-count">
                            {f.done}/{f.total}
                          </span>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                {groups.map((g) => (
                  <tbody key={g ?? 'all'}>
                    {g && (
                      <tr className="group-row">
                        <th colSpan={4} scope="rowgroup">
                          {g} · {AGE_GROUPS[g]}
                        </th>
                      </tr>
                    )}
                    {mainRows(g).map((def) => (
                      <tr key={def.key}>
                        {roleLabel(def)}
                        {main.map((x) => (
                          <td key={x.id}>
                            {slot(x.id, def)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                ))}
              </table>
              {main.some((x) => editor && previousReport(s, x.id, date)) && (
                <div className="carry-row">
                  <span />
                  {main.map((x) => (
                    <div key={x.id}>{serviceFoot(x.id)}</div>
                  ))}
                </div>
              )}
              </div>

              <div className="vt-col">
              <table className="sched sched-vt">
                <thead>
                  <tr>
                    <td />
                    <th scope="col">
                      VT · Voltage
                      <span className="fill-count">
                        11.00, own floor · {filled(s, date, 'VT').done}/{filled(s, date, 'VT').total}
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {VT_SLOTS.map((def) => (
                    <tr key={def.key}>
                      {roleLabel(def)}
                      <td>
                        {slot('VT', def)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {editor && previousReport(s, 'VT', date) && (
                <div className="carry-row carry-row-vt">
                  <span />
                  <div>{serviceFoot('VT')}</div>
                </div>
              )}
              </div>
            </div>
          </>
        )}

        <footer className="sheet-foot">
          {editor && (
            <>
              {/* Phone: the report for the service on screen. Desktop: choose the service in the editor. */}
              <a className="btn-primary show-phone" href={`#/reports/new?date=${date}&service=${service}`}>
                <PenLine size={18} aria-hidden="true" /> Write {SCHEDULE_ORDER.find((x) => x.id === service)!.id === 'VT' ? 'VT' : SCHEDULE_ORDER.find((x) => x.id === service)!.label} report
              </a>
              <a className="btn-primary show-desk" href={`#/reports/new?date=${date}`}>
                <PenLine size={18} aria-hidden="true" /> Write report
              </a>
            </>
          )}
          <Legend />
        </footer>
      </article>

      {editing && <SlotEditor at={editing} onClose={() => setEditing(null)} />}
      {markingAway && <AwayEditor date={date} onClose={() => setMarkingAway(false)} />}
    </div>
  );
}
