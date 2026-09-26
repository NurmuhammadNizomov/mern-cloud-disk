import { Router } from 'express';
import {
  uploadFiles,
  getFiles,
  renameFile,
  toggleStarFile,
  trashFile,
  restoreFile,
  deleteFilePermanently
} from '../controllers/fileController';
import { requireAuth } from '../middleware/auth';
import { uploadMulter } from '../middleware/upload';

const router = Router();

router.use(requireAuth);

router.post('/upload', uploadMulter.array('files', 20), uploadFiles);
router.get('/', getFiles);
router.patch('/:id/rename', renameFile);
router.patch('/:id/star', toggleStarFile);
router.patch('/:id/trash', trashFile);
router.patch('/:id/restore', restoreFile);
router.delete('/:id', deleteFilePermanently);

export default router;
