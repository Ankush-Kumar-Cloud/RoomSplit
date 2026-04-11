/**
 * DomainModel.js
 * ─────────────────────────────────────────────────────────
 * Pure functions — no I/O, no side effects, fully testable.
 * Settlement algo, date helpers, CSV export, expense filtering.
 */

const DomainModel = {
  today:  () => new Date().toISOString().split('T')[0],
  nowISO: () => new Date().toISOString(),

  monthKey(offset = 0) {
    const d = new Date();
    d.setMonth(d.getMonth() + offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  },

  fmtDate: (d) =>
    new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),

  fmtDateFull: (d) =>
    new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),

  fmtTime: (iso) =>
    new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),

  fmtMonth(offset = 0) {
    const d = new Date();
    d.setMonth(d.getMonth() + offset);
    return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  },

  relTime(iso) {
    const s = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (s < 60)    return 'just now';
    if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  },

  /**
   * Greedy minimum-transaction debt simplification.
   * memberIds  — array of member _id strings
   * nameMap    — { [_id]: displayName }
   * totals     — { [_id]: amountSpent }
   */
  calcSettlement(memberIds, nameMap, totals) {
    const total = memberIds.reduce((s, id) => s + (totals[id] || 0), 0);
    const share = total / Math.max(memberIds.length, 1);

    const balances = memberIds.map(id => ({
      id,
      name:  nameMap[id] || '?',
      bal:   (totals[id] || 0) - share,
      spent: totals[id] || 0,
    }));

    const pos = balances.filter(b => b.bal >  0.5).map(x => ({ ...x })).sort((a, b) => b.bal - a.bal);
    const neg = balances.filter(b => b.bal < -0.5).map(x => ({ ...x })).sort((a, b) => a.bal - b.bal);
    const txns = [];
    let pi = 0, ni = 0;

    while (pi < pos.length && ni < neg.length) {
      const amt = Math.min(pos[pi].bal, -neg[ni].bal);
      if (amt > 0.5) txns.push({
        from:   neg[ni].name, fromId: neg[ni].id,
        to:     pos[pi].name, toId:   pos[pi].id,
        amount: Math.round(amt),
      });
      pos[pi].bal -= amt; neg[ni].bal += amt;
      if (pos[pi].bal < 0.5) pi++;
      if (neg[ni].bal > -0.5) ni++;
    }

    return { txns, share: Math.round(share), total: Math.round(total), balances };
  },

  /** Filter expense array by date / category / search string */
  filterExpenses(expenses, { date = '', cat = '', search = '' } = {}) {
    return expenses.filter(e => {
      if (date && e.date !== date) return false;
      if (cat  && (e.category || 'other') !== cat) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!e.item?.toLowerCase().includes(q) && !(e.note || '').toLowerCase().includes(q)) return false;
      }
      return true;
    });
  },

  /** Build and download a CSV for a given month's expenses */
  exportCSV(members, expenses, groupName, monthOffset = 0) {
    const mk     = DomainModel.monthKey(monthOffset);
    const nameOf = id => members.find(m => (m._id || m.id) === id)?.name || '?';

    const rows = [['Member', 'Item', 'Category', 'Amount (₹)', 'Date', 'Time', 'Recurring', 'Note']];
    expenses
      .filter(e => e.date?.startsWith(mk))
      .forEach(e => {
        const uid = e.user?._id || e.user;
        rows.push([nameOf(uid), e.item, e.category || 'other', e.amount, e.date, DomainModel.fmtTime(e.createdAt || e.time || new Date()), e.recurring ? 'Yes' : 'No', e.note || '']);
      });

    const csv  = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const link = Object.assign(document.createElement('a'), {
      href:     URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
      download: `${groupName.replace(/\s+/g, '-')}-${mk}.csv`,
    });
    link.click();
  },
};

export default DomainModel;
