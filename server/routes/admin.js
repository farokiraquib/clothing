import express from 'express';
import { adminAuth } from '../middleware/adminAuth.js';
import { upload } from '../middleware/upload.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Settings from '../models/Settings.js';

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

// GET /api/admin/stats — Dashboard statistics
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const lowStock = await Product.countDocuments({ stock: { $lt: 10 } });
    const processingOrders = await Order.countDocuments({ status: 'Processing' });
    
    // Calculate total revenue
    const revenueAggregation = await Order.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
    ]);
    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

    res.json({
      totalProducts,
      totalOrders,
      totalRevenue,
      lowStock,
      processingOrders
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// POST /api/admin/upload — Upload image(s) via Cloudinary
router.post('/upload', adminAuth, upload.array('images', 5), (req, res) => {
  try {
    // req.files containing path handles the Cloudinary URL return
    const urls = req.files.map(f => f.path);
    res.json({ urls });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

// GET /api/admin/customers/export — Export unique customer emails to CSV
router.get('/customers/export', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find({}, 'customer');
    
    // Extract unique customers
    const customersMap = new Map();
    orders.forEach(o => {
      if (o.customer && o.customer.email) {
        customersMap.set(o.customer.email.toLowerCase(), o.customer);
      }
    });

    const uniqueCustomers = Array.from(customersMap.values());

    // Generate CSV
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

// GET /api/admin/settings — Get global store settings
router.get('/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne({ id: 'global' });
    if (!settings) {
      settings = new Settings({ id: 'global' });
      await settings.save();
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT /api/admin/settings — Update global store settings
router.put('/settings', adminAuth, async (req, res) => {
  try {
    let settings = await Settings.findOne({ id: 'global' });
    if (!settings) settings = new Settings({ id: 'global' });

    if (req.body.heroImage1 !== undefined) settings.heroImage1 = req.body.heroImage1;
    if (req.body.heroImage2 !== undefined) settings.heroImage2 = req.body.heroImage2;

    const saved = await settings.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
