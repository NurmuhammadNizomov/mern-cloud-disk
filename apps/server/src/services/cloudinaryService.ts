import { Readable } from 'stream';
import cloudinary from '../config/cloudinary';
import { sanitizeFileName } from '../utils/fileHelper';

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  bytes: number;
  format?: string;
  resource_type: string;
}

export class CloudinaryService {
  static getBaseFolder(): string {
    const folder = process.env.CLOUDINARY_FOLDER?.trim();
    return folder ? folder.replace(/^\/+|\/+$/g, '') : 'mern-cloud-disk';
  }

  static uploadBuffer(
    buffer: Buffer,
    folderName?: string,
    fileName: string = 'file'
  ): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      const safeName = sanitizeFileName(fileName);
      const baseFolder = CloudinaryService.getBaseFolder();
      
      let targetFolder = baseFolder;
      if (folderName && folderName.trim()) {
        const cleanSubFolder = folderName.trim().replace(/^\/+|\/+$/g, '');
        // If folderName already includes baseFolder, don't duplicate
        targetFolder = cleanSubFolder.startsWith(baseFolder) 
          ? cleanSubFolder 
          : `${baseFolder}/${cleanSubFolder}`;
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: targetFolder,
          resource_type: 'auto',
          public_id: `${Date.now()}-${safeName}`
        },
        (error, result) => {
          if (error || !result) {
            return reject(error || new Error('Cloudinary upload failed'));
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
  }

  static async deleteResource(publicId: string, resourceType: string = 'auto'): Promise<any> {
    try {
      return await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType as any
      });
    } catch (error) {
      console.warn('[Cloudinary Delete Warning]:', error);
      return null;
    }
  }
}
