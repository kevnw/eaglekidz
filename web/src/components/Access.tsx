import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { KeyRound } from 'lucide-react';
import { api, useStore } from '../data/store';
import { Handwritten, Pin } from './Marks';

interface Row {
  ministerId: string;
  name: string;
  isSic: boolean;
  hasPassword: boolean;
}

export function Access() {
  const s = useStore();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [saved, setSaved] = useState<string | null>(null);

  const load = useCallback(() => {
    api<Row[]>('accounts')
      .then(setRows)
      .catch((e: Error) => setError(e.message));
  }, []);
  useEffect(load, [load, s.placements]);

  const save = async (e: FormEvent, id: string) => {
    e.preventDefault();
    setError('');
    try {
      await api(`accounts/${id}`, { method: 'PUT', body: { password } });
      setEditing(null);
      setPassword('');
      setSaved(id);
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const revoke = async (id: string) => {
    setError('');
    try {
      await api(`accounts/${id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="page">
      <article className="sheet access-sheet">
        <Pin className="pin-l" />
        <Pin className="pin-r" />
        <header className="sheet-head">
          <div>
            <h1 className="sheet-title">Access</h1>
            <p className="sheet-sub">
              SICs can sign in and edit the schedule, grouping and reports once you set their password. Anyone marked SIC in the grouping appears here. If you remove someone’s SIC mark, they can’t sign in any more.
            </p>
          </div>
        </header>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        {!rows ? (
          <p className="empty">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="empty">Nobody is marked SIC in the grouping yet.</p>
        ) : (
          <table className="access-table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Can sign in</th>
                <th scope="col">Password</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.ministerId}>
                  <th scope="row">
                    <span className="name hl-sic">{r.name}</span>
                  </th>
                  <td>
                    {!r.isSic ? 'No, not SIC any more' : r.hasPassword ? 'Yes' : 'Not yet'}
                    {saved === r.ministerId && <Handwritten as="span"> Password set. Tell {r.name} in person.</Handwritten>}
                  </td>
                  <td className="access-actions">
                    {editing === r.ministerId ? (
                      <form className="inline-form" onSubmit={(e) => void save(e, r.ministerId)}>
                        <label className="field">
                          <span>New password for {r.name}</span>
                          <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} autoComplete="off" autoFocus />
                        </label>
                        <button type="submit" className="btn-primary">
                          Save
                        </button>
                        <button type="button" className="btn-quiet" onClick={() => setEditing(null)}>
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <>
                        {r.isSic && (
                          <button type="button" className="btn-quiet" onClick={() => { setEditing(r.ministerId); setPassword(''); setSaved(null); }}>
                            <KeyRound size={16} aria-hidden="true" /> {r.hasPassword ? 'Reset password' : 'Set password'}
                          </button>
                        )}
                        {r.hasPassword && (
                          <button type="button" className="btn-quiet" onClick={() => void revoke(r.ministerId)}>
                            Remove access
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </article>
    </div>
  );
}
