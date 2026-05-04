import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  url:       { type: String, required: true },
  tag:       { type: String, default: '' },
  headline:  { type: String, default: '' },
  sub:       { type: String, default: '' },
  cta:       { type: String, default: 'Shop Now' },
  link:      { type: String, default: '/shop' },
  align:     { type: String, default: 'left', enum: ['left', 'right'] },
  dark:      { type: Boolean, default: false },
  order:     { type: Number, default: 0 },
}, { _id: true });

const settingsSchema = new mongoose.Schema({
  id:         { type: String, default: 'global' },
  heroImage1: { type: String, default: '' },
  heroImage2: { type: String, default: '' },
  banners:    { type: [bannerSchema], default: [] },
}, { timestamps: true });

export default mongoose.model('Settings', settingsSchema);
