import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    address: String,
    city: String,
    state: String,
    pincode: String
  },
  items: [{
    productId: { type: String, required: true },
    name: String,
    price: Number,
    quantity: Number,
    size: String,
    color: String,
    image: String,
    customText: String,
    customImage: String
  }],
  subtotal: { type: Number, required: true },
  shipping: { type: Number, default: 0 },
  addOns: {
    rushOrder: { type: Boolean, default: false },
    boxPacking: { type: Boolean, default: false },
    totalPrice: { type: Number, default: 0 },
    gst: { type: Number, default: 0 }
  },
  total: { type: Number, required: true },
  status: { type: String, default: 'Processing' },
  paymentStatus: { type: String, default: 'Pending' },
  qikinkOrderId: { type: String },
  trackingLink: { type: String },
  trackingNumber: { type: String }
}, {
  timestamps: true
});

export default mongoose.model('Order', orderSchema);
