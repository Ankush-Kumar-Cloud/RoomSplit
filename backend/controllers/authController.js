const User            = require('../models/User');
const { generateToken } = require('../middleware/auth');

/**
 * @route  POST /api/auth/signup
 * @access Public
 */

const signup = async (req, res) => {
  console.log(`yaha h ${req.body}`);
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user  = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({ token, user: user.toPublic() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @route  POST /api/auth/login
 * @access Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // select: false on password — must explicitly include it
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    res.json({ token, user: user.toPublic() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @route  GET /api/auth/me
 * @access Private
 */
const getMe = async (req, res) => {
  res.json({ user: req.user.toPublic() });
};

/**
 * @route  PUT /api/auth/me
 * @access Private
 */
const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }
    req.user.name = name.trim();
    await req.user.save();
    res.json({ user: req.user.toPublic() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { signup, login, getMe, updateProfile };
