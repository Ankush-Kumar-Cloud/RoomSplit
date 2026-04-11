const Budget     = require('../models/Budget');
const Settlement = require('../models/Settlement');
const Group      = require('../models/Group');

/* ════════════════════════════════════════
   BUDGET CONTROLLER
════════════════════════════════════════ */

/**
 * @route  GET /api/groups/:groupId/budgets?month=YYYY-MM
 * @access Private — group members
 */
const getBudgets = async (req, res) => {
  try {
    const { month } = req.query;
    const filter = { group: req.params.groupId };
    if (month) filter.monthKey = month;

    const budgets = await Budget.find(filter).populate('user', 'name email');
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @route  PUT /api/groups/:groupId/budgets
 * @body   { userId, monthKey, amount }
 * @access Private — any member can set their own budget
 */
const upsertBudget = async (req, res) => {
  try {
    const { userId, monthKey, amount } = req.body;

    // Only allow setting your own budget (or owner can set any)
    const group = await Group.findById(req.params.groupId).select('owner members');
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const isOwner = group.owner.toString() === req.user._id.toString();
    const isSelf  = userId === req.user._id.toString();
    if (!isOwner && !isSelf) {
      return res.status(403).json({ message: 'You can only set your own budget' });
    }

    const budget = await Budget.findOneAndUpdate(
      { group: req.params.groupId, user: userId, monthKey },
      { amount: parseFloat(amount) || 0 },
      { upsert: true, new: true }
    ).populate('user', 'name email');

    res.json(budget);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ════════════════════════════════════════
   SETTLEMENT CONTROLLER
════════════════════════════════════════ */

/**
 * @route  GET /api/groups/:groupId/settlements?month=YYYY-MM
 * @access Private — group members
 */
const getSettlements = async (req, res) => {
  try {
    const { month } = req.query;
    const filter = { group: req.params.groupId };
    if (month) filter.monthKey = month;

    const settlements = await Settlement.find(filter);
    res.json(settlements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @route  POST /api/groups/:groupId/settlements/toggle
 * @body   { monthKey, txnIndex }
 * @access Private — any group member
 */
const toggleSettlement = async (req, res) => {
  try {
    const { monthKey, txnIndex } = req.body;

    const existing = await Settlement.findOne({
      group:    req.params.groupId,
      monthKey,
      txnIndex,
    });

    let settlement;
    if (existing) {
      existing.paid = !existing.paid;
      existing.markedBy = req.user._id;
      settlement = await existing.save();
    } else {
      settlement = await Settlement.create({
        group:    req.params.groupId,
        monthKey,
        txnIndex,
        paid:     true,
        markedBy: req.user._id,
      });
    }

    res.json(settlement);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getBudgets, upsertBudget, getSettlements, toggleSettlement };
