import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { adminAuth } from '../middleware/adminAuth.js';
import { upload } from '../middleware/upload.js';
import Product from '../models/Product.js';

const router = express.Router();

// GET /api/products — Get all products with optional filters
router.get('/', async (req, res) => {
  try {
    const { category, brand, subcategory, minPrice, maxPrice, size, color, search, sort, featured, newArrival, page = 1, limit = 12 } = req.query;

    let filter = {};

    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (subcategory) filter.subcategory = subcategory;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (size) filter.sizes = size;
    if (color) filter.colors = { $elemMatch: { name: { $regex: new RegExp(`^${color}$`, 'i') } } };
    if (featured === 'true') filter.featured = true;
    if (newArrival === 'true') filter.newArrival = true;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { subcategory: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = {};
    if (sort === 'price-low') sortOption.price = 1;
    else if (sort === 'price-high') sortOption.price = -1;
    else if (sort === 'newest') sortOption.createdAt = -1;
    else if (sort === 'popular') sortOption.reviews = -1;
    else sortOption.createdAt = -1;

    // Default: Sort by stock (in stock > out of stock), then by selected sort option
    const aggregatePipeline = [
      { $match: filter },
      { $addFields: { outOfStock: { $cond: [{ $eq: ["$stock", 0] }, 1, 0] } } },
      { $sort: { outOfStock: 1, ...sortOption } },
      { $skip: (Number(page) - 1) * Number(limit) },
      { $limit: Number(limit) }
    ];

    const products = await Product.aggregate(aggregatePipeline);
    const total = await Product.countDocuments(filter);

    // After aggregate, we lose Mongoose id getters if any, but since we use string `id` field, it's fine.

    res.json({
      products,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products', details: err.message });
  }
});

// GET /api/products/featured
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ featured: true })
      .sort({ stock: -1, createdAt: -1 }); // Quick stock sort approximations
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch featured products' });
  }
});

// GET /api/products/new-arrivals
router.get('/new-arrivals', async (req, res) => {
  try {
    const products = await Product.find({ newArrival: true })
      .sort({ stock: -1, createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch new arrivals' });
  }
});

// GET /api/products/search?q=...
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const query = new RegExp(q, 'i');
    const products = await Product.find({
      $or: [
        { name: query },
        { brand: query },
        { subcategory: query }
      ]
    }).limit(8);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST /api/products — Admin: Add product
router.post('/', adminAuth, upload.array('images', 5), async (req, res) => {
  try {
    // Cloudinary returns full URL in file.path
    const images = req.files ? req.files.map(f => f.path) : [];
    
    const newProduct = new Product({
      id: `prod-${uuidv4().slice(0, 8)}`,
      name: req.body.name,
      brand: req.body.brand,
      category: req.body.category,
      subcategory: req.body.subcategory,
      price: Number(req.body.price),
      comparePrice: req.body.comparePrice ? Number(req.body.comparePrice) : null,
      description: req.body.description,
      sizes: JSON.parse(req.body.sizes || '[]'),
      colors: JSON.parse(req.body.colors || '[]'),
      images: images, 
      stock: Number(req.body.stock || 0),
      featured: req.body.featured === 'true',
      newArrival: req.body.newArrival === 'true',
      rating: 0,
      reviews: 0
    });
    
    const saved = await newProduct.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add product', details: err.message });
  }
});

// PUT /api/products/:id — Admin: Update product
router.put('/:id', adminAuth, upload.array('images', 5), async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const newImages = req.files ? req.files.map(f => f.path) : [];
    const retainedImages = req.body.existingImages ? JSON.parse(req.body.existingImages) : product.images;

    if (req.body.name) product.name = req.body.name;
    if (req.body.brand) product.brand = req.body.brand;
    if (req.body.category) product.category = req.body.category;
    if (req.body.subcategory) product.subcategory = req.body.subcategory;
    if (req.body.price) product.price = Number(req.body.price);
    if (req.body.comparePrice) product.comparePrice = Number(req.body.comparePrice);
    if (req.body.description) product.description = req.body.description;
    if (req.body.sizes) product.sizes = JSON.parse(req.body.sizes);
    if (req.body.colors) product.colors = JSON.parse(req.body.colors);
    
    product.images = [...retainedImages, ...newImages];
    
    if (req.body.stock !== undefined) product.stock = Number(req.body.stock);
    if (req.body.featured !== undefined) product.featured = req.body.featured === 'true';
    if (req.body.newArrival !== undefined) product.newArrival = req.body.newArrival === 'true';

    const saved = await product.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product', details: err.message });
  }
});

// DELETE /api/products/:id — Admin: Delete product
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const result = await Product.findOneAndDelete({ id: req.params.id });
    if (!result) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
