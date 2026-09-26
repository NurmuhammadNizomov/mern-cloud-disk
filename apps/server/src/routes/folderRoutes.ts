import { Router } from 'express';
import {
  createFolder,
  getFolders,
  getFolderPath,
  renameFolder,
  toggleStarFolder,
  trashFolder,
  restoreFolder,
  deleteFolderPermanently
} from '../controllers/folderController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.post('/', createFolder);
router.get('/', getFolders);
router.get('/:id/path', getFolderPath);
router.patch('/:id/rename', renameFolder);
router.patch('/:id/star', toggleStarFolder);
router.patch('/:id/trash', trashFolder);
router.patch('/:id/restore', restoreFolder);
router.delete('/:id', deleteFolderPermanently);

export default router;
