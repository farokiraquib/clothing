import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { adminAuth } from '../middleware/adminAuth.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { sendOrderNotification } from '../utils/pushNotifications.js';
import { sendOrderConfirmationEmail, sendOrderShippedEmail } from '../utils/emailService.js';
import { createQikinkOrder } from '../services/qikinkService.js';

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
    console.error('Razorpay Error:', err);
    res.status(500).json({ 
      error: 'Failed to create Razorpay order', 
      details: err.message || err.error?.description || JSON.stringify(err) 
    });
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
      let updatedOrder = null;
      if (internal_order_id) {
        updatedOrder = await Order.findOneAndUpdate(
          { id: internal_order_id }, 
          { paymentStatus: 'Paid' },
          { new: true }
        );
      }

      // Fire push notification only after successful payment
      if (updatedOrder) {
        sendOrderNotification(updatedOrder).catch(err => console.error('[push] Error:', err));
        sendOrderConfirmationEmail(updatedOrder).catch(err => console.error('[email] Error:', err));
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
      addOns: req.body.addOns,
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

// DELETE /api/orders/:id — Admin: Delete order
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const order = await Order.findOneAndDelete({ id: req.params.id });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// PUT /api/orders/:id — Admin: Update order status
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const order = await Order.findOne({ id: req.params.id });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const isNewlyShipped = req.body.status === 'Shipped' && order.status !== 'Shipped';

    if (req.body.status) order.status = req.body.status;
    if (req.body.paymentStatus) order.paymentStatus = req.body.paymentStatus;
    if (req.body.trackingLink !== undefined) order.trackingLink = req.body.trackingLink;
    if (req.body.trackingNumber !== undefined) order.trackingNumber = req.body.trackingNumber;

    const saved = await order.save();
    
    if (isNewlyShipped) {
      sendOrderShippedEmail(saved).catch(err => console.error('[email] Error:', err));
    }

    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// POST /api/orders/:id/qikink — Admin: Send order to Qikink
router.post('/:id/qikink', adminAuth, async (req, res) => {
  try {
    const order = await Order.findOne({ id: req.params.id });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (order.qikinkOrderId) {
      return res.status(400).json({ error: 'Order has already been sent to Qikink' });
    }

    // Build the items array for Qikink
    const qikinkItems = [];
    for (const item of order.items) {
      // Only process items that are customizable or have custom text/image
      // In a real scenario, you'd map these to specific Qikink SKUs
      // Since we added qikinkSku to Product, we need to fetch the product to get the SKU
      const product = await Product.findOne({ id: item.productId });
      
      if (product && (product.qikinkSku || (product.qikinkVariants && product.qikinkVariants.length > 0))) {
        let finalSku = product.qikinkSku;
        
        // Lookup specific variant SKU if variations exist
        if (product.qikinkVariants && product.qikinkVariants.length > 0) {
          const matchedVariant = product.qikinkVariants.find(v => 
            v.color.toLowerCase() === (item.color || 'Default').toLowerCase() && 
            v.size.toLowerCase() === (item.size || 'Default').toLowerCase()
          );
          if (matchedVariant && matchedVariant.sku) {
            finalSku = matchedVariant.sku;
          }
        }
        
        // If we still don't have a SKU, skip
        if (!finalSku) continue;

        qikinkItems.push({
          sku: finalSku,
          quantity: item.quantity || 1,
          size: item.size || 'M',
          color: item.color || 'White',
          design_url: item.customImage || '',
          productDesignUrl: (product.images && product.images.length > 0) ? product.images[0] : '',
          custom_text: item.customText || '',
          printTypeId: product.qikinkPrintTypeId,
          isCustomizable: product.isCustomizable
        });
      }
    }

    if (qikinkItems.length === 0) {
      return res.status(400).json({ error: 'No items found in this order that have a Qikink SKU assigned to them' });
    }

    // Parse the items for Qikink payload format
    const qikinkItemsPayload = qikinkItems.map(item => {
      const itemPayload = {
        search_from_my_products: 0,
        quantity: item.quantity.toString(),
        price: order.total.toString(),
        sku: item.sku
      };

      // Determine which design image to use
      const designImage = item.design_url || item.productDesignUrl;

      if (designImage) {
        itemPayload.designs = [{
          design_code: "Custom-Upload",
          width_inches: "",
          height_inches: "",
          placement_sku: "fr",
          design_link: designImage,
          mockup_link: designImage
        }];
        itemPayload.print_type_id = item.printTypeId || 5;
      } else {
        // Fallback: plain product (no design available)
        itemPayload.print_type_id = 1;
      }
      
      return itemPayload;
    });

    const qikinkPayload = {
      order_number: order.id.replace(/-/g, ''),
      qikink_shipping: "1",
      gateway: order.paymentStatus === 'Paid' ? 'Prepaid' : 'COD',
      total_order_value: order.total.toString(),
      shipping_address: {
        first_name: order.customer.name.split(' ')[0] || 'Customer',
        last_name: order.customer.name.split(' ').slice(1).join(' ') || '.',
        phone: order.customer.phone || '',
        email: order.customer.email || '',
        address1: order.customer.address || '',
        city: order.customer.city || '',
        province: order.customer.state || 'Maharashtra',
        zip: order.customer.pincode || '',
        country_code: 'IN'
      },
      line_items: qikinkItemsPayload
    };

    // Make the API call to Qikink
    try {
      const qikinkResponse = await createQikinkOrder(qikinkPayload);
      
      // Qikink response will usually have a unique ID for the created order
      const qikinkOrderId = qikinkResponse.order_id || qikinkResponse.order_number || 'UNKNOWN';

      order.isSentToQikink = true;
      order.qikinkOrderId = String(qikinkOrderId);
      order.qikinkStatus = 'Sent';
      await order.save();

      res.json({ message: 'Order successfully sent to Qikink', qikinkOrderId });
    } catch (apiError) {
      // If the API error is a Duplicate Order, it means we've successfully sent it before
      if (apiError.message && apiError.message.includes('Duplicate Order')) {
        order.isSentToQikink = true;
        order.qikinkOrderId = 'Duplicate';
        order.qikinkStatus = 'Sent';
        await order.save();
        return res.json({ message: 'Order was already sent to Qikink successfully', qikinkOrderId: 'Duplicate' });
      }
      throw apiError;
    }
  } catch (err) {
    console.error('Qikink Error:', err);
    res.status(500).json({ error: 'Failed to send to Qikink', details: err.message });
  }
});

export default router;
