import express from 'express';
import Review from '../models/Review.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

const router = express.Router();

// GET /api/reviews/:productId — Get all verified reviews for a product
router.get('/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId, verified: true }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// POST /api/reviews — Submit a new review
router.post('/', async (req, res) => {
  try {
    const { productId, customerName, customerEmail, rating, comment } = req.body;

    // Check if the user has actually purchased this product
    // Find any order where customer.email matches (case-insensitive) AND items contains the productId
    const pastOrder = await Order.findOne({
      'customer.email': { $regex: new RegExp(`^${customerEmail}$`, 'i') },
      'items.productId': productId
    });

    if (!pastOrder) {
      return res.status(403).json({ 
        error: 'You must purchase this product before leaving a review.' 
      });
    }

    // Check if they already reviewed it (optional, but good practice)
    const existingReview = await Review.findOne({
      productId,
      customerEmail
    });

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this product.' });
    }

    const newReview = new Review({
      productId,
      orderId: pastOrder.id,
      customerName,
      customerEmail,
      rating: Number(rating),
      comment,
      verified: true
    });

    await newReview.save();

    // Recalculate average rating for the product
    const productReviews = await Review.find({ productId, verified: true });
    const totalRating = productReviews.reduce((sum, rev) => sum + rev.rating, 0);
    const avgRating = totalRating / productReviews.length;

    await Product.findOneAndUpdate(
      { id: productId },
      { 
        $set: { rating: avgRating },
        $inc: { reviews: 1 } 
      }
    );

    res.status(201).json(newReview);
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit review', details: err.message });
  }
});

export default router;
