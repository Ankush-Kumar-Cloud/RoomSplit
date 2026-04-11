const express  = require('express');
const { body } = require('express-validator');
const { signup, login, getMe, updateProfile } = require('../controllers/authController');
const { protect }  = require('../middleware/auth');
const validate     = require('../middleware/validate');

const router = express.Router();

// POST /api/auth/signup
router.post(
  '/signup',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    validate,
  ],
  signup
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
    validate,
  ],
  login
);

// GET  /api/auth/me
router.get('/me', protect, getMe);

// PUT  /api/auth/me
router.put('/me', protect, updateProfile);

module.exports = router;
