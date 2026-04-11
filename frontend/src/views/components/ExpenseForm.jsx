import { useState } from 'react';
import { CATS, PAL } from '../../constants';
import DomainModel   from '../../model/DomainModel';
import { Btn, Avatar, Toggle, FieldWrap, Input } from './ui';

const SPLIT_OPTIONS = [
  { value: 'equal',  label: 'Equal split'    },
  { value: 'custom', label: 'Custom weights' },
  { value: 'payer',  label: 'Payer only'     },
];

export default function ExpenseForm({ initial, members = [], onSubmit, onCancel }) {
  const [form, setForm] = useState(initial || {
    item: '', amount: '', date: DomainModel.today(),
    note: '', category: 'food', recurring: false,
    splitType: 'equal', splitWeights: {},
  });
  const [busy, setBusy] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const valid = form.item.trim() && form.amount && +form.amount > 0 && form.date;
  const totalW = members.reduce((s, m) => s + (parseFloat(form.splitWeights[(m._id || m.id)]) || 0), 0);

  const submit = async () => {
    if (!valid || busy) return;
    setBusy(true);
    await onSubmit(form);
    setBusy(false);
  };

  return (
    <div>
      <Input label="Item Name *" placeholder="e.g. Aata, Milk, Gas bill" value={form.item} onChange={set('item')} />
      <Input label="Amount (₹) *" type="number" min="0" step="0.01" placeholder="0.00" value={form.amount} onChange={set('amount')} />

      <FieldWrap label="Category">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {CATS.map(c => (
            <button key={c.id} onClick={() => setForm(f => ({ ...f, category: c.id }))} style={{ padding: '5px 10px', borderRadius: 99, border: `1px solid ${form.category === c.id ? c.color : c.border}`, background: form.category === c.id ? c.bg : 'transparent', color: form.category === c.id ? c.color : 'var(--text2)', fontSize: 12, fontWeight: form.category === c.id ? 700 : 400, display: 'flex', alignItems: 'center', gap: 4, transition: 'all .15s' }}>
              <span style={{ fontSize: 10 }}>{c.icon}</span>{c.label}
            </button>
          ))}
        </div>
      </FieldWrap>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Input label="Date *" type="date" value={form.date} onChange={set('date')} />
        <div className="field">
          <label>Split Type</label>
          <select className="finput" value={form.splitType} onChange={set('splitType')}>
            {SPLIT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {form.splitType === 'custom' && members.length > 0 && (
        <FieldWrap label={`Custom Weights${totalW > 0 ? ` — total ${totalW} pts` : ''}`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {members.map((m, i) => {
              const mid = m._id || m.id;
              const col = PAL[i % PAL.length];
              return (
                <div key={mid} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar name={m.name} col={col} size={26} />
                  <span style={{ flex: 1, fontSize: 13, color: 'var(--text)' }}>{m.name}</span>
                  <input type="number" min="0" max="100" placeholder="1" value={form.splitWeights[mid] || ''} onChange={e => setForm(f => ({ ...f, splitWeights: { ...f.splitWeights, [mid]: e.target.value } }))} className="finput" style={{ width: 64, textAlign: 'center' }} />
                </div>
              );
            })}
          </div>
        </FieldWrap>
      )}

      <Input label="Note (optional)" placeholder="Any details…" value={form.note} onChange={set('note')} />

      <div className="field" style={{ marginBottom: 18 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textTransform: 'none', fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>
          <Toggle checked={form.recurring} onChange={set('recurring')} />
          <div>
            <p style={{ margin: 0, color: 'var(--text)', fontWeight: 600 }}>Recurring monthly</p>
            <p style={{ margin: 0, fontSize: 11, color: 'var(--text3)' }}>Mark as a fixed monthly expense</p>
          </div>
        </label>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Btn c="s" onClick={onCancel} disabled={busy}>Cancel</Btn>
        <Btn onClick={submit} disabled={!valid || busy} style={{ opacity: valid && !busy ? 1 : 0.45 }}>
          {busy ? 'Saving…' : initial ? 'Update Expense' : 'Add Expense'}
        </Btn>
      </div>
    </div>
  );
}
