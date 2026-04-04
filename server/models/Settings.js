import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  id: { type: String, default: 'global' },
  heroImage1: { type: String, default: '' },
  heroImage2: { type: String, default: '' },
}, {
  timestamps: true
});

export default mongoose.model('Settings', settingsSchema);
