import { useState, type ReactNode } from 'react';
import { CalendarDays, ClipboardList, KeyRound, LogIn, LogOut, NotebookPen, X } from 'lucide-react';
import { actions, canEdit, isLead, useStore } from '../data/store';
import type { Route } from '../router';
import { SignIn } from './SignIn';

const ALL_TABS = [
  { key: 'schedule', href: '#/', label: 'Schedule', Icon: CalendarDays, who: 'all' },
  { key: 'grouping', href: '#/grouping', label: 'Grouping', Icon: ClipboardList, who: 'editor' },
  { key: 'reports', href: '#/reports', label: 'Reports', Icon: NotebookPen, who: 'editor' },
  { key: 'access', href: '#/access', label: 'Access', Icon: KeyRound, who: 'lead' },
] as const;

function activeTab(route: Route) {
  if (route.name === 'report' || route.name === 'new-report') return 'reports';
  return route.name;
}

export function Shell({ route, children }: { route: Route; children: ReactNode }) {
  const s = useStore();
  const [signingIn, setSigningIn] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const active = activeTab(route);
  const tabs = ALL_TABS.filter((t) => t.who === 'all' || (t.who === 'editor' && canEdit(s)) || (t.who === 'lead' && isLead(s)));
  const ministers = [...s.ministers].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className={`board ${drawing ? 'drawing' : ''}`}>
      <header className="cork-bar">
        <a href="#/" className="logo-card" aria-label="Eagle Kidz schedule">
          <img src="/eagle-kidz.jpg" alt="Eagle Kidz" width={643} height={335} />
        </a>
        {tabs.length > 1 && (
          <nav className="tabs-top" aria-label="Main">
            {tabs.map(({ key, href, label }) => (
              <a key={key} href={href} className="tab-top" aria-current={active === key ? 'page' : undefined}>
                {label}
              </a>
            ))}
          </nav>
        )}
        <div className="account">
          {s.session ? (
            <>
              <span className="signed-in">
                <span className="signed-in-role">Signed in{s.session.role === 'sic' ? ' · SIC' : ''}</span>
                <span className="signed-in-name">{s.session.name}</span>
              </span>
              <button type="button" className="paper-btn" onClick={() => void actions.logout()} aria-label="Sign out">
                <LogOut size={18} aria-hidden="true" />
                <span className="hide-narrow" aria-hidden="true">
                  Sign out
                </span>
              </button>
            </>
          ) : (
            <>
              <label className="who">
                <span className="who-label">You are</span>
                <select value={s.viewerId ?? ''} onChange={(e) => {
                    actions.setViewer(e.target.value || null);
                    setDrawing(true);
                    setTimeout(() => setDrawing(false), 800);
                  }}
                >
                  <option value="">Pick your name</option>
                  {ministers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </label>
              <button type="button" className="paper-btn" onClick={() => setSigningIn(true)}>
                <LogIn size={18} aria-hidden="true" className="hide-narrow" />
                Sign in
              </button>
            </>
          )}
        </div>
      </header>

      {s.error && (
        <div className="error-bar" role="alert">
          <p>{s.error}</p>
          <button type="button" className="icon-btn" onClick={actions.dismissError} aria-label="Dismiss">
            <X size={18} aria-hidden="true" />
          </button>
        </div>
      )}

      <main className="desk">{children}</main>

      {tabs.length > 1 && (
        <nav className="tabs-bottom" aria-label="Main" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
          {tabs.map(({ key, href, label, Icon }) => (
            <a key={key} href={href} className="tab-bottom" aria-current={active === key ? 'page' : undefined}>
              <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
              <span>{label}</span>
            </a>
          ))}
        </nav>
      )}

      {signingIn && <SignIn onClose={() => setSigningIn(false)} />}
    </div>
  );
}
