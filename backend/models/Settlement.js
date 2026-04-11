const mongoose = require('mongoose');

/**
 * Settlement Schema
 * ─────────────────────────────────────────────────────────
 * Tracks which computed settlement transactions have been
 * manually marked as "paid" by group members.
 *
 * txnIndex: position of the transaction in the calculated
 * list (0-based). Combined with group + monthKey it
 * uniquely identifies a settlement action.
 */
const settlementSchema = new mongoose.Schema(
  {
    group: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Group',
      required: true,
    },
    monthKey: {
      type:     String,
      required: true,
      match:    [/^\d{4}-\d{2}$/, 'monthKey must be in YYYY-MM format'],
    },
    txnIndex: {
      type:     Number,
      required: true,
    },
    paid: {
      type:    Boolean,
      default: true,
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
    },
  },
  { timestamps: true }
);

/* ── One record per transaction per month per group ── */
settlementSchema.index({ group: 1, monthKey: 1, txnIndex: 1 }, { unique: true });

module.exports = mongoose.model('Settlement', settlementSchema);
