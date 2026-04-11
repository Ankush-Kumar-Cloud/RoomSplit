const mongoose = require('mongoose');

/**
 * Expense Schema
 * ─────────────────────────────────────────────────────────
 * Each expense belongs to one group and one user (the payer).
 * Supports equal split, custom weighted split, or payer-only.
 */
const expenseSchema = new mongoose.Schema(
  {
    group: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Group',
      required: true,
      index:    true,
    },
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true,
    },
    item: {
      type:      String,
      required:  [true, 'Item name is required'],
      trim:      true,
      maxlength: [120, 'Item name cannot exceed 120 characters'],
    },
    amount: {
      type:     Number,
      required: [true, 'Amount is required'],
      min:      [0.01, 'Amount must be greater than 0'],
    },
    date: {
      type:     String, // stored as "YYYY-MM-DD" string for easy filtering
      required: [true, 'Date is required'],
      match:    [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
    },
    note: {
      type:    String,
      trim:    true,
      maxlength: [300, 'Note cannot exceed 300 characters'],
      default: '',
    },
    category: {
      type:    String,
      enum:    ['food', 'rent', 'util', 'grocery', 'transport', 'health', 'fun', 'other'],
      default: 'other',
    },
    recurring: {
      type:    Boolean,
      default: false,
    },
    splitType: {
      type:    String,
      enum:    ['equal', 'custom', 'payer'],
      default: 'equal',
    },
    /**
     * splitWeights: { userId: weightNumber }
     * Only used when splitType === 'custom'.
     * Stored as a plain JS object (Map-like).
     */
    splitWeights: {
      type:    Map,
      of:      Number,
      default: {},
    },
  },
  { timestamps: true }
);

/* ── Compound index for group + date queries (monthly totals) ── */
expenseSchema.index({ group: 1, date: 1 });

/* ── Compound index for per-user queries inside a group ── */
expenseSchema.index({ group: 1, user: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
