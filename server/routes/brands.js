import express from 'express';
import { adminAuth } from '../middleware/adminAuth.js';
import Brand from '../models/Brand.js';

const router = express.Router();

// GET /api/brands
router.get('/', async (req, res) => {
  try {
    const brands = await Brand.find();
    res.json(brands);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

// POST /api/brands — Admin only
router.post('/', adminAuth, async (req, res) => {
  try {
    const newBrand = new Brand({
      id: req.body.name.toLowerCase().replace(/\s+/g, '-'),
      name: req.body.name,
      logo: req.body.logo || '',
      description: req.body.description || ''
    });
    const saved = await newBrand.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add brand' });
  }
});

// DELETE /api/brands/:id — Admin only
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await Brand.findOneAndDelete({ id: req.params.id });
    res.json({ message: 'Brand deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete brand' });
  }
});

export default router;
