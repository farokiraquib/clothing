import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  orderId: { type: String }, // Can be used as proof of purchase internally, optional
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  verified: { type: Boolean, default: false }
}, {
  timestamps: true
});

export default mongoose.model('Review', reviewSchema);
