import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const products = await Product.find({}, 'id updatedAt').lean();
    const baseUrl = 'https://supremeit.pixelkite.in';
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Add static pages
    const staticPages = ['/', '/shop', '/custom-design', '/cart', '/wishlist'];
    for (const page of staticPages) {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}${page}</loc>\n`;
      xml += '    <changefreq>daily</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    }
    
    // Add product pages
    for (const product of products) {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/product/${product.id}</loc>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.6</priority>\n';
      if (product.updatedAt) {
        xml += `    <lastmod>${new Date(product.updatedAt).toISOString()}</lastmod>\n`;
      }
      xml += '  </url>\n';
    }
    
    xml += '</urlset>';
    
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

export default router;
