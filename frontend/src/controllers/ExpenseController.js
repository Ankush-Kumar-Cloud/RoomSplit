import { Expenses } from '../model/ApiModel';

/**
 * makeExpenseController
 * Bound to a specific groupId.
 * Keeps expenses[groupId] in global state in sync with the API.
 */
const makeExpenseController = (state, patch, groupId) => {
  /* Helper: update the expense list for this group in state */
  const setList = (list) =>
    patch({ expenses: { ...state.expenses, [groupId]: list } });

  const getList = () => state.expenses[groupId] || [];

  return {
    /** Fetch from API and cache in state. Pass filters object optionally. */
    async load(filters = {}) {
      const list = await Expenses.getAll(groupId, filters);
      setList(list);
      return list;
    },

    async add(form) {
      const expense = await Expenses.create(groupId, form);
      setList([expense, ...getList()]);
      return expense;
    },

    async update(expenseId, form) {
      const updated = await Expenses.update(groupId, expenseId, form);
      setList(getList().map(e => e._id === expenseId ? updated : e));
      return updated;
    },

    async remove(expenseId) {
      await Expenses.remove(groupId, expenseId);
      setList(getList().filter(e => e._id !== expenseId));
    },

    /** Return cached list, sorted newest-first */
    forGroup() {
      return [...getList()].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    },

    recent(n = 30) {
      return this.forGroup().slice(0, n);
    },
  };
};

export default makeExpenseController;
