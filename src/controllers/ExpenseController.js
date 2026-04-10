/**
 * ExpenseController
 * ─────────────────────────────────────────────────────────
 * CRUD for expenses. Bound to a specific (userId, groupId)
 * pair — callers never need to supply these manually.
 *
 * Expense shape:
 *   id, groupId, userId, item, amount, date, time,
 *   note, category, recurring, splitType, splitWeights
 */

import DomainModel from '../model/DomainModel';

const makeExpenseController = (state, patch, userId, groupId) => ({
  /** Add a new expense for the current user in the current group. */
  async add(form) {
    const id = DomainModel.genId();
    const expense = {
      id,
      groupId,
      userId,
      item:         form.item.trim(),
      amount:       parseFloat(form.amount),
      date:         form.date,
      time:         DomainModel.nowISO(),
      note:         (form.note || '').trim(),
      category:     form.category || 'other',
      recurring:    form.recurring || false,
      splitType:    form.splitType || 'equal',
      splitWeights: form.splitWeights || {},
    };
    patch({ expenses: { ...state.expenses, [id]: expense } });
  },

  /** Update an existing expense (only creator should call this). */
  async update(id, form) {
    const existing = state.expenses[id];
    if (!existing) return;

    patch({
      expenses: {
        ...state.expenses,
        [id]: {
          ...existing,
          item:         form.item.trim(),
          amount:       parseFloat(form.amount),
          date:         form.date,
          note:         (form.note || '').trim(),
          category:     form.category || 'other',
          recurring:    form.recurring || false,
          splitType:    form.splitType || 'equal',
          splitWeights: form.splitWeights || {},
        },
      },
    });
  },

  /** Delete an expense by ID. */
  async remove(id) {
    const { [id]: _, ...rest } = state.expenses;
    patch({ expenses: rest });
  },

  /** All expenses for this group, sorted newest-first. */
  forGroup: () =>
    Object.values(state.expenses)
      .filter(e => e.groupId === groupId)
      .sort((a, b) => new Date(b.time) - new Date(a.time)),

  /** Most recent N expenses for this group (for activity feed). */
  recent: (n = 10) =>
    Object.values(state.expenses)
      .filter(e => e.groupId === groupId)
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, n),

  /** All recurring expenses for this group. */
  recurring: () =>
    Object.values(state.expenses)
      .filter(e => e.groupId === groupId && e.recurring)
      .sort((a, b) => new Date(b.time) - new Date(a.time)),
});

export default makeExpenseController;
