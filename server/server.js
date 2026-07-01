import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { connectDB } from './config/db.js';

import productsRouter from './routes/products.js';
import categoriesRouter from './routes/categories.js';
import brandsRouter from './routes/brands.js';
import ordersRouter from './routes/orders.js';
import adminRouter from './routes/admin.js';
import reviewsRouter from './routes/reviews.js';
import authRouter from './routes/auth.js';
import assistantRouter from './routes/assistant.js';
import customUploadRouter from './routes/customUpload.js';
import sitemapRouter from './routes/sitemap.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
// /uploads is removed as images are served from Cloudinary now

// API Routes
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/brands', brandsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/admin', adminRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/auth', authRouter);
app.use('/api/assistant', assistantRouter);
app.use('/api/custom-upload', customUploadRouter);

// Sitemap
app.use('/sitemap.xml', sitemapRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SupremeIt API is running' });
});

import fs from 'fs';
import Product from './models/Product.js';

// Serve frontend in production
const clientDist = join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));

app.get('*', async (req, res) => {
  const indexPath = join(clientDist, 'index.html');
  // Check if index.html exists (it won't during dev, but will in prod)
  if (!fs.existsSync(indexPath)) {
    return res.status(404).send('Frontend not built yet');
  }
  
  let html = fs.readFileSync(indexPath, 'utf-8');

  // Dynamic SEO Injection for Product Pages
  if (req.path.startsWith('/product/')) {
    const productId = req.path.split('/')[2];
    if (productId) {
      try {
        const product = await Product.findOne({ id: productId }).lean();
        if (product) {
          const title = `${product.name} | SupremeIt`;
          const description = product.description ? product.description.replace(/"/g, '&quot;') : `Buy ${product.name} at SupremeIt. High quality fashion.`;
          const image = product.images?.[0] || 'https://supremeit.pixelkite.in/favicon.png';
          
          html = html.replace('<title>SupremeIt | Casual Fashion Store</title>', `<title>${title}</title>`);
          html = html.replace(
            '<meta name="description" content="SupremeIt - Your destination for casual fashion. Shop curated collections from Nike, Adidas, Zara, Levi\'s and more." />',
            `<meta name="description" content="${description}" />\n    <meta property="og:title" content="${title}" />\n    <meta property="og:description" content="${description}" />\n    <meta property="og:image" content="${image}" />\n    <meta name="twitter:card" content="summary_large_image" />`
          );
        }
      } catch (err) {
        console.error('Error fetching product for SEO:', err);
      }
    }
  }

  res.send(html);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SupremeIt API running on port ${PORT}`);
});
