/**
 * AuthView.jsx — Login / Sign Up screen
 */

import { useState }       from 'react';
import { Btn, Input, Toggle } from './components/ui';

export default function AuthView({ auth, theme, onToggleTheme }) {
  const [tab,  setTab]  = useState('login');
  const [form, setForm] = useState({ name: '', email: '', pw: '' });
  const [err,  setErr]  = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const submit = async () => {
    setBusy(true); setErr('');
    try {
      if (tab === 'login') await auth.login(form.email, form.pw);
      else                 await auth.signup(form.name, form.email, form.pw);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleKey = (e) => { if (e.key === 'Enter') submit(); };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* Theme toggle */}
      <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 13 }}>{theme === 'dark' ? '🌙' : '☀️'}</span>
        <Toggle checked={theme === 'dark'} onChange={onToggleTheme} />
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>

          {/* Brand */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 62, height: 62, background: 'var(--accent)', borderRadius: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', fontSize: 28, color: '#fff',
              fontFamily: 'Sora, sans-serif', fontWeight: 700,
              boxShadow: '0 6px 20px color-mix(in srgb, var(--accent) 35%, transparent)',
            }}>₹</div>
            <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: 30, fontWeight: 700, color: 'var(--text)' }}>
              RoomSplit
            </h1>
            <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 6 }}>
              Smart expense sharing for roommates
            </p>
          </div>

          {/* Card */}
          <div className="card" style={{ padding: 24 }}>
            {/* Tab toggle */}
            <div style={{ display: 'flex', background: 'var(--surface2)', borderRadius: 10, padding: 4, marginBottom: 22 }}>
              {[['login', 'Login'], ['signup', 'Sign Up']].map(([t, l]) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setErr(''); }}
                  style={{
                    flex: 1, padding: '8px 0', border: 'none', borderRadius: 8,
                    fontSize: 13, fontWeight: 700,
                    background: tab === t ? 'var(--accent)' : 'transparent',
                    color:      tab === t ? '#fff' : 'var(--text2)',
                    transition: 'all .2s',
                  }}
                >
                  {l}
                </button>
              ))}
            </div>

            {tab === 'signup' && (
              <Input label="Full Name *" placeholder="e.g. Rahul Kumar" value={form.name} onChange={set('name')} onKeyDown={handleKey} />
            )}
            <Input label="Email *"    type="email"    placeholder="you@example.com" value={form.email} onChange={set('email')} onKeyDown={handleKey} />
            <Input label="Password *" type="password" placeholder="••••••••"        value={form.pw}    onChange={set('pw')}    onKeyDown={handleKey} />

            {err && (
              <div style={{ background: 'var(--dangerBg)', border: '1px solid var(--dangerBd)', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: 'var(--danger)', marginBottom: 14 }}>
                {err}
              </div>
            )}

            <Btn full onClick={submit} style={{ opacity: busy ? 0.6 : 1, fontSize: 14, padding: '11px 0' }} disabled={busy}>
              {busy ? 'Please wait…' : tab === 'login' ? 'Login →' : 'Create Account →'}
            </Btn>

            <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text3)', marginTop: 14 }}>
              Sign up → create a group → share invite code with roommates
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
