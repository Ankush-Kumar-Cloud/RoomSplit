import { useState, useEffect } from 'react';
import { PAL }                  from '../constants';
import { Btn, Modal, Input, Toggle, EmptyState, Spinner } from './components/ui';

export default function HomeView({ user, groupCtrl, authCtrl, theme, onToggleTheme, onOpenGroup }) {
  const [groups,   setGroups]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(null);
  const [gname,    setGname]    = useState('');
  const [code,     setCode]     = useState('');
  const [newName,  setNewName]  = useState(user.name);
  const [err,      setErr]      = useState('');
  const [busy,     setBusy]     = useState(false);

  /* Load groups from API on mount */
  useEffect(() => {
    groupCtrl.loadAll().then(setGroups).catch(console.error).finally(() => setLoading(false));
  }, []);

  const doCreate = async () => {
    setBusy(true); setErr('');
    try { const g = await groupCtrl.create(gname); setGroups(prev => [g, ...prev]); setGname(''); setModal(null); onOpenGroup(g._id); }
    catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  const doJoin = async () => {
    setBusy(true); setErr('');
    try { const g = await groupCtrl.join(code); setGroups(prev => prev.find(x => x._id === g._id) ? prev : [g, ...prev]); setCode(''); setModal(null); onOpenGroup(g._id); }
    catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  const doSaveProfile = async () => {
    try { await authCtrl.updateProfile(newName); setModal(null); }
    catch (e) { setErr(e.message); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <header className="app-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, background: 'var(--accent)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 15 }}>₹</div>
          <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 17, color: 'var(--text)' }}>RoomSplit</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Toggle checked={theme === 'dark'} onChange={onToggleTheme} />
          <button onClick={() => { setNewName(user.name); setModal('profile'); setErr(''); }} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 99, padding: '5px 10px 5px 5px' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{user.name.charAt(0).toUpperCase()}</div>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{user.name.split(' ')[0]}</span>
          </button>
          <Btn c="s" sm onClick={() => authCtrl.logout()}>Logout</Btn>
        </div>
      </header>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '26px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 22 }}>
          <div>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 22, color: 'var(--text)' }}>Your Groups</h2>
            <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>{groups.length} group{groups.length !== 1 ? 's' : ''}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn c="s" sm onClick={() => { setModal('join'); setErr(''); }}>Join</Btn>
            <Btn sm      onClick={() => { setModal('create'); setErr(''); }}>+ New</Btn>
          </div>
        </div>

        {loading ? <Spinner /> : groups.length === 0 ? (
          <div className="card" style={{ padding: 0 }}>
            <EmptyState icon="🏠" title="No groups yet" body="Create a group and share the invite code with roommates." action={<div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}><Btn onClick={() => setModal('create')}>Create Group</Btn><Btn c="s" onClick={() => setModal('join')}>Join Group</Btn></div>} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {groups.map((g, i) => {
              const col  = PAL[i % PAL.length];
              const mems = g.members || [];
              return (
                <div key={g._id} onClick={() => onOpenGroup(g._id)} className="card" style={{ padding: '15px 18px', cursor: 'pointer', display: 'flex', gap: 13, alignItems: 'center' }}>
                  <div style={{ width: 46, height: 46, background: col.bg, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 21, border: `1px solid ${col.border}`, flexShrink: 0 }}>🏠</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{g.name}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, color: 'var(--text2)' }}>{mems.length} member{mems.length !== 1 ? 's' : ''}</span>
                      <span style={{ fontSize: 11, color: 'var(--text3)' }}>·</span>
                      <span style={{ fontSize: 12, color: 'var(--text2)' }}>Code <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent)', letterSpacing: '.06em' }}>{g.inviteCode}</span></span>
                    </div>
                  </div>
                  <div style={{ display: 'flex' }}>
                    {mems.slice(0, 4).map((m, j) => (
                      <div key={m._id} style={{ width: 28, height: 28, borderRadius: '50%', background: PAL[j % PAL.length].av, border: '2px solid var(--surface)', marginLeft: j > 0 ? -8 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', fontWeight: 700 }}>
                        {m.name?.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {mems.length > 4 && <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--surface3)', border: '2px solid var(--surface)', marginLeft: -8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--text2)', fontWeight: 700 }}>+{mems.length - 4}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modal === 'create' && (
        <Modal title="Create New Group" onClose={() => setModal(null)}>
          <Input label="Group Name *" placeholder="e.g. Flat 3B Roommates" value={gname} onChange={e => setGname(e.target.value)} onKeyDown={e => e.key === 'Enter' && doCreate()} />
          {err && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{err}</p>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Btn c="s" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn onClick={doCreate} disabled={busy}>{busy ? 'Creating…' : 'Create Group'}</Btn>
          </div>
        </Modal>
      )}
      {modal === 'join' && (
        <Modal title="Join a Group" onClose={() => setModal(null)}>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>Ask your roommate for their 6-character invite code.</p>
          <Input label="Invite Code *" placeholder="AB12CD" value={code} onChange={e => setCode(e.target.value.toUpperCase())} style={{ textTransform: 'uppercase', letterSpacing: '.2em', fontFamily: 'monospace', fontSize: 22, textAlign: 'center' }} onKeyDown={e => e.key === 'Enter' && doJoin()} />
          {err && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{err}</p>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Btn c="s" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn onClick={doJoin} disabled={busy}>{busy ? 'Joining…' : 'Join Group'}</Btn>
          </div>
        </Modal>
      )}
      {modal === 'profile' && (
        <Modal title="My Profile" onClose={() => setModal(null)}>
          <Input label="Display Name" value={newName} onChange={e => setNewName(e.target.value)} />
          <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16 }}>Email: {user.email}</p>
          {err && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{err}</p>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Btn c="s" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn onClick={doSaveProfile}>Save</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
