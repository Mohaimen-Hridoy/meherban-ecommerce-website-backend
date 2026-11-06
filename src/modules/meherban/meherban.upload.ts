import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { config } from '../../config/index.js';

// Configure Cloudinary if credentials are provided
const hasCloudinary = Boolean(
  config.cloudinary.cloudName &&
  config.cloudinary.apiKey &&
  config.cloudinary.apiSecret
);

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true,
  });
}

// Multer memory storage (allows seamless upload to either Cloudinary or Local Disk)
const storage = multer.memoryStorage();

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB maximum limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'));
    }
  },
});

/**
 * Service to upload an image buffer either to Cloudinary (if configured)
 * or to local static directory (if Cloudinary is not yet configured).
 */
export async function uploadImageFile(file: Express.Multer.File): Promise<{
  url: string;
  provider: 'cloudinary' | 'local';
  publicId?: string;
}> {
  // If Cloudinary credentials are provided, upload directly to Cloudinary
  if (hasCloudinary) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'meherban_products',
          resource_type: 'image',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        },
        (error, result) => {
          if (error || !result) {
            return reject(error || new Error('Cloudinary upload returned empty result'));
          }
          resolve({
            url: result.secure_url,
            provider: 'cloudinary',
            publicId: result.public_id,
          });
        }
      );

      uploadStream.end(file.buffer);
    });
  }

  // Fallback: Save to local 'uploads' directory
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const fileExt = path.extname(file.originalname) || '.jpg';
  const fileName = `product-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${fileExt}`;
  const filePath = path.join(uploadsDir, fileName);

  await fs.promises.writeFile(filePath, file.buffer);

  const localUrl = `${config.appUrl}/uploads/${fileName}`;
  return {
    url: localUrl,
    provider: 'local',
  };
}
