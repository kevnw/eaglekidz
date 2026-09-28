import { useState, type CSSProperties } from 'react';
import { Plus, UserPlus } from 'lucide-react';
import { meId, ministerById, placementsFor, unplaced, useStore } from '../data/store';
import { SERVICES } from '../data/types';
import type { Placement, ServiceId, WeekLetter } from '../data/types';
import { AgeTag, Handwritten, Legend, MarkedName, Pin } from './Marks';
import { PlacementEditor, type Draft } from './PlacementEditor';

/** Lay a service out like the sheet: both-week names span a full row, then A and B side by side. */
function rowsFor(ps: Placement[]): (Placement | null)[][] {
  const both = ps.filter((p) => p.weeks.length === 2);
  const a = ps.filter((p) => p.weeks.length === 1 && p.weeks[0] === 'A');
  const b = ps.filter((p) => p.weeks.length === 1 && p.weeks[0] === 'B');
  const pairs = Array.from({ length: Math.max(a.length, b.length) }, (_, i) => [a[i] ?? null, b[i] ?? null]);
  return [...both.map((p) => [p]), ...pairs];
}

/** Grid position on the desktop sheet, where all services share one set of rows. */
const at = (row: number, col: number, span = 1) => ({ '--r': row, '--c': col, '--s': span }) as CSSProperties;

const weekClass = (w: WeekLetter[]) => (w.length === 2 ? 'span-both' : w[0] === 'A' ? 'col-a' : 'col-b');

export function Grouping() {
  const s = useStore();
  const [draft, setDraft] = useState<Draft | null>(null);
  const loose = unplaced(s);
  // Pad every service to the tallest one so the grouping reads as one ruled sheet.
  const tallest = Math.max(...SERVICES.map((sv) => rowsFor(placementsFor(s, sv.id)).length));

  const openPlacement = (p: Placement) => {
    const m = ministerById(s, p.ministerId)!;
    setDraft({ placementId: p.id, ministerId: m.id, name: m.name, isNew: m.isNew, service: p.service, weeks: p.weeks, sic: p.sic, ageGroup: p.ageGroup, note: p.note ?? '' });
  };
  const openNew = (service: ServiceId, weeks: WeekLetter[], ministerId?: string) => {
    const m = ministerId ? ministerById(s, ministerId) : undefined;
    setDraft({ ministerId, name: m?.name ?? '', isNew: m?.isNew ?? false, service, weeks, sic: false, note: '' });
  };

  return (
    <div className="page">
      <article className="sheet grouping-sheet">
        <Pin className="pin-l" />
        <Pin className="pin-r" />
        <header className="sheet-head">
          <div>
            <h1 className="sheet-title">Grouping</h1>
            <p className="sheet-sub">
              <strong>A</strong> = odd weeks (1st, 3rd, 5th Sunday) · <strong>B</strong> = even weeks (2nd, 4th Sunday). Tap a name to change it.
            </p>
          </div>
        </header>

        <div className="grouping-grid">
          {SERVICES.map((sv, si) => {
            const ps = placementsFor(s, sv.id);
            const count = ps.length;
            const c = si * 2 + 1;
            const rows = rowsFor(ps);
            return (
              <section key={sv.id} className="group-block" aria-labelledby={`g-${sv.id}`}>
                <h2 id={`g-${sv.id}`} className="group-head span-both" style={at(1, c, 2)}>
                  {sv.id === 'VT' ? 'VT · Voltage' : sv.label}
                </h2>
                <span className="group-sub col-a" style={at(2, c)}>{sv.short}-A</span>
                <span className="group-sub col-b" style={at(2, c + 1)}>{sv.short}-B</span>
                {[...rows, ...Array.from({ length: tallest - rows.length }, () => [null, null])].map((row, i) =>
                  row.map((p, j) => {
                    if (!p) return <span key={`${i}-${j}`} className={`cell cell-empty ${j ? 'col-b' : 'col-a'}`} style={at(i + 3, c + j)} />;
                    const m = ministerById(s, p.ministerId);
                    if (!m) return null;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        className={`cell ${weekClass(p.weeks)}`}
                        style={at(i + 3, p.weeks.length === 2 ? c : p.weeks[0] === 'A' ? c : c + 1, p.weeks.length === 2 ? 2 : 1)}
                        onClick={() => openPlacement(p)}
                      >
                        <MarkedName name={m.name} sic={p.sic} isNew={m.isNew} mine={meId(s) === m.id} />
                        {p.ageGroup && <AgeTag group={p.ageGroup} />}
                        {p.note && <Handwritten as="span">{p.note}</Handwritten>}
                      </button>
                    );
                  }),
                )}
                <button type="button" className="cell cell-add col-a" style={at(tallest + 3, c)} onClick={() => openNew(sv.id, ['A'])}>
                  <Plus size={16} aria-hidden="true" /> Add to {sv.short}-A
                </button>
                <button type="button" className="cell cell-add col-b" style={at(tallest + 3, c + 1)} onClick={() => openNew(sv.id, ['B'])}>
                  <Plus size={16} aria-hidden="true" /> Add to {sv.short}-B
                </button>
                <span className="group-count span-both" style={at(tallest + 4, c, 2)}>{count} ministers</span>
              </section>
            );
          })}
        </div>

        <section className="loose" aria-labelledby="loose-h">
          <h2 id="loose-h" className="section-head">On the minister list, not in the grouping</h2>
          {loose.length ? (
            <ul className="loose-list">
              {loose.map((m) => (
                <li key={m.id}>
                  <button type="button" className="loose-chip" onClick={() => openNew('VT', ['A', 'B'], m.id)}>
                    <UserPlus size={16} aria-hidden="true" /> {m.name}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty">Everyone on the list has a place in the grouping.</p>
          )}
        </section>

        <footer className="sheet-foot">
          <Legend />

        </footer>
      </article>

      {draft && <PlacementEditor draft={draft} onClose={() => setDraft(null)} />}


    </div>
  );
}
