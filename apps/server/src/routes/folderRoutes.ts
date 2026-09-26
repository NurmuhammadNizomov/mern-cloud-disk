import { Router } from 'express';
import {
  createFolder,
  getFolders,
  getFolderPath,
  renameFolder,
  toggleStarFolder,
  trashFolder,
  restoreFolder,
  deleteFolderPermanently,
  moveFolder
} from '../controllers/folderController';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { createFolderSchema, renameFolderSchema, moveFolderSchema } from '../validations/folderValidation';

const router = Router();

router.use(requireAuth);

router.post('/', validateBody(createFolderSchema), createFolder);
router.get('/', getFolders);
router.get('/:id/path', getFolderPath);
router.patch('/:id/rename', validateBody(renameFolderSchema), renameFolder);
router.patch('/:id/move', validateBody(moveFolderSchema), moveFolder);
router.patch('/:id/star', toggleStarFolder);
router.patch('/:id/trash', trashFolder);
router.patch('/:id/restore', restoreFolder);
router.delete('/:id', deleteFolderPermanently);

export default router;
