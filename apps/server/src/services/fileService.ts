import path from 'path';
import mongoose from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import { File, IFile } from '../models/File';
import { Folder } from '../models/Folder';
import { User } from '../models/User';
import { CloudinaryService } from './cloudinaryService';
import { getCategoryFromMimeAndExt } from '../utils/fileHelper';
import { AppError } from '../middleware/errorHandler';

export class FileService {
  static async uploadFiles(userId: string, rawFiles: Express.Multer.File[], folderId?: string | null) {
    if (!rawFiles || rawFiles.length === 0) {
      throw new AppError('No files selected for upload', StatusCodes.BAD_REQUEST);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND);
    }

    // STRICT ISOLATION: verify parent folder ownership or editor permission
    let parentFolderId: mongoose.Types.ObjectId | null = null;
    if (folderId && folderId !== 'null' && folderId !== 'root' && mongoose.Types.ObjectId.isValid(folderId)) {
      const folder = await Folder.findOne({
        _id: folderId,
        $or: [
          { owner: userId },
          { sharedWith: { $elemMatch: { email: user.email.toLowerCase().trim(), role: 'editor' } } }
        ],
        isTrash: false
      });
      if (!folder) {
        throw new AppError('Folder not found or upload access denied', StatusCodes.FORBIDDEN);
      }
      parentFolderId = folder._id as mongoose.Types.ObjectId;
    }

    // Storage capacity check
    const totalBytes = rawFiles.reduce((acc, f) => acc + f.size, 0);
    if (user.storageUsed + totalBytes > user.storageLimit) {
      throw new AppError('Storage quota exceeded! Not enough cloud storage (Max: 15 GB)', StatusCodes.BAD_REQUEST);
    }

    const uploadedFiles: IFile[] = [];

    for (const file of rawFiles) {
      const ext = path.extname(file.originalname).replace('.', '').toLowerCase();
      const category = getCategoryFromMimeAndExt(file.mimetype, ext);

      // STRICT ISOLATION: User-specific Cloudinary namespace
      const cld = await CloudinaryService.uploadBuffer(
        file.buffer,
        `mern-cloud-disk/${userId}`,
        file.originalname
      );

      const record = await File.create({
        name: file.originalname,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        extension: ext,
        category,
        cloudinaryUrl: cld.secure_url,
        cloudinaryPublicId: cld.public_id,
        folder: parentFolderId,
        owner: userId,
        isStarred: false,
        isTrash: false,
        isPublic: false
      });

      uploadedFiles.push(record);
    }

    // Increment user's used storage
    user.storageUsed += totalBytes;
    await user.save();

    return {
      files: uploadedFiles,
      storageUsed: user.storageUsed,
      storageLimit: user.storageLimit
    };
  }

  static async getFiles(userId: string, options: {
    folder?: string | null;
    category?: string;
    search?: string;
    isStarred?: boolean;
    isTrash?: boolean;
    sortBy?: string;
    sortOrder?: string;
  }) {
    // STRICT ISOLATION: ALWAYS match owner: userId
    const query: any = { owner: userId };

    if (options.isTrash) {
      query.isTrash = true;
    } else {
      query.isTrash = false;
      if (options.isStarred) {
        query.isStarred = true;
      } else {
        if (options.folder && options.folder !== 'null' && options.folder !== 'root') {
          query.folder = options.folder;
        } else if (!options.category || options.category === 'all') {
          if (!options.search) {
            query.folder = null;
          }
        }
      }
    }

    if (options.category && options.category !== 'all') {
      query.category = options.category;
    }

    if (options.search && options.search.trim()) {
      query.name = { $regex: options.search.trim(), $options: 'i' };
    }

    const sort: any = {};
    const order = options.sortOrder === 'asc' ? 1 : -1;

    if (options.sortBy === 'name') {
      sort.name = order;
    } else if (options.sortBy === 'size') {
      sort.size = order;
    } else {
      sort.createdAt = order;
    }

    return await File.find(query).sort(sort);
  }

  static async rename(userId: string, fileId: string, name: string) {
    if (!name || !name.trim()) {
      throw new AppError('New name is required', StatusCodes.BAD_REQUEST);
    }

    // STRICT ISOLATION: owner: userId
    const file = await File.findOneAndUpdate(
      { _id: fileId, owner: userId },
      { name: name.trim() },
      { new: true }
    );

    if (!file) {
      throw new AppError('File not found or access denied', StatusCodes.NOT_FOUND);
    }

    return file;
  }

  static async toggleStar(userId: string, fileId: string) {
    const file = await File.findOne({ _id: fileId, owner: userId });
    if (!file) {
      throw new AppError('File not found', StatusCodes.NOT_FOUND);
    }

    file.isStarred = !file.isStarred;
    await file.save();
    return file;
  }

  static async trash(userId: string, fileId: string) {
    const file = await File.findOneAndUpdate(
      { _id: fileId, owner: userId },
      { isTrash: true, deletedAt: new Date() },
      { new: true }
    );

    if (!file) {
      throw new AppError('File not found', StatusCodes.NOT_FOUND);
    }

    return file;
  }

  static async restore(userId: string, fileId: string) {
    const file = await File.findOneAndUpdate(
      { _id: fileId, owner: userId },
      { isTrash: false, deletedAt: null },
      { new: true }
    );

    if (!file) {
      throw new AppError('File not found', StatusCodes.NOT_FOUND);
    }

    return file;
  }

  static async deletePermanently(userId: string, fileId: string) {
    // STRICT ISOLATION: owner: userId
    const file = await File.findOne({ _id: fileId, owner: userId });
    if (!file) {
      throw new AppError('File not found', StatusCodes.NOT_FOUND);
    }

    // Delete asset from Cloudinary
    if (file.cloudinaryPublicId) {
      const resourceType = file.category === 'video' ? 'video' : file.category === 'image' ? 'image' : 'raw';
      await CloudinaryService.deleteResource(file.cloudinaryPublicId, resourceType);
    }

    // Decrement user storage
    await User.findByIdAndUpdate(userId, {
      $inc: { storageUsed: -file.size }
    });

    await File.findByIdAndDelete(fileId);
    return true;
  }
}
