import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  productType: { type: String, enum: ['clothing', 'accessories', 'footwear', 'pet-accessories', 'custom'], default: 'clothing' },
  name: { type: String, required: true },
  brand: { type: String },
  category: { type: String },
  subcategory: { type: String },
  price: { type: Number, required: true },
  comparePrice: { type: Number },
  description: { type: String, required: true },
  sizes: [String],
  colors: [{ name: String, hex: String, qikinkCode: String }],
  material: { type: String },
  images: [String],
  stock: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  newArrival: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  isCustomizable: { type: Boolean, default: false },
  qikinkSku: { type: String },
  qikinkPrintTypeId: { type: Number },
  qikinkVariants: [{ color: String, size: String, sku: String }]
}, {
  timestamps: true
});

export default mongoose.model('Product', productSchema);
