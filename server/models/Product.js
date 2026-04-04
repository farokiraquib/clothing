import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  brand: { type: String, required: true },
  category: { type: String, required: true },
  subcategory: { type: String, required: true },
  price: { type: Number, required: true },
  comparePrice: { type: Number },
  description: { type: String, required: true },
  sizes: [String],
  colors: [{ name: String, hex: String }],
  images: [String],
  stock: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  newArrival: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 }
}, {
  timestamps: true
});

export default mongoose.model('Product', productSchema);
