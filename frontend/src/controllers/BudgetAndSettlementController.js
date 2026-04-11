import { Budgets, Settlements } from '../model/ApiModel';

/* ══════════════════════════════════════════
   BUDGET CONTROLLER
══════════════════════════════════════════ */
const makeBudgetController = (state, patch, groupId) => {
  const setList = (list) =>
    patch({ budgets: { ...state.budgets, [groupId]: list } });

  const getList = () => state.budgets[groupId] || [];

  return {
    async load(month) {
      const list = await Budgets.getAll(groupId, month);
      setList(list);
      return list;
    },

    async set(userId, monthKey, amount) {
      const updated = await Budgets.upsert(groupId, userId, monthKey, amount);
      const list    = getList();
      const idx     = list.findIndex(b => b.user?._id === userId && b.monthKey === monthKey);
      setList(idx >= 0 ? list.map((b, i) => i === idx ? updated : b) : [...list, updated]);
      return updated;
    },

    /** Return budget amount for a user in a month (0 if unset). */
    get(userId, monthKey) {
      const b = getList().find(b => {
        const bid = b.user?._id || b.user;
        return bid === userId && b.monthKey === monthKey;
      });
      return b?.amount || 0;
    },
  };
};

/* ══════════════════════════════════════════
   SETTLEMENT CONTROLLER
══════════════════════════════════════════ */
const makeSettlementController = (state, patch, groupId) => {
  const cacheKey = (mk) => `${groupId}-${mk}`;
  const getList  = (mk) => state.settlements[cacheKey(mk)] || [];

  const setList = (mk, list) =>
    patch({ settlements: { ...state.settlements, [cacheKey(mk)]: list } });

  return {
    async load(monthKey) {
      const list = await Settlements.getAll(groupId, monthKey);
      setList(monthKey, list);
      return list;
    },

    async toggle(monthKey, txnIndex) {
      const record = await Settlements.toggle(groupId, monthKey, txnIndex);
      const list   = getList(monthKey);
      const idx    = list.findIndex(s => s.txnIndex === txnIndex);
      setList(monthKey, idx >= 0 ? list.map((s, i) => i === idx ? record : s) : [...list, record]);
      return record;
    },

    isPaid(monthKey, txnIndex) {
      return getList(monthKey).some(s => s.txnIndex === txnIndex && s.paid);
    },
  };
};

export { makeBudgetController, makeSettlementController };
