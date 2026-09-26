import multer from 'multer';
import { Readable } from 'stream';
import cloudinary from '../config/cloudinary';

const storage = multer.memoryStorage();

export const uploadMulter = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100 MB max per file
  }
});

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  bytes: number;
  format?: string;
  resource_type: string;
}

export const uploadBufferToCloudinary = (
  buffer: Buffer,
  folderName?: string,
  fileName: string = 'file'
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const baseFolder = process.env.CLOUDINARY_FOLDER?.trim().replace(/^\/+|\/+$/g, '') || 'mern-cloud-disk';
    let targetFolder = baseFolder;
    if (folderName && folderName.trim()) {
      const cleanSub = folderName.trim().replace(/^\/+|\/+$/g, '');
      targetFolder = cleanSub.startsWith(baseFolder) ? cleanSub : `${baseFolder}/${cleanSub}`;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: targetFolder,
        resource_type: 'auto',
        public_id: `${Date.now()}-${fileName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '_')}`
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Cloudinary upload returned empty result'));
        }
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
          bytes: result.bytes,
          format: result.format,
          resource_type: result.resource_type
        });
      }
    );

    const readable = Readable.from(buffer);
    readable.pipe(uploadStream);
  });
};
