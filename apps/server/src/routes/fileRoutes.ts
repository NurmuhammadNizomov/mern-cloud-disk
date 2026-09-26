import { Router } from 'express';
import {
  uploadFiles,
  getFiles,
  renameFile,
  toggleStarFile,
  trashFile,
  restoreFile,
  deleteFilePermanently,
  moveFile
} from '../controllers/fileController';
import { requireAuth } from '../middleware/auth';
import { uploadMulter } from '../middleware/upload';
import { validateBody } from '../middleware/validate';
import { renameFileSchema, moveFileSchema } from '../validations/fileValidation';

const router = Router();

router.use(requireAuth);

router.post('/upload', uploadMulter.array('files', 20), uploadFiles);
router.get('/', getFiles);
router.patch('/:id/rename', validateBody(renameFileSchema), renameFile);
router.patch('/:id/move', validateBody(moveFileSchema), moveFile);
router.patch('/:id/star', toggleStarFile);
router.patch('/:id/trash', trashFile);
router.patch('/:id/restore', restoreFile);
router.delete('/:id', deleteFilePermanently);

export default router;
