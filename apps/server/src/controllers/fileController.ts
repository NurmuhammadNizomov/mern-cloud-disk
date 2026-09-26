import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { FileService } from '../services/fileService';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess } from '../utils/responseHelper';

export const uploadFiles = async (req: AuthRequest, res: Response): Promise<void> => {
  const rawFiles: Express.Multer.File[] = (req.files as Express.Multer.File[]) || (req.file ? [req.file] : []);
  const { folderId } = req.body;
  const result = await FileService.uploadFiles(req.user!.id, rawFiles, folderId);
  sendSuccess(res, StatusCodes.CREATED, `${result.files.length} ta fayl muvaffaqiyatli yuklandi`, result);
};

export const getFiles = async (req: AuthRequest, res: Response): Promise<void> => {
  const { folder, category, search, isStarred, isTrash, sortBy, sortOrder } = req.query;
  const files = await FileService.getFiles(req.user!.id, {
    folder: folder as string,
    category: category as string,
    search: search as string,
    isStarred: isStarred === 'true',
    isTrash: isTrash === 'true',
    sortBy: sortBy as string,
    sortOrder: sortOrder as string
  });
  sendSuccess(res, StatusCodes.OK, 'Fayllar ro\'yxati', { files });
};

export const renameFile = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name } = req.body;
  const file = await FileService.rename(req.user!.id, id, name);
  sendSuccess(res, StatusCodes.OK, 'Fayl nomi o\'zgartirildi', { file });
};

export const toggleStarFile = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const file = await FileService.toggleStar(req.user!.id, id);
  sendSuccess(
    res,
    StatusCodes.OK,
    file.isStarred ? 'Tanlanganlarga qo\'shildi' : 'Tanlanganlardan olib tashlandi',
    { file }
  );
};

export const trashFile = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const file = await FileService.trash(req.user!.id, id);
  sendSuccess(res, StatusCodes.OK, 'Fayl chiqindilar qutisiga o\'tkazildi', { file });
};

export const restoreFile = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const file = await FileService.restore(req.user!.id, id);
  sendSuccess(res, StatusCodes.OK, 'Fayl qayta tiklandi', { file });
};

export const deleteFilePermanently = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  await FileService.deletePermanently(req.user!.id, id);
  sendSuccess(res, StatusCodes.OK, 'Fayl butunlay o\'chirildi');
};
