/**
 * ExpenseForm.jsx
 * ─────────────────────────────────────────────────────────
 * Reusable form for adding and editing expenses.
 * Handles category picker, custom split weights,
 * recurring toggle, and validation.
 */

import { useState }         from 'react';
import { CATS, PAL }        from '../../constants';
import DomainModel          from '../../model/DomainModel';
import { Btn, Avatar, Toggle, FieldWrap, Input, Select } from './ui';

const SPLIT_OPTIONS = [
  { value: 'equal',  label: 'Equal split'     },
  { value: 'custom', label: 'Custom weights'  },
  { value: 'payer',  label: 'Payer only'      },
];

export default function ExpenseForm({ initial, members = [], onSubmit, onCancel }) {
  const [form, setForm] = useState(
    initial || {
      item:         '',
      amount:       '',
      date:         DomainModel.today(),
      note:         '',
      category:     'food',
      recurring:    false,
      splitType:    'equal',
      splitWeights: {},
    }
  );

  const set  = (key) => (e) =>
    setForm(f => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const isValid = form.item.trim() && form.amount && +form.amount > 0 && form.date;

  const totalWeights = members.reduce(
    (s, m) => s + (parseFloat(form.splitWeights[m.id]) || 0), 0
  );

  return (
    <div>
      {/* Item name */}
      <Input
        label="Item Name *"
        placeholder="e.g. Aata, Milk, Electricity bill"
        value={form.item}
        onChange={set('item')}
      />

      {/* Amount */}
      <Input
        label="Amount (₹) *"
        type="number" min="0" step="0.01" placeholder="0.00"
        value={form.amount}
        onChange={set('amount')}
      />

      {/* Category picker */}
      <FieldWrap label="Category">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {CATS.map(c => (
            <button
              key={c.id}
              onClick={() => setForm(f => ({ ...f, category: c.id }))}
              style={{
                padding: '5px 10px', borderRadius: 99,
                border: `1px solid ${form.category === c.id ? c.color : c.border}`,
                background: form.category === c.id ? c.bg : 'transparent',
                color: form.category === c.id ? c.color : 'var(--text2)',
                fontSize: 12,
                fontWeight: form.category === c.id ? 700 : 400,
                display: 'flex', alignItems: 'center', gap: 4,
                transition: 'all .15s',
              }}
            >
              <span style={{ fontSize: 10 }}>{c.icon}</span>{c.label}
            </button>
          ))}
        </div>
      </FieldWrap>

      {/* Date + Split type row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Input label="Date *" type="date" value={form.date} onChange={set('date')} />
        <Select
          label="Split Type"
          value={form.splitType}
          onChange={set('splitType')}
          options={SPLIT_OPTIONS}
        />
      </div>

      {/* Custom weights (shown only when splitType=custom) */}
      {form.splitType === 'custom' && members.length > 0 && (
        <FieldWrap label={`Custom Weights${totalWeights > 0 ? ` — total ${totalWeights} pts` : ''}`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {members.map((m, i) => {
              const col = PAL[i % PAL.length];
              return (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar name={m.name} col={col} size={26} />
                  <span style={{ flex: 1, fontSize: 13, color: 'var(--text)' }}>{m.name}</span>
                  <input
                    type="number" min="0" max="100" placeholder="1"
                    value={form.splitWeights[m.id] || ''}
                    onChange={e => setForm(f => ({
                      ...f,
                      splitWeights: { ...f.splitWeights, [m.id]: e.target.value },
                    }))}
                    className="finput"
                    style={{ width: 64, textAlign: 'center' }}
                  />
                </div>
              );
            })}
          </div>
        </FieldWrap>
      )}

      {/* Note */}
      <Input label="Note (optional)" placeholder="Any details…" value={form.note} onChange={set('note')} />

      {/* Recurring toggle */}
      <div className="field" style={{ marginBottom: 18 }}>
        <label
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            cursor: 'pointer', textTransform: 'none',
            fontSize: 13, fontWeight: 600, color: 'var(--text2)',
          }}
        >
          <Toggle checked={form.recurring} onChange={set('recurring')} />
          <div>
            <p style={{ margin: 0, color: 'var(--text)', fontWeight: 600 }}>Recurring monthly</p>
            <p style={{ margin: 0, fontSize: 11, color: 'var(--text3)' }}>
              Mark as a fixed monthly expense
            </p>
          </div>
        </label>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Btn c="s" onClick={onCancel}>Cancel</Btn>
        <Btn onClick={() => isValid && onSubmit(form)} style={{ opacity: isValid ? 1 : 0.45 }}>
          {initial ? 'Update Expense' : 'Add Expense'}
        </Btn>
      </div>
    </div>
  );
}
