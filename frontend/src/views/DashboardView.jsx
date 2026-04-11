import { useState, useMemo }  from 'react';
import DomainModel             from '../model/DomainModel';
import { PAL }                 from '../constants';
import { Btn, Modal, Avatar, Toggle, Divider, Input, Spinner } from './components/ui';
import { ExpensesTab, ActivityTab, BudgetsTab, AnalyticsTab, MonthlyTab, SettlementTab } from './tabs/index';

const TABS = [['expenses','Expenses'],['activity','Activity'],['budgets','Budgets'],['analytics','Analytics'],['monthly','Monthly'],['settlement','Settlement']];

function GroupSettingsModal({ group, members, me, groupCtrl, onClose, onLeft }) {
  const [name, setName] = useState(group.name);
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState('');
  const isOwner = (group.owner?._id || group.owner) === (me?._id || me?.id);

  const doRename = async () => {
    setBusy(true); setErr('');
    try { await groupCtrl.rename(group._id, name); onClose(); }
    catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  const doLeave = async () => {
    if (!confirm('Leave this group?')) return;
    setBusy(true); setErr('');
    try { await groupCtrl.leave(group._id); onLeft(); }
    catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <Modal title="Group Settings" onClose={onClose}>
      {isOwner && <>
        <div className="field"><label>Group Name</label><input className="finput" value={name} onChange={e => setName(e.target.value)} /></div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}><Btn c="s" onClick={onClose}>Cancel</Btn><Btn onClick={doRename} disabled={busy}>{busy ? 'Saving…' : 'Save Name'}</Btn></div>
        <Divider />
      </>}
      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text2)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.05em' }}>Members ({members.length})</p>
      {members.map((m, i) => {
        const col = PAL[i % PAL.length];
        const ownerId = group.owner?._id || group.owner;
        return <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
          <Avatar name={m.name} col={col} size={30} />
          <div style={{ flex: 1 }}><p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{m.name}</p><p style={{ fontSize: 11, color: 'var(--text3)' }}>{m.email}</p></div>
          {m._id === ownerId && <span style={{ fontSize: 11, background: 'var(--accentBg)', color: 'var(--accent)', border: '1px solid var(--accentBd)', borderRadius: 5, padding: '2px 7px', fontWeight: 700 }}>Owner</span>}
        </div>;
      })}
      <Divider />
      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text2)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.05em' }}>Invite Code</p>
      <div style={{ background: 'var(--accentBg)', border: '1px solid var(--accentBd)', borderRadius: 12, padding: 16, textAlign: 'center', marginBottom: 16 }}>
        <p style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700, marginBottom: 4 }}>Share with roommates</p>
        <p style={{ fontSize: 34, fontWeight: 700, letterSpacing: '.3em', fontFamily: 'monospace', color: 'var(--accent)' }}>{group.inviteCode}</p>
      </div>
      <Divider />
      {err && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 10 }}>{err}</p>}
      <Btn c="d" full onClick={doLeave} disabled={busy}>Leave Group</Btn>
    </Modal>
  );
}

export default function DashboardView({ group, members, me, expCtrl, settleCtrl, groupCtrl, budgetCtrl, allExps, onBack, theme, onToggleTheme }) {
  const [tab,      setTab]      = useState('expenses');
  const [off,      setOff]      = useState(0);
  const [settings, setSettings] = useState(false);
  const monthKey = DomainModel.monthKey(off);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <header className="app-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: 18, color: 'var(--text2)', cursor: 'pointer', padding: '0 6px 0 0', lineHeight: 1 }}>←</button>
          <div>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 17, color: 'var(--text)', lineHeight: 1.2 }}>{group.name}</h2>
            <p style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{members.length} members</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <Toggle checked={theme === 'dark'} onChange={onToggleTheme} />
          <Btn c="s" sm onClick={() => DomainModel.exportCSV(members, allExps, group.name, off)}>⬇ CSV</Btn>
          <Btn c="s" sm onClick={() => setSettings(true)}>⚙ Settings</Btn>
          <Btn sm onClick={() => setTab('expenses')}>+ Add</Btn>
        </div>
      </header>

      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', paddingLeft: 20 }} className="tab-bar">
          {TABS.map(([k, l]) => <button key={k} className={`tab-btn${tab === k ? ' on' : ''}`} onClick={() => setTab(k)}>{l}</button>)}
        </div>
      </div>

      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '22px 16px' }}>
        {tab === 'expenses'   && <ExpensesTab   members={members} me={me} expCtrl={expCtrl} budgetCtrl={budgetCtrl} groupId={group._id} monthKey={monthKey} />}
        {tab === 'activity'   && <ActivityTab   members={members} expCtrl={expCtrl} />}
        {tab === 'budgets'    && <BudgetsTab    members={members} expCtrl={expCtrl} budgetCtrl={budgetCtrl} groupId={group._id} />}
        {tab === 'analytics'  && <AnalyticsTab  members={members} expCtrl={expCtrl} off={off} setOff={setOff} />}
        {tab === 'monthly'    && <MonthlyTab    members={members} expCtrl={expCtrl} off={off} setOff={setOff} />}
        {tab === 'settlement' && <SettlementTab members={members} expCtrl={expCtrl} settleCtrl={settleCtrl} off={off} setOff={setOff} />}
      </div>

      {settings && <GroupSettingsModal group={group} members={members} me={me} groupCtrl={groupCtrl} onClose={() => setSettings(false)} onLeft={() => { setSettings(false); onBack(); }} />}
    </div>
  );
}
