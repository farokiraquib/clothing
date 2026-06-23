import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

const router = express.Router();

// Use memory storage so we can upload to Cloudinary manually
const memStorage = multer.memoryStorage();
const uploadMem = multer({
  storage: memStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPG, PNG, WebP and GIF images are allowed'));
  }
});

// POST /api/custom-upload — customer uploads their custom design
router.post('/', uploadMem.single('design'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload buffer to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'supremeit/custom-designs',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif']
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    res.json({
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (err) {
    console.error('Custom design upload error:', err);
    res.status(500).json({ error: 'Failed to upload design' });
  }
});

export default router;
