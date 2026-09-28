import { isAway, meId, ministerById, useStore } from '../data/store';
import { MarkedName } from './Marks';

/** The people in one schedule slot, marked the way the sheet marks them. */
export function Names({ people, sic, date }: { people: string[]; sic?: boolean; date: string }) {
  const s = useStore();
  const me = meId(s);
  if (!people.length) return <span className="slot-empty">—</span>;
  return (
    <span className="slot-names">
      {people.map((entry, i) => {
        const m = ministerById(s, entry);
        const away = !!m && isAway(s, m.id, date);
        return (
          <span key={entry} className={`slot-name ${away ? 'is-away' : ''}`}>
            <MarkedName name={m?.name ?? entry} sic={sic} isNew={m?.isNew} mine={!!me && entry === me} />
            {away && <span className="away-tag">away</span>}
            {i < people.length - 1 && <span className="sep">, </span>}
          </span>
        );
      })}
    </span>
  );
}
