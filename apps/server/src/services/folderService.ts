import mongoose from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import { Folder, IFolder } from '../models/Folder';
import { AppError } from '../middleware/errorHandler';

export class FolderService {
  static async create(userId: string, name: string, parentFolder?: string | null, color?: string) {
    if (!name || !name.trim()) {
      throw new AppError('Papka nomi kiritilishi shart', StatusCodes.BAD_REQUEST);
    }

    const folder = await Folder.create({
      name: name.trim(),
      parentFolder: parentFolder && mongoose.Types.ObjectId.isValid(parentFolder) ? parentFolder : null,
      owner: userId,
      color: color || '#4285F4'
    });

    return folder;
  }

  static async getFolders(userId: string, options: {
    parentFolder?: string | null;
    isStarred?: boolean;
    isTrash?: boolean;
    search?: string;
  }) {
    const query: any = { owner: userId };

    if (options.isTrash) {
      query.isTrash = true;
    } else {
      query.isTrash = false;
      if (options.isStarred) {
        query.isStarred = true;
      } else {
        if (options.parentFolder && options.parentFolder !== 'null' && options.parentFolder !== 'root') {
          query.parentFolder = options.parentFolder;
        } else {
          query.parentFolder = null;
        }
      }
    }

    if (options.search && options.search.trim()) {
      query.name = { $regex: options.search.trim(), $options: 'i' };
    }

    return await Folder.find(query).sort({ name: 1 });
  }

  static async getFolderPath(folderId: string) {
    if (!folderId || folderId === 'root' || !mongoose.Types.ObjectId.isValid(folderId)) {
      return [];
    }

    const path: Array<{ _id: string; name: string }> = [];
    let currentId: any = folderId;

    while (currentId) {
      const folder: any = await Folder.findById(currentId).select('name parentFolder');
      if (!folder) break;
      path.unshift({ _id: folder._id.toString(), name: folder.name });
      currentId = folder.parentFolder;
    }

    return path;
  }

  static async rename(userId: string, folderId: string, name: string) {
    if (!name || !name.trim()) {
      throw new AppError('Yangi nom kiritilishi shart', StatusCodes.BAD_REQUEST);
    }

    const folder = await Folder.findOneAndUpdate(
      { _id: folderId, owner: userId },
      { name: name.trim() },
      { new: true }
    );

    if (!folder) {
      throw new AppError('Papka topilmadi', StatusCodes.NOT_FOUND);
    }

    return folder;
  }

  static async toggleStar(userId: string, folderId: string) {
    const folder = await Folder.findOne({ _id: folderId, owner: userId });
    if (!folder) {
      throw new AppError('Papka topilmadi', StatusCodes.NOT_FOUND);
    }

    folder.isStarred = !folder.isStarred;
    await folder.save();
    return folder;
  }

  static async trash(userId: string, folderId: string) {
    const folder = await Folder.findOneAndUpdate(
      { _id: folderId, owner: userId },
      { isTrash: true, deletedAt: new Date() },
      { new: true }
    );

    if (!folder) {
      throw new AppError('Papka topilmadi', StatusCodes.NOT_FOUND);
    }

    return folder;
  }

  static async restore(userId: string, folderId: string) {
    const folder = await Folder.findOneAndUpdate(
      { _id: folderId, owner: userId },
      { isTrash: false, deletedAt: null },
      { new: true }
    );

    if (!folder) {
      throw new AppError('Papka topilmadi', StatusCodes.NOT_FOUND);
    }

    return folder;
  }

  static async deletePermanently(userId: string, folderId: string) {
    const folder = await Folder.findOneAndDelete({ _id: folderId, owner: userId });
    if (!folder) {
      throw new AppError('Papka topilmadi', StatusCodes.NOT_FOUND);
    }
    return true;
  }
}
