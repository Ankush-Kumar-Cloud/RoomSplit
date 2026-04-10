/**
 * DomainModel
 * ─────────────────────────────────────────────────────────
 * Pure functions — no I/O, no side effects, fully testable.
 * All business rules live here:
 *   • ID / code generation
 *   • Date formatting helpers
 *   • Settlement algorithm (minimum-transaction debt simplification)
 *   • Custom split calculator
 *   • Expense filtering
 *   • CSV export builder
 */

const DomainModel = {
  // ── Identity helpers ──────────────────────────────────
  genId: () =>
    Date.now().toString(36) + Math.random().toString(36).slice(2, 5),

  genCode: () =>
    Math.random().toString(36).slice(2, 8).toUpperCase(),

  // ── Date / time helpers ───────────────────────────────
  today: () => new Date().toISOString().split('T')[0],

  nowISO: () => new Date().toISOString(),

  /**
   * Returns "YYYY-MM" for a given month offset from today.
   * offset=0  → current month
   * offset=-1 → last month
   */
  monthKey(offset = 0) {
    const d = new Date();
    d.setMonth(d.getMonth() + offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  },

  fmtDate: (dateStr) =>
    new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short',
    }),

  fmtDateFull: (dateStr) =>
    new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short',
    }),

  fmtTime: (isoStr) =>
    new Date(isoStr).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit',
    }),

  fmtMonth(offset = 0) {
    const d = new Date();
    d.setMonth(d.getMonth() + offset);
    return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  },

  /** Human-readable relative time ("2h ago", "just now", etc.) */
  relTime(isoStr) {
    const s = Math.floor((Date.now() - new Date(isoStr)) / 1000);
    if (s < 60)    return 'just now';
    if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  },

  // ── Settlement algorithm ──────────────────────────────
  /**
   * Greedy minimum-transaction debt simplification.
   *
   * Given:
   *   memberIds — array of user IDs in the group
   *   nameMap   — { [id]: name }
   *   totals    — { [id]: amountSpent }
   *
   * Returns:
   *   { txns, share, total, balances }
   *
   * txns: [ { from, fromId, to, toId, amount } ]
   * balances: [ { id, name, bal, spent } ]  (bal > 0 = overpaid)
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

    // Separate creditors (overpaid) and debtors (underpaid)
    const pos = balances.filter(b => b.bal >  0.5).map(x => ({ ...x })).sort((a, b) => b.bal - a.bal);
    const neg = balances.filter(b => b.bal < -0.5).map(x => ({ ...x })).sort((a, b) => a.bal - b.bal);

    const txns = [];
    let pi = 0, ni = 0;

    while (pi < pos.length && ni < neg.length) {
      const amt = Math.min(pos[pi].bal, -neg[ni].bal);
      if (amt > 0.5) {
        txns.push({
          from:   neg[ni].name,
          fromId: neg[ni].id,
          to:     pos[pi].name,
          toId:   pos[pi].id,
          amount: Math.round(amt),
        });
      }
      pos[pi].bal -= amt;
      neg[ni].bal += amt;
      if (pos[pi].bal < 0.5) pi++;
      if (neg[ni].bal > -0.5) ni++;
    }

    return {
      txns,
      share:    Math.round(share),
      total:    Math.round(total),
      balances,
    };
  },

  // ── Custom split ──────────────────────────────────────
  /**
   * Given a total amount, a list of member IDs, and a weights map,
   * return how much each member owes.
   * weights: { [memberId]: number }
   */
  customSplit(total, memberIds, weights) {
    const wSum = memberIds.reduce((s, id) => s + (parseFloat(weights[id]) || 0), 0);
    if (wSum === 0) return {};
    const out = {};
    memberIds.forEach(id => {
      out[id] = Math.round((total * (parseFloat(weights[id]) || 0)) / wSum);
    });
    return out;
  },

  // ── Expense filtering ─────────────────────────────────
  /**
   * Filter an array of expense objects.
   * { date, cat, search }  — any combination, all optional.
   */
  filterExpenses(expenses, { date = '', cat = '', search = '' } = {}) {
    return expenses.filter(e => {
      if (date && e.date !== date) return false;
      if (cat  && (e.category || 'other') !== cat) return false;
      if (search) {
        const q = search.toLowerCase();
        const inItem = e.item.toLowerCase().includes(q);
        const inNote = (e.note || '').toLowerCase().includes(q);
        if (!inItem && !inNote) return false;
      }
      return true;
    });
  },

  // ── CSV export ────────────────────────────────────────
  /**
   * Build a CSV string from expenses for a given month and
   * trigger a browser download.
   */
  exportCSV(members, expenses, groupName, monthOffset = 0) {
    const mk = DomainModel.monthKey(monthOffset);
    const nameOf = id => members.find(m => m.id === id)?.name || '?';

    const headers = ['Member', 'Item', 'Category', 'Amount (₹)', 'Date', 'Time', 'Recurring', 'Note'];
    const rows = [headers];

    expenses
      .filter(e => e.date?.startsWith(mk))
      .forEach(e => {
        rows.push([
          nameOf(e.userId),
          e.item,
          e.category || 'other',
          e.amount,
          e.date,
          DomainModel.fmtTime(e.time),
          e.recurring ? 'Yes' : 'No',
          e.note || '',
        ]);
      });

    const csv = rows
      .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const url  = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const link = Object.assign(document.createElement('a'), {
      href:     url,
      download: `${groupName.replace(/\s+/g, '-')}-${mk}.csv`,
    });
    link.click();
    URL.revokeObjectURL(url);
  },
};

export default DomainModel;
