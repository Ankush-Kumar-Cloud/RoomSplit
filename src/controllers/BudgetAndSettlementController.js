/**
 * BudgetController
 * ─────────────────────────────────────────────────────────
 * Monthly spending budget per member per group.
 * Storage key: "{groupId}-{userId}-{YYYY-MM}"
 */

const makeBudgetController = (state, patch) => ({
  /** Set (or update) a budget. Pass amount=0 to remove. */
  async set(groupId, userId, monthKey, amount) {
    const key    = `${groupId}-${userId}-${monthKey}`;
    const parsed = parseFloat(amount) || 0;
    patch({ budgets: { ...state.budgets, [key]: parsed } });
  },

  /** Get the budget for a member in a group for a given month. Returns 0 if unset. */
  get: (groupId, userId, monthKey) =>
    state.budgets[`${groupId}-${userId}-${monthKey}`] || 0,
});

export { makeBudgetController };

// ─────────────────────────────────────────────────────────

/**
 * SettlementController
 * ─────────────────────────────────────────────────────────
 * Tracks which calculated settlement transactions have been
 * manually marked as "paid" by the group members.
 *
 * Key format: "{groupId}-{YYYY-MM}-{txnIndex}"
 */

const makeSettlementController = (state, patch) => ({
  /** Toggle a transaction's paid status. */
  async toggle(key) {
    patch({ paid: { ...state.paid, [key]: !state.paid[key] } });
  },

  /** Check if a transaction has been marked paid. */
  isPaid: (key) => !!state.paid[key],
});

export { makeSettlementController };
