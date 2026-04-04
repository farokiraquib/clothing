// The actual cloudinary and multer config has been moved to config/cloudinary.js
// We export the configured upload middleware from here to avoid breaking existing imports.
import { upload } from '../config/cloudinary.js';

export { upload };
