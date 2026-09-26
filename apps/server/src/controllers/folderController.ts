import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { FolderService } from '../services/folderService';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess } from '../utils/responseHelper';

export const createFolder = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, parentFolder, color } = req.body;
  const folder = await FolderService.create(req.user!.id, name, parentFolder, color);
  sendSuccess(res, StatusCodes.CREATED, 'Folder created successfully', { folder });
};

export const getFolders = async (req: AuthRequest, res: Response): Promise<void> => {
  const { parentFolder, isStarred, isTrash, search } = req.query;
  const folders = await FolderService.getFolders(req.user!.id, {
    parentFolder: parentFolder as string,
    isStarred: isStarred === 'true',
    isTrash: isTrash === 'true',
    search: search as string
  });
  sendSuccess(res, StatusCodes.OK, 'Folders retrieved successfully', { folders });
};

export const getFolderPath = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const path = await FolderService.getFolderPath(req.user!.id, req.user!.email, id);
  sendSuccess(res, StatusCodes.OK, 'Folder path retrieved successfully', { path });
};

export const renameFolder = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name } = req.body;
  const folder = await FolderService.rename(req.user!.id, id, name);
  sendSuccess(res, StatusCodes.OK, 'Folder renamed successfully', { folder });
};

export const toggleStarFolder = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const folder = await FolderService.toggleStar(req.user!.id, id);
  sendSuccess(
    res,
    StatusCodes.OK,
    folder.isStarred ? 'Added to starred' : 'Removed from starred',
    { folder }
  );
};

export const trashFolder = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const folder = await FolderService.trash(req.user!.id, id);
  sendSuccess(res, StatusCodes.OK, 'Folder moved to trash', { folder });
};

export const restoreFolder = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const folder = await FolderService.restore(req.user!.id, id);
  sendSuccess(res, StatusCodes.OK, 'Folder restored successfully', { folder });
};

export const deleteFolderPermanently = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  await FolderService.deletePermanently(req.user!.id, id);
  sendSuccess(res, StatusCodes.OK, 'Folder deleted permanently');
};
