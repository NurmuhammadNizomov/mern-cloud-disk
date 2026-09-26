import crypto from 'crypto';
import { StatusCodes } from 'http-status-codes';
import { File } from '../models/File';
import { Folder } from '../models/Folder';
import { User } from '../models/User';
import { AppError } from '../middleware/errorHandler';

export class ShareService {
  static async shareItem(userId: string, type: 'file' | 'folder', id: string, email: string, role: 'viewer' | 'editor' = 'viewer') {
    const cleanEmail = email.toLowerCase().trim();
    const item: any = type === 'folder'
      ? await Folder.findOne({ _id: id, owner: userId })
      : await File.findOne({ _id: id, owner: userId });

    if (!item) {
      throw new AppError(`${type === 'folder' ? 'Papka' : 'Fayl'} topilmadi`, StatusCodes.NOT_FOUND);
    }

    const targetUser = await User.findOne({ email: cleanEmail });

    const existingIndex = item.sharedWith.findIndex((s: any) => s.email === cleanEmail);
    if (existingIndex >= 0) {
      item.sharedWith[existingIndex].role = role;
      if (targetUser) item.sharedWith[existingIndex].user = targetUser._id;
    } else {
      item.sharedWith.push({
        user: targetUser ? targetUser._id : undefined,
        email: cleanEmail,
        role
      });
    }

    await item.save();
    return item.sharedWith;
  }

  static async removeShare(userId: string, type: 'file' | 'folder', id: string, email: string) {
    const cleanEmail = email.toLowerCase().trim();
    const item: any = type === 'folder'
      ? await Folder.findOne({ _id: id, owner: userId })
      : await File.findOne({ _id: id, owner: userId });

    if (!item) {
      throw new AppError('Element topilmadi', StatusCodes.NOT_FOUND);
    }

    item.sharedWith = item.sharedWith.filter((s: any) => s.email !== cleanEmail);
    await item.save();
    return item.sharedWith;
  }

  static async togglePublicLink(userId: string, fileId: string) {
    const file = await File.findOne({ _id: fileId, owner: userId });
    if (!file) {
      throw new AppError('Fayl topilmadi', StatusCodes.NOT_FOUND);
    }

    file.isPublic = !file.isPublic;
    if (file.isPublic && !file.shareToken) {
      file.shareToken = crypto.randomBytes(16).toString('hex');
    }

    await file.save();
    return {
      isPublic: file.isPublic,
      shareToken: file.shareToken
    };
  }

  static async getSharedWithMe(userEmail: string) {
    const cleanEmail = userEmail.toLowerCase().trim();

    const folders = await Folder.find({
      'sharedWith.email': cleanEmail,
      isTrash: false
    }).populate('owner', 'name email avatar');

    const files = await File.find({
      'sharedWith.email': cleanEmail,
      isTrash: false
    }).populate('owner', 'name email avatar');

    return { folders, files };
  }

  static async getPublicItem(token: string) {
    const file = await File.findOne({ shareToken: token, isPublic: true }).populate('owner', 'name email');
    if (!file) {
      throw new AppError('Havola yaroqsiz yoki ommaviy dostup yopilgan', StatusCodes.NOT_FOUND);
    }
    return file;
  }
}
