import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ShareService } from '../services/shareService';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess } from '../utils/responseHelper';

export const shareItem = async (req: AuthRequest, res: Response): Promise<void> => {
  const { type, id } = req.params as { type: 'file' | 'folder'; id: string };
  const { email, role } = req.body;
  const sharedWith = await ShareService.shareItem(req.user!.id, type, id, email, role);
  sendSuccess(res, StatusCodes.OK, `${email} ga muvaffaqiyatli dostup berildi`, { sharedWith });
};

export const removeShare = async (req: AuthRequest, res: Response): Promise<void> => {
  const { type, id } = req.params as { type: 'file' | 'folder'; id: string };
  const { email } = req.body;
  const sharedWith = await ShareService.removeShare(req.user!.id, type, id, email);
  sendSuccess(res, StatusCodes.OK, `${email} uchun dostup bekor qilindi`, { sharedWith });
};

export const togglePublicLink = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const result = await ShareService.togglePublicLink(req.user!.id, id);
  sendSuccess(
    res,
    StatusCodes.OK,
    result.isPublic ? 'Ommaviy havola yoqildi' : 'Ommaviy havola o\'chirildi',
    result
  );
};

export const getSharedWithMe = async (req: AuthRequest, res: Response): Promise<void> => {
  const result = await ShareService.getSharedWithMe(req.user!.email);
  sendSuccess(res, StatusCodes.OK, 'Sizga ulashilgan elementlar', result);
};

export const getPublicItem = async (req: AuthRequest, res: Response): Promise<void> => {
  const { token } = req.params;
  const file = await ShareService.getPublicItem(token);
  sendSuccess(res, StatusCodes.OK, 'Ommaviy fayl ma\'lumoti', { file });
};
