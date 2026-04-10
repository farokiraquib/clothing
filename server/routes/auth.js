import express from 'express';
import User from '../models/User.js';
import Order from '../models/Order.js';
import { userAuth, signToken } from '../middleware/userAuth.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: 'An account with this email already exists' });

    const user = await new User({ name, email, password }).save();
    const token = signToken(user);
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, address: user.address } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to register', details: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: 'No account found with this email' });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ error: 'Incorrect password' });

    const token = signToken(user);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, address: user.address } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

// GET /api/auth/me
router.get('/me', userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// PUT /api/auth/me — Update profile
router.put('/me', userAuth, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, phone, address },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// GET /api/auth/orders — User's order history
router.get('/orders', userAuth, async (req, res) => {
  try {
    const orders = await Order.find({
      'customer.email': { $regex: new RegExp(`^${req.userEmail}$`, 'i') }
    }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

export default router;
