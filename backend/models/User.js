const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

/**
 * User Schema
 * ─────────────────────────────────────────────────────────
 * Stores registered users. Passwords are hashed with bcrypt
 * before saving — never stored in plain text.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, 'Name is required'],
      trim:     true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type:      String,
      required:  [true, 'Email is required'],
      unique:    true,
      lowercase: true,
      trim:      true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email',
      ],
    },
    password: {
      type:      String,
      required:  [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select:    false, // never return password in queries by default
    },
  },
  { timestamps: true }
);

/* ── Hash password before saving ── */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt   = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/* ── Instance method: compare plain-text with hash ── */
userSchema.methods.matchPassword = async function (plainText) {
  return bcrypt.compare(plainText, this.password);
};

/* ── Virtual: safe public profile (no password) ── */
userSchema.methods.toPublic = function () {
  return {
    _id:       this._id,
    name:      this.name,
    email:     this.email,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
