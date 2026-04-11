import { useState, useMemo, useEffect } from 'react';
import { CATS, PAL }    from '../../constants';
import DomainModel      from '../../model/DomainModel';
import ExpenseForm      from '../components/ExpenseForm';
import { Btn, Modal, Avatar, Chip, ProgressBar, EmptyState, MonthNav, Divider, Spinner, colOf } from '../components/ui';

const uid = m => m._id || m.id;

/* ══════════════════════════════════════════
   EXPENSES TAB
══════════════════════════════════════════ */
export function ExpensesTab({ members, me, expCtrl, budgetCtrl, groupId, monthKey }) {
  const [dateF,   setDateF]   = useState('');
  const [catF,    setCatF]    = useState('');
  const [srch,    setSrch]    = useState('');
  const [modal,   setModal]   = useState(null);
  const [editing, setEditing] = useState(null);
  const [delId,   setDelId]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    expCtrl.load().finally(() => setLoading(false));
    budgetCtrl.load(monthKey);
  }, [groupId]);

  const all      = expCtrl.forGroup();
  const filtered = useMemo(() => DomainModel.filterExpenses(all, { date: dateF, cat: catF, search: srch }), [all, dateF, catF, srch]);
  const byMember = useMemo(() => { const m = {}; members.forEach(x => m[uid(x)] = []); filtered.forEach(e => { const u = uid(e.user); if (m[u]) m[u].push(e); }); return m; }, [filtered, members]);
  const dayTotals = useMemo(() => { const t = {}, d = dateF || DomainModel.today(); members.forEach(m => { t[uid(m)] = all.filter(e => uid(e.user) === uid(m) && e.date === d).reduce((s, e) => s + e.amount, 0); }); return t; }, [all, members, dateF]);
  const monthTotals = useMemo(() => { const t = {}; all.filter(e => e.date?.startsWith(monthKey)).forEach(e => { t[uid(e.user)] = (t[uid(e.user)] || 0) + e.amount; }); return t; }, [all, monthKey]);
  const hasFilter = dateF || catF || srch;

  if (loading) return <Spinner />;

  return (
    <>
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 160px', minWidth: 130 }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--text3)', pointerEvents: 'none' }}>🔍</span>
          <input value={srch} onChange={e => setSrch(e.target.value)} placeholder="Search…" className="finput" style={{ paddingLeft: 30, fontSize: 13 }} />
        </div>
        <input type="date" value={dateF} onChange={e => setDateF(e.target.value)} className="finput" style={{ width: 'auto', fontSize: 13 }} />
        <select value={catF} onChange={e => setCatF(e.target.value)} className="finput" style={{ width: 'auto', fontSize: 13 }}>
          <option value="">All categories</option>
          {CATS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
        </select>
        {hasFilter && <Btn c="g" sm onClick={() => { setSrch(''); setDateF(''); setCatF(''); }}>✕ Clear</Btn>}
        <Btn sm onClick={() => setModal('add')} style={{ marginLeft: 'auto' }}>+ Add Expense</Btn>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(272px, 1fr))', gap: 14 }}>
        {members.map(member => {
          const col   = colOf(members, uid(member));
          const mexps = byMember[uid(member)] || [];
          const isMe  = uid(member) === uid(me);
          const spent = monthTotals[uid(member)] || 0;
          const budget = budgetCtrl.get(uid(member), monthKey);
          return (
            <div key={uid(member)} className="card" style={{ padding: 0, overflow: 'hidden', border: `1px solid ${col.border}` }}>
              <div style={{ background: col.bg, padding: '12px 14px', borderBottom: `1px solid ${col.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <Avatar name={member.name} col={col} size={36} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: 14, color: col.dark }}>{member.name}{isMe ? ' (You)' : ''}</p>
                    <p style={{ fontSize: 11, color: col.mid }}>{mexps.length} expense{mexps.length !== 1 ? 's' : ''} · Month ₹{spent}</p>
                  </div>
                  {isMe && <button onClick={() => setModal('add')} style={{ background: 'rgba(255,255,255,.7)', border: `1px solid ${col.border}`, borderRadius: 8, padding: '4px 9px', fontSize: 12, fontWeight: 700, color: col.dark, cursor: 'pointer' }}>+ Add</button>}
                </div>
                {budget > 0 && <div style={{ marginBottom: 9 }}><ProgressBar value={spent} max={budget} label={`Budget ₹${spent} / ₹${budget}`} showPct /></div>}
                <div style={{ background: 'rgba(255,255,255,.65)', borderRadius: 9, padding: '7px 11px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: col.dark, opacity: .8 }}>{dateF ? DomainModel.fmtDate(dateF) : 'Today'}</span>
                  <span style={{ fontSize: 22, fontWeight: 700, color: col.dark, fontFamily: 'Sora, sans-serif' }}>₹{(dayTotals[uid(member)] || 0).toFixed(0)}</span>
                </div>
              </div>
              <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                {mexps.length === 0 ? (
                  <div style={{ padding: '30px 16px', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>{hasFilter ? 'No matching expenses' : 'No expenses yet'}</div>
                ) : mexps.map(exp => (
                  <div key={exp._id} style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <p style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text)' }}>{exp.item}</p>
                        {exp.recurring && <span style={{ fontSize: 10, background: 'var(--accentBg)', color: 'var(--accent)', border: '1px solid var(--accentBd)', borderRadius: 4, padding: '1px 5px', flexShrink: 0 }}>↻</span>}
                        {exp.splitType === 'custom' && <span style={{ fontSize: 10, background: 'var(--warnBg)', color: 'var(--warn)', border: '1px solid var(--warnBd)', borderRadius: 4, padding: '1px 5px', flexShrink: 0 }}>⚖</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                        <Chip cat={exp.category || 'other'} />
                        <span style={{ fontSize: 11, color: 'var(--text3)' }}>{DomainModel.fmtDate(exp.date)} · {DomainModel.fmtTime(exp.createdAt)}</span>
                      </div>
                      {exp.note && <p style={{ fontSize: 11, color: 'var(--text2)', fontStyle: 'italic', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exp.note}</p>}
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: 15, color: col.mid }}>₹{exp.amount}</p>
                      {isMe && (
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end', marginTop: 6 }}>
                          <Btn xs c="s" onClick={() => { setEditing(exp); setModal('edit'); }}>Edit</Btn>
                          <Btn xs c="d" onClick={() => { setDelId(exp._id); setModal('del'); }}>Del</Btn>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {modal === 'add' && <Modal title="Add Expense" onClose={() => setModal(null)}><ExpenseForm members={members} onSubmit={async f => { await expCtrl.add(f); setModal(null); }} onCancel={() => setModal(null)} /></Modal>}
      {modal === 'edit' && editing && <Modal title="Edit Expense" onClose={() => { setModal(null); setEditing(null); }}><ExpenseForm members={members} initial={{ item: editing.item, amount: String(editing.amount), date: editing.date, note: editing.note || '', category: editing.category || 'food', recurring: editing.recurring || false, splitType: editing.splitType || 'equal', splitWeights: Object.fromEntries(editing.splitWeights || new Map()) }} onSubmit={async f => { await expCtrl.update(editing._id, f); setModal(null); setEditing(null); }} onCancel={() => { setModal(null); setEditing(null); }} /></Modal>}
      {modal === 'del' && <Modal title="Delete Expense?" onClose={() => { setModal(null); setDelId(null); }}><p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 20 }}>This cannot be undone.</p><div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}><Btn c="s" onClick={() => { setModal(null); setDelId(null); }}>Cancel</Btn><Btn c="d" onClick={async () => { await expCtrl.remove(delId); setModal(null); setDelId(null); }}>Delete</Btn></div></Modal>}
    </>
  );
}

/* ══════════════════════════════════════════
   ACTIVITY TAB
══════════════════════════════════════════ */
export function ActivityTab({ members, expCtrl }) {
  const recent = expCtrl.recent(40);
  const nameOf = u => (typeof u === 'object' ? u.name : members.find(m => uid(m) === u)?.name) || '?';
  if (!recent.length) return <div className="card" style={{ padding: 0 }}><EmptyState icon="📋" title="No activity yet" body="Add your first expense to see it here." /></div>;
  const byDate = {};
  recent.forEach(e => { (byDate[e.date] = byDate[e.date] || []).push(e); });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {Object.entries(byDate).sort((a, b) => b[0].localeCompare(a[0])).map(([date, exps]) => (
        <div key={date}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' }}>{DomainModel.fmtDateFull(date)}</p>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {exps.map((exp, i) => {
              const euid = uid(exp.user);
              const col  = colOf(members, euid);
              return (
                <div key={exp._id} style={{ display: 'flex', gap: 12, padding: '12px 16px', borderBottom: i < exps.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}>
                  <Avatar name={nameOf(exp.user)} col={col} size={34} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                      <p style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text)' }}>{exp.item}</p>
                      <p style={{ fontWeight: 700, fontSize: 15, color: col.mid, flexShrink: 0 }}>₹{exp.amount}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 500 }}>{nameOf(exp.user)}</span>
                      <Chip cat={exp.category || 'other'} />
                      {exp.recurring && <span style={{ fontSize: 10, background: 'var(--accentBg)', color: 'var(--accent)', border: '1px solid var(--accentBd)', borderRadius: 4, padding: '1px 5px' }}>↻</span>}
                      <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 'auto' }}>{DomainModel.relTime(exp.createdAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════
   BUDGETS TAB
══════════════════════════════════════════ */
export function BudgetsTab({ members, expCtrl, budgetCtrl, groupId }) {
  const [editId, setEditId] = useState(null);
  const [val,    setVal]    = useState('');
  const mk  = DomainModel.monthKey(0);
  const all = expCtrl.forGroup();
  const monthTotals = useMemo(() => { const t = {}; all.filter(e => e.date?.startsWith(mk)).forEach(e => { t[uid(e.user)] = (t[uid(e.user)] || 0) + e.amount; }); return t; }, [all, mk]);

  return (
    <div>
      <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 18 }}>Set monthly budgets for <strong style={{ color: 'var(--text)' }}>{DomainModel.fmtMonth(0)}</strong>. A progress bar appears on each member's expense column.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
        {members.map(m => {
          const col    = colOf(members, uid(m));
          const spent  = monthTotals[uid(m)] || 0;
          const budget = budgetCtrl.get(uid(m), mk);
          const pct    = budget > 0 ? Math.round(spent / budget * 100) : 0;
          const status = budget > 0 ? (pct > 100 ? 'over' : pct > 80 ? 'warn' : 'ok') : 'none';
          return (
            <div key={uid(m)} className="card" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <Avatar name={m.name} col={col} size={36} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{m.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--text2)' }}>₹{spent} spent this month</p>
                </div>
                {status === 'over' && <span style={{ fontSize: 11, background: 'var(--dangerBg)', color: 'var(--danger)', border: '1px solid var(--dangerBd)', borderRadius: 6, padding: '2px 8px', fontWeight: 700 }}>Over!</span>}
                {status === 'warn' && <span style={{ fontSize: 11, background: 'var(--warnBg)', color: 'var(--warn)', border: '1px solid var(--warnBd)', borderRadius: 6, padding: '2px 8px', fontWeight: 700 }}>80%+</span>}
              </div>
              {budget > 0 && <div style={{ marginBottom: 14 }}><ProgressBar value={spent} max={budget} label={`₹${spent} / ₹${budget}`} showPct /></div>}
              {editId === uid(m) ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="number" min="0" placeholder="Monthly budget ₹" value={val} onChange={e => setVal(e.target.value)} className="finput" style={{ fontSize: 13 }} />
                  <Btn sm onClick={async () => { await budgetCtrl.set(uid(m), mk, val || 0); setEditId(null); setVal(''); }}>Save</Btn>
                  <Btn c="g" sm onClick={() => { setEditId(null); setVal(''); }}>✕</Btn>
                </div>
              ) : (
                <Btn c="s" sm onClick={() => { setEditId(uid(m)); setVal(budget || ''); }}>{budget > 0 ? 'Edit Budget' : 'Set Budget'}</Btn>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   ANALYTICS TAB
══════════════════════════════════════════ */
export function AnalyticsTab({ members, expCtrl, off, setOff }) {
  const all   = expCtrl.forGroup();
  const mk    = DomainModel.monthKey(off);
  const mExps = all.filter(e => e.date?.startsWith(mk));
  const monTotals  = useMemo(() => { const t = {}; mExps.forEach(e => { t[uid(e.user)] = (t[uid(e.user)] || 0) + e.amount; }); return t; }, [mExps]);
  const maxMon     = Math.max(...members.map(m => monTotals[uid(m)] || 0), 1);
  const catTotals  = useMemo(() => { const t = {}; mExps.forEach(e => { t[e.category || 'other'] = (t[e.category || 'other'] || 0) + e.amount; }); return t; }, [mExps]);
  const catSum     = Object.values(catTotals).reduce((s, v) => s + v, 0) || 1;
  const sortedCats = CATS.map(c => ({ ...c, amount: catTotals[c.id] || 0 })).filter(c => c.amount > 0).sort((a, b) => b.amount - a.amount);
  const days   = [...new Set(mExps.map(e => e.date))].sort().slice(-14);
  const maxDay = Math.max(...days.map(d => mExps.filter(e => e.date === d).reduce((s, e) => s + e.amount, 0)), 1);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
      <div className="card" style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Daily Spending</h3>
          <MonthNav offset={off} setOffset={setOff} label={DomainModel.fmtMonth(off)} />
        </div>
        {days.length === 0 ? <EmptyState icon="📊" title="No data yet" /> : (
          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: Math.max(days.length * 46, 280) }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 96, marginBottom: 6 }}>
                {days.map(d => {
                  const segs = members.map(m => ({ col: colOf(members, uid(m)), amt: mExps.filter(e => e.date === d && uid(e.user) === uid(m)).reduce((s, e) => s + e.amount, 0) })).filter(x => x.amt > 0);
                  const dt   = segs.reduce((s, x) => s + x.amt, 0);
                  const bH   = Math.round((dt / maxDay) * 84);
                  return (
                    <div key={d} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <span style={{ fontSize: 9, color: 'var(--text3)' }}>{dt >= 1000 ? Math.round(dt / 100) / 10 + 'k' : Math.round(dt)}</span>
                      <div style={{ width: '100%', height: bH, minHeight: 2, borderRadius: '3px 3px 0 0', overflow: 'hidden', display: 'flex', flexDirection: 'column-reverse' }}>
                        {segs.map(({ col, amt }, i) => <div key={i} style={{ height: `${(amt / dt) * 100}%`, background: col.mid, minHeight: 2 }} />)}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: 4 }}>{days.map(d => <div key={d} style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--text3)' }}>{DomainModel.fmtDate(d)}</div>)}</div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
              {members.map(m => { const c = colOf(members, uid(m)); return <div key={uid(m)} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text2)' }}><div style={{ width: 9, height: 9, borderRadius: 3, background: c.mid }} />{m.name}</div>; })}
            </div>
          </div>
        )}
      </div>

      <div className="card" style={{ padding: '18px 20px' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>By Category</h3>
        {sortedCats.length === 0 ? <EmptyState icon="📈" title="No data yet" /> : sortedCats.map(c => (
          <div key={c.id} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 13, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 5 }}><span>{c.icon}</span>{c.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>₹{c.amount} <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text3)' }}>({Math.round(c.amount / catSum * 100)}%)</span></span>
            </div>
            <ProgressBar value={c.amount} max={catSum} color={c.color} />
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: '18px 20px', gridColumn: '1 / -1' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>Member Spending — {DomainModel.fmtMonth(off)}</h3>
        {members.map(m => {
          const col = colOf(members, uid(m)); const amt = monTotals[uid(m)] || 0;
          return (
            <div key={uid(m)} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><Avatar name={m.name} col={col} size={26} /><span style={{ fontSize: 13, color: 'var(--text)' }}>{m.name}</span></div>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>₹{amt}</span>
              </div>
              <ProgressBar value={amt} max={maxMon} color={col.mid} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MONTHLY TAB
══════════════════════════════════════════ */
export function MonthlyTab({ members, expCtrl, off, setOff }) {
  const all   = expCtrl.forGroup();
  const mk    = DomainModel.monthKey(off);
  const mExps = all.filter(e => e.date?.startsWith(mk));
  const monTotals = useMemo(() => { const t = {}; mExps.forEach(e => { t[uid(e.user)] = (t[uid(e.user)] || 0) + e.amount; }); return t; }, [mExps]);
  const settle    = useMemo(() => { if (!members.length) return null; const nm = {}; members.forEach(m => { nm[uid(m)] = m.name; }); return DomainModel.calcSettlement(members.map(uid), nm, monTotals); }, [members, monTotals]);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div><h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 20, color: 'var(--text)' }}>Monthly Summary</h3><p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 3 }}>{DomainModel.fmtMonth(off)}</p></div>
        <MonthNav offset={off} setOffset={setOff} label={DomainModel.fmtMonth(off)} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
        {members.map(m => { const col = colOf(members, uid(m)); const tot = monTotals[uid(m)] || 0; return <div key={uid(m)} style={{ background: col.bg, borderRadius: 14, padding: 16, border: `1px solid ${col.border}` }}><div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}><Avatar name={m.name} col={col} size={28} /><span style={{ fontSize: 13, fontWeight: 700, color: col.dark }}>{m.name}</span></div><p style={{ fontSize: 26, fontWeight: 700, color: col.dark, fontFamily: 'Sora, sans-serif' }}>₹{tot}</p><p style={{ fontSize: 11, color: col.dark, opacity: .65, marginTop: 3 }}>spent</p></div>; })}
      </div>
      {settle && <div className="card" style={{ padding: '20px 22px' }}>
        <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, marginBottom: 16, color: 'var(--text)' }}>Group Summary</h3>
        <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', marginBottom: 20 }}>
          {[['Total', '₹' + settle.total, 'var(--accent)'], ['Per Person', '₹' + settle.share, null], ['Members', members.length, null]].map(([l, v, c]) => <div key={l}><p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 3 }}>{l}</p><p style={{ fontSize: 26, fontWeight: 700, color: c || 'var(--text)', fontFamily: 'Sora, sans-serif' }}>{v}</p></div>)}
        </div>
        <Divider />
        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text2)', marginBottom: 10 }}>Balance vs equal share</p>
        {settle.balances.map(b => <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Avatar name={b.name} col={colOf(members, b.id)} size={26} /><span style={{ fontSize: 14, color: 'var(--text)' }}>{b.name}</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>₹{monTotals[b.id] || 0}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: b.bal >= 0 ? 'var(--accent)' : 'var(--danger)', background: b.bal >= 0 ? 'var(--accentBg)' : 'var(--dangerBg)', padding: '3px 10px', borderRadius: 6 }}>{b.bal >= 0 ? '+' : ''}₹{Math.round(b.bal)}</span>
          </div>
        </div>)}
      </div>}
    </>
  );
}

/* ══════════════════════════════════════════
   SETTLEMENT TAB
══════════════════════════════════════════ */
export function SettlementTab({ members, expCtrl, settleCtrl, off, setOff }) {
  const all   = expCtrl.forGroup();
  const mk    = DomainModel.monthKey(off);
  const mExps = all.filter(e => e.date?.startsWith(mk));
  const monTotals = useMemo(() => { const t = {}; mExps.forEach(e => { t[uid(e.user)] = (t[uid(e.user)] || 0) + e.amount; }); return t; }, [mExps]);
  const settle    = useMemo(() => { if (!members.length) return null; const nm = {}; members.forEach(m => { nm[uid(m)] = m.name; }); return DomainModel.calcSettlement(members.map(uid), nm, monTotals); }, [members, monTotals]);

  useEffect(() => { settleCtrl.load(mk); }, [mk]);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div><h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 20, color: 'var(--text)' }}>Settlement</h3><p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 3 }}>Minimum transactions · {DomainModel.fmtMonth(off)}</p></div>
        <MonthNav offset={off} setOffset={setOff} label={DomainModel.fmtMonth(off)} />
      </div>
      <div className="card" style={{ padding: '18px 22px', marginBottom: 16 }}>
        {!settle || settle.txns.length === 0 ? <EmptyState icon="🎉" title="All settled up!" body="Everyone spent equally this month." /> :
          settle.txns.map((t, i) => {
            const fc = colOf(members, t.fromId), tc = colOf(members, t.toId);
            const paid = settleCtrl.isPaid(mk, i);
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', background: 'var(--surface2)', borderRadius: 12, marginBottom: 10, flexWrap: 'wrap', opacity: paid ? .5 : 1, transition: 'opacity .25s' }}>
                <Avatar name={t.from} col={fc} size={36} />
                <div style={{ flex: 1, minWidth: 100 }}>
                  <p style={{ fontSize: 14, color: 'var(--text)' }}><strong style={{ color: fc.dark }}>{t.from}</strong><span style={{ color: 'var(--text3)', margin: '0 6px' }}>→</span><strong style={{ color: tc.dark }}>{t.to}</strong></p>
                  {paid && <p style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700, marginTop: 3 }}>✓ Marked as paid</p>}
                </div>
                <div style={{ background: 'var(--accent)', color: '#fff', padding: '7px 14px', borderRadius: 10, fontSize: 16, fontWeight: 700, fontFamily: 'Sora, sans-serif', textDecoration: paid ? 'line-through' : 'none' }}>₹{t.amount}</div>
                <Btn c={paid ? 'a' : 's'} sm onClick={() => settleCtrl.toggle(mk, i)}>{paid ? '✓ Paid' : 'Mark Paid'}</Btn>
              </div>
            );
          })}
      </div>
      {settle && <div className="card" style={{ padding: '18px 22px' }}>
        <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>Breakdown</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
          {members.map(m => { const col = colOf(members, uid(m)); return <div key={uid(m)} style={{ background: col.bg, borderRadius: 10, padding: '12px 14px', border: `1px solid ${col.border}` }}><div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}><Avatar name={m.name} col={col} size={24} /><span style={{ fontSize: 12, color: col.dark, fontWeight: 700 }}>{m.name}</span></div><p style={{ fontSize: 20, fontWeight: 700, color: col.dark, fontFamily: 'Sora, sans-serif' }}>₹{monTotals[uid(m)] || 0}</p></div>; })}
        </div>
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 14, color: 'var(--text2)' }}>Total · Equal share</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>₹{settle.total} · ₹{settle.share}/person</span>
        </div>
      </div>}
    </>
  );
}
