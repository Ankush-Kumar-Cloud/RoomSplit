const mongoose = require('mongoose');

/**
 * Budget Schema
 * ─────────────────────────────────────────────────────────
 * Stores a monthly spending budget per user per group.
 * monthKey format: "YYYY-MM"
 */
const budgetSchema = new mongoose.Schema(
  {
    group: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Group',
      required: true,
    },
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    monthKey: {
      type:    String,
      required: true,
      match:   [/^\d{4}-\d{2}$/, 'monthKey must be in YYYY-MM format'],
    },
    amount: {
      type:    Number,
      required: true,
      min:     [0, 'Budget cannot be negative'],
    },
  },
  { timestamps: true }
);

/* ── One budget per user per group per month ── */
budgetSchema.index({ group: 1, user: 1, monthKey: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
