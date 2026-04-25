const express = require('express');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const protect = require('../middleware/protect');

const router = express.Router();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

const sendToken = (user, status, res) => {
  const token = signToken(user._id);
  user.password = undefined;
  res.status(status).json({ success: true, token, user });
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, location } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email déjà utilisé' });
    const user = await User.create({ name, email, password, role, location });
    sendToken(user, 201, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email et mot de passe requis' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Identifiants incorrects' });

    sendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ success: true, user });
});

// PATCH /api/auth/me — mettre à jour son profil
router.patch('/me', protect, async (req, res) => {
  try {
    const allowed = ['name', 'bio', 'avatar', 'location'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;