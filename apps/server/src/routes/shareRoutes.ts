import { Router } from 'express';
import {
  shareItem,
  removeShare,
  togglePublicLink,
  getSharedWithMe,
  getPublicItem
} from '../controllers/shareController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Public route (no auth needed)
router.get('/public/:token', getPublicItem);

// Protected routes
router.use(requireAuth);
router.get('/shared-with-me', getSharedWithMe);
router.post('/file/:id/public-link', togglePublicLink);
router.post('/:type/:id', shareItem);
router.post('/:type/:id/remove', removeShare);

export default router;
