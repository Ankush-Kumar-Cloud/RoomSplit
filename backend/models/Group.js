const mongoose = require('mongoose');

/**
 * Group Schema
 * ─────────────────────────────────────────────────────────
 * A group represents a flat/household. Members join via a
 * unique 6-character invite code. The ownerId is the creator
 * and transfers on leave.
 */
const groupSchema = new mongoose.Schema(
  {
    name: {
      type:      String,
      required:  [true, 'Group name is required'],
      trim:      true,
      maxlength: [80, 'Group name cannot exceed 80 characters'],
    },
    owner: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref:  'User',
      },
    ],
    inviteCode: {
      type:     String,
      required: true,
      unique:   true,
      uppercase: true,
      trim:     true,
      length:   6,
    },
  },
  { timestamps: true }
);

/* ── Ensure owner is always in members ── */
groupSchema.pre('save', function (next) {
  const ownerStr = this.owner.toString();
  const isMember = this.members.some(m => m.toString() === ownerStr);
  if (!isMember) this.members.push(this.owner);
  next();
});

/* ── Index for fast invite-code lookups ── */
groupSchema.index({ inviteCode: 1 });

module.exports = mongoose.model('Group', groupSchema);
