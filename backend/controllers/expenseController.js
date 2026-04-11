const Expense = require('../models/Expense');
const Group   = require('../models/Group');

/* ── Guard: check user is member of group ── */
const assertMember = async (groupId, userId) => {
  const group = await Group.findById(groupId).select('members');
  if (!group) throw Object.assign(new Error('Group not found'), { status: 404 });
  const isMember = group.members.some(m => m.toString() === userId.toString());
  if (!isMember) throw Object.assign(new Error('Not a member of this group'), { status: 403 });
  return group;
};

/**
 * @route  GET /api/groups/:groupId/expenses
 * @access Private — group members only
 * @query  date     YYYY-MM-DD   — filter by exact date
 * @query  month    YYYY-MM      — filter by month
 * @query  category food|rent|…  — filter by category
 * @query  search   string       — search item name / note
 */
const getExpenses = async (req, res) => {
  try {
    await assertMember(req.params.groupId, req.user._id);

    const filter = { group: req.params.groupId };
    const { date, month, category, search } = req.query;

    if (date)     filter.date = date;
    if (month)    filter.date = { $regex: `^${month}` };
    if (category) filter.category = category;
    if (search) {
      const re = new RegExp(search, 'i');
      filter.$or = [{ item: re }, { note: re }];
    }

    const expenses = await Expense.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json(expenses);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

/**
 * @route  POST /api/groups/:groupId/expenses
 * @access Private — group members only
 */
const createExpense = async (req, res) => {
  try {
    await assertMember(req.params.groupId, req.user._id);

    const { item, amount, date, note, category, recurring, splitType, splitWeights } = req.body;

    const expense = await Expense.create({
      group:        req.params.groupId,
      user:         req.user._id,
      item:         item?.trim(),
      amount:       parseFloat(amount),
      date,
      note:         note?.trim() || '',
      category:     category || 'other',
      recurring:    recurring || false,
      splitType:    splitType || 'equal',
      splitWeights: splitWeights || {},
    });

    const populated = await expense.populate('user', 'name email');
    res.status(201).json(populated);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

/**
 * @route  PUT /api/groups/:groupId/expenses/:expenseId
 * @access Private — creator only
 */
const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.expenseId);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the creator can edit this expense' });
    }

    const { item, amount, date, note, category, recurring, splitType, splitWeights } = req.body;
    if (item)         expense.item         = item.trim();
    if (amount)       expense.amount       = parseFloat(amount);
    if (date)         expense.date         = date;
    if (note !== undefined) expense.note   = note.trim();
    if (category)     expense.category     = category;
    if (recurring !== undefined) expense.recurring = recurring;
    if (splitType)    expense.splitType    = splitType;
    if (splitWeights) expense.splitWeights = splitWeights;

    await expense.save();
    const populated = await expense.populate('user', 'name email');
    res.json(populated);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

/**
 * @route  DELETE /api/groups/:groupId/expenses/:expenseId
 * @access Private — creator only
 */
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.expenseId);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the creator can delete this expense' });
    }
    await expense.deleteOne();
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

module.exports = { getExpenses, createExpense, updateExpense, deleteExpense };
