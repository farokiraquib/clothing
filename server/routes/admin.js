import express from 'express';
import { adminAuth } from '../middleware/adminAuth.js';
import { upload } from '../middleware/upload.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Settings from '../models/Settings.js';
import { Expo } from 'expo-server-sdk';
import mongoose from 'mongoose';

const router = express.Router();

// POST /api/admin/login
router.post('/login', (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    res.json({ success: true, message: 'Admin access granted' });
  } else {
    res.status(401).json({ success: false, error: 'Invalid password' });
  }
});

// GET /api/admin/stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const lowStock = await Product.countDocuments({ stock: { $lt: 10 } });
    const processingOrders = await Order.countDocuments({ status: 'Processing' });
    const revenueAggregation = await Order.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
    ]);
    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;
    res.json({ totalProducts, totalOrders, totalRevenue, lowStock, processingOrders });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// POST /api/admin/upload — Upload image(s) via Cloudinary
router.post('/upload', adminAuth, (req, res) => {
  upload.array('images', 10)(req, res, (err) => {
    if (err) {
      console.error('Upload Error:', err);
      return res.status(500).json({ error: err.message || 'Upload failed' });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }
    const urls = req.files.map(f => f.path);
    res.json({ urls });
  });
});

// GET /api/admin/customers/export
router.get('/customers/export', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find({}, 'customer');
    const customersMap = new Map();
    orders.forEach(o => {
      if (o.customer && o.customer.email) {
        customersMap.set(o.customer.email.toLowerCase(), o.customer);
      }
    });
    const uniqueCustomers = Array.from(customersMap.values());
    let csv = 'Name,Email,Phone,City,State\n';
    uniqueCustomers.forEach(c => {
      const name = (c.name || '').replace(/,/g, '');
      const phone = c.phone || '';
      const city = (c.city || '').replace(/,/g, '');
      const state = (c.state || '').replace(/,/g, '');
      csv += `${name},${c.email},${phone},${city},${state}\n`;
    });
    res.header('Content-Type', 'text/csv');
    res.attachment('customers.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: 'Failed to export customers' });
  }
});

// ── Settings ──────────────────────────────────────────────

// GET /api/admin/settings
router.get('/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne({ id: 'global' });
    if (!settings) { settings = new Settings({ id: 'global' }); await settings.save(); }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT /api/admin/settings
router.put('/settings', adminAuth, async (req, res) => {
  try {
    let settings = await Settings.findOne({ id: 'global' });
    if (!settings) settings = new Settings({ id: 'global' });
    if (req.body.heroImage1 !== undefined) settings.heroImage1 = req.body.heroImage1;
    if (req.body.heroImage2 !== undefined) settings.heroImage2 = req.body.heroImage2;
    if (req.body.banners !== undefined) settings.banners = req.body.banners;
    const saved = await settings.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// ── Banner CRUD ───────────────────────────────────────────

// GET /api/admin/banners
router.get('/banners', async (req, res) => {
  try {
    let settings = await Settings.findOne({ id: 'global' });
    if (!settings) { settings = new Settings({ id: 'global' }); await settings.save(); }
    const banners = (settings.banners || []).sort((a, b) => a.order - b.order);
    res.json(banners);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
});

// POST /api/admin/banners — Add a new banner
router.post('/banners', adminAuth, async (req, res) => {
  try {
    let settings = await Settings.findOne({ id: 'global' });
    if (!settings) settings = new Settings({ id: 'global' });
    const maxOrder = settings.banners.length > 0
      ? Math.max(...settings.banners.map(b => b.order))
      : -1;
    const newBanner = { ...req.body, order: maxOrder + 1 };
    settings.banners.push(newBanner);
    await settings.save();
    res.json(settings.banners.sort((a, b) => a.order - b.order));
  } catch (err) {
    res.status(500).json({ error: 'Failed to add banner' });
  }
});

// PUT /api/admin/banners/:bannerId — Edit a banner
router.put('/banners/:bannerId', adminAuth, async (req, res) => {
  try {
    let settings = await Settings.findOne({ id: 'global' });
    if (!settings) return res.status(404).json({ error: 'Settings not found' });
    const banner = settings.banners.id(req.params.bannerId);
    if (!banner) return res.status(404).json({ error: 'Banner not found' });
    Object.assign(banner, req.body);
    await settings.save();
    res.json(settings.banners.sort((a, b) => a.order - b.order));
  } catch (err) {
    res.status(500).json({ error: 'Failed to update banner' });
  }
});

// DELETE /api/admin/banners/:bannerId — Delete a banner
router.delete('/banners/:bannerId', adminAuth, async (req, res) => {
  try {
    let settings = await Settings.findOne({ id: 'global' });
    if (!settings) return res.status(404).json({ error: 'Settings not found' });
    settings.banners = settings.banners.filter(b => b._id.toString() !== req.params.bannerId);
    await settings.save();
    res.json(settings.banners.sort((a, b) => a.order - b.order));
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete banner' });
  }
});

// PUT /api/admin/banners/reorder — Reorder banners
router.put('/banners-reorder', adminAuth, async (req, res) => {
  try {
    // req.body.order = [{ id, order }, ...]
    let settings = await Settings.findOne({ id: 'global' });
    if (!settings) return res.status(404).json({ error: 'Settings not found' });
    req.body.order.forEach(({ id, order }) => {
      const banner = settings.banners.id(id);
      if (banner) banner.order = order;
    });
    await settings.save();
    res.json(settings.banners.sort((a, b) => a.order - b.order));
  } catch (err) {
    res.status(500).json({ error: 'Failed to reorder banners' });
  }
});

// ── Mobile App Routes (Bypass JWT for app testing) ──────────

// POST /api/admin/mobile/push-token
router.post('/mobile/push-token', async (req, res) => {
  const { expoPushToken } = req.body;
  if (!expoPushToken) return res.status(400).json({ success: false, message: 'expoPushToken required' });
  if (!Expo.isExpoPushToken(expoPushToken)) return res.status(400).json({ success: false, message: 'Invalid token' });

  try {
    const adminsCollection = mongoose.connection.db.collection('admins');
    await adminsCollection.findOneAndUpdate(
      {},
      {
        $addToSet: { expoPushTokens: expoPushToken },
        $setOnInsert: { name: 'Admin', email: 'admin@supremeit.com', createdAt: new Date() },
        $set: { updatedAt: new Date() },
      },
      { upsert: true, returnDocument: 'after' }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/mobile/push-token
router.delete('/mobile/push-token', async (req, res) => {
  const { expoPushToken } = req.body;
  if (!expoPushToken) return res.status(400).json({ success: false });
  try {
    const adminsCollection = mongoose.connection.db.collection('admins');
    await adminsCollection.updateMany({}, { $pull: { expoPushTokens: expoPushToken } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// GET /api/admin/mobile/orders
router.get('/mobile/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// PUT /api/admin/mobile/orders/:id/status
router.put('/mobile/orders/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ success: false });
  try {
    const result = await Order.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(req.params.id) },
      { $set: { status, updatedAt: new Date() } },
      { new: true }
    );
    if (!result) return res.status(404).json({ success: false });
    res.json({ success: true, order: result });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

export default router;
