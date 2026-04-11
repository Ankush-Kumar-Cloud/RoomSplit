const jwt  = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect
 * ─────────────────────────────────────────────────────────
 * Express middleware that validates a Bearer JWT from the
 * Authorization header and attaches the User document to
 * req.user for downstream handlers.
 */
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorised — no token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user (without password) to request
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
};

/**
 * generateToken
 * ─────────────────────────────────────────────────────────
 * Creates a signed JWT for a given userId.
 * Called by auth controller after login / signup.
 */
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

module.exports = { protect, generateToken };
