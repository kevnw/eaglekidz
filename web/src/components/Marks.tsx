import type { ReactNode } from 'react';
import type { AgeGroup } from '../data/types';
import { AGE_GROUPS } from '../data/types';

/** A name the way the lead marks it on the sheet: yellow for SIC, blue for new ministers. */
export function MarkedName({ name, sic, isNew, mine }: { name: string; sic?: boolean; isNew?: boolean; mine?: boolean }) {
  const cls = ['name', sic && 'hl-sic', isNew && !sic && 'hl-new', isNew && sic && 'hl-both'].filter(Boolean).join(' ');
  return (
    <span className={cls}>
      {name}
      {mine && <BallpointCircle />}
    </span>
  );
}

export function AgeTag({ group }: { group: AgeGroup }) {
  return (
    <abbr className="age-tag" title={AGE_GROUPS[group]}>
      {group}
    </abbr>
  );
}

/** Hand-drawn ring around the viewer's own name. */
export function BallpointCircle() {
  return (
    <svg className="ballpoint-ring" viewBox="0 0 120 44" preserveAspectRatio="none" aria-hidden="true">
      <path
        d="M9 25C6 13 34 5 62 5c30 0 55 6 54 18-1 12-27 17-56 17C31 40 7 35 5 24 4 16 17 9 33 7"
      />
    </svg>
  );
}

export function Pin({ className = '' }: { className?: string }) {
  return (
    <svg className={`pin ${className}`} viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="10" r="7" />
      <circle cx="7.5" cy="7.5" r="2" className="pin-shine" />
    </svg>
  );
}

export function Legend() {
  return (
    <p className="legend">
      <span className="name hl-sic">SIC</span>
      <span className="name hl-new">New minister</span>
      <span className="legend-ages">
        {(Object.keys(AGE_GROUPS) as AgeGroup[]).map((g) => (
          <span key={g}>
            <AgeTag group={g} /> {AGE_GROUPS[g]}
          </span>
        ))}
      </span>
    </p>
  );
}

export function Handwritten({ children, as: Tag = 'p' }: { children: ReactNode; as?: 'p' | 'span' }) {
  return <Tag className="handwritten">{children}</Tag>;
}
