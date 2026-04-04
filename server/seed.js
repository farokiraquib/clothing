import 'dotenv/config';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { connectDB } from './config/db.js';

import Product from './models/Product.js';
import Category from './models/Category.js';
import Brand from './models/Brand.js';
import Order from './models/Order.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function seedData() {
  await connectDB();

  try {
    // 1. Read JSON data
    const productsData = JSON.parse(fs.readFileSync(join(__dirname, 'data', 'products.json'), 'utf-8'));
    const categoriesData = JSON.parse(fs.readFileSync(join(__dirname, 'data', 'categories.json'), 'utf-8'));
    const brandsData = JSON.parse(fs.readFileSync(join(__dirname, 'data', 'brands.json'), 'utf-8'));
    const ordersData = JSON.parse(fs.readFileSync(join(__dirname, 'data', 'orders.json'), 'utf-8'));

    // 2. Clear existing collections to avoid duplicates on re-run
    console.log('Clearing old data...');
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Brand.deleteMany({});
    await Order.deleteMany({});

    // 3. Process Products (remove fake reviews, reset images)
    console.log('Processing products...');
    const cleanedProducts = productsData.map(p => ({
      ...p,
      rating: 0,
      reviews: 0,
      images: [] // Empty images!
    }));

    // 4. Process Categories (reset images)
    const cleanedCategories = categoriesData.map(c => ({
      ...c,
      image: '' // Empty banners
    }));

    // 5. Insert data
    console.log('Inserting into MongoDB...');
    await Product.insertMany(cleanedProducts);
    await Category.insertMany(cleanedCategories);
    await Brand.insertMany(brandsData);
    await Order.insertMany(ordersData);

    console.log('✅ Seed completed successfully!');
    process.exit();
  } catch (error) {
    console.error('❌ Error with seed data:', error);
    process.exit(1);
  }
}

seedData();
