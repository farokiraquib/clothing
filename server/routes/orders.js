import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { adminAuth } from '../middleware/adminAuth.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

const router = express.Router();

// GET /api/orders — Admin only
router.get('/', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/track — Public Tracking
router.get('/track', async (req, res) => {
  try {
    const { orderId, email } = req.query;
    if (!orderId || !email) return res.status(400).json({ error: 'Order ID and email are required' });

    const order = await Order.findOne({ 
      id: orderId.trim(), 
      'customer.email': { $regex: new RegExp(`^${email.trim()}$`, 'i') } 
    });

    if (!order) return res.status(404).json({ error: 'Order not found with these details' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to track order' });
  }
});

// GET /api/orders/:id
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findOne({ id: req.params.id });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// POST /api/orders — Create new order (from checkout)
router.post('/', async (req, res) => {
  try {
    const newOrder = new Order({
      id: `ORD-${uuidv4().slice(0, 8).toUpperCase()}`,
      customer: req.body.customer,
      items: req.body.items,
      subtotal: req.body.subtotal,
      shipping: req.body.shipping || 0,
      total: req.body.total,
      status: 'Processing',
      paymentStatus: 'Pending'
    });

    const saved = await newOrder.save();

    // Update product stock
    if (newOrder.items && newOrder.items.length > 0) {
      for (const item of newOrder.items) {
        await Product.findOneAndUpdate(
          { id: item.productId },
          { $inc: { stock: -(item.quantity || 1) } }
        );
      }
    }

    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create order', details: err.message });
  }
});

// PUT /api/orders/:id — Admin: Update order status
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const order = await Order.findOne({ id: req.params.id });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (req.body.status) order.status = req.body.status;
    if (req.body.paymentStatus) order.paymentStatus = req.body.paymentStatus;

    const saved = await order.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

export default router;
