import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { adminAuth } from '../middleware/adminAuth.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'mock_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'mock_key_secret',
});


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
    const { orderId } = req.query;
    if (!orderId) return res.status(400).json({ error: 'Order ID is required' });

    const order = await Order.findOne({ id: orderId.trim() });

    if (!order) return res.status(404).json({ error: 'Order not found' });
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

// POST /api/orders/razorpay/create — Create Razorpay order
router.post('/razorpay/create', async (req, res) => {
  try {
    const options = {
      amount: Math.round(req.body.amount * 100), // amount in paise
      currency: "INR",
      receipt: `rcpt_${uuidv4().slice(0, 8)}`
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create Razorpay order', details: err.message });
  }
});

// POST /api/orders/razorpay/verify — Verify Razorpay payment
router.post('/razorpay/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, internal_order_id } = req.body;
    
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature === razorpay_signature) {
      if (internal_order_id) {
        await Order.findOneAndUpdate({ id: internal_order_id }, { paymentStatus: 'Paid' });
      }
      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Verification failed', details: err.message });
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
