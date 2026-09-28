import { useEffect, useRef, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { actions, api } from '../data/store';

interface Option {
  id: string;
  name: string;
  lead?: boolean;
}

export function SignIn({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [options, setOptions] = useState<Option[] | null>(null);
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    ref.current?.showModal();
    api<Option[]>('login-options')
      .then(setOptions)
      .catch((e: Error) => setError(e.message));
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return setError('Choose your name.');
    setBusy(true);
    setError('');
    try {
      await actions.login(id, password);
      ref.current?.close();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  return (
    <dialog ref={ref} className="sheet editor signin" onClose={onClose} onClick={(e) => e.target === e.currentTarget && ref.current?.close()} aria-labelledby="signin-title">
      <form onSubmit={submit}>
        <header className="editor-head">
          <div>
            <h2 id="signin-title" className="section-head">Sign in to edit</h2>
            <p className="editor-sub">For the ministry lead and SICs. Everyone else can read the schedule without signing in.</p>
          </div>
          <button type="button" className="icon-btn" onClick={() => ref.current?.close()} aria-label="Close">
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <label className="field">
          <span>Name</span>
          <select value={id} onChange={(e) => setId(e.target.value)} disabled={!options} autoFocus>
            <option value="">{options ? 'Choose your name' : 'Loading…'}</option>
            {options?.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
                {o.lead ? ' (lead)' : ''}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Password</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </label>
        <p className="editor-sub">SIC and can’t sign in? Ask the ministry lead to set your password.</p>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <div className="dialog-actions">
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
