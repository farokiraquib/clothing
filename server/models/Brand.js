import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  logo: { type: String, default: '' },
  description: { type: String, default: '' }
});

export default mongoose.model('Brand', brandSchema);
