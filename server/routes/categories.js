import express from 'express';
import { adminAuth } from '../middleware/adminAuth.js';
import { upload } from '../middleware/upload.js';
import Category from '../models/Category.js';

const router = express.Router();

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST /api/categories — Admin only
router.post('/', adminAuth, async (req, res) => {
  try {
    const newCategory = new Category({
      id: req.body.name.toLowerCase().replace(/\s+/g, '-'),
      name: req.body.name,
      image: req.body.image || '',
      subcategories: req.body.subcategories || []
    });
    const saved = await newCategory.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add category' });
  }
});

// PUT /api/categories/:id — Admin only
router.put('/:id', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const category = await Category.findOne({ id: req.params.id });
    if (!category) return res.status(404).json({ error: 'Category not found' });

    if (req.file) {
      category.image = req.file.path; // Cloudinary URL
    }
    if (req.body.name) category.name = req.body.name;
    if (req.body.subcategories) category.subcategories = JSON.parse(req.body.subcategories);

    const saved = await category.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update category', details: err.message });
  }
});

// DELETE /api/categories/:id — Admin only
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await Category.findOneAndDelete({ id: req.params.id });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;
