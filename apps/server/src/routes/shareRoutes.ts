import { Router } from 'express';
import {
  shareItem,
  removeShare,
  togglePublicLink,
  getSharedWithMe,
  getPublicItem
} from '../controllers/shareController';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { shareItemSchema, removeShareSchema } from '../validations/shareValidation';

const router = Router();

// Public route (no auth needed)
router.get('/public/:token', getPublicItem);

// Protected routes
router.use(requireAuth);
router.get('/shared-with-me', getSharedWithMe);
router.post('/file/:id/public-link', togglePublicLink);
router.post('/:type/:id', validateBody(shareItemSchema), shareItem);
router.post('/:type/:id/remove', validateBody(removeShareSchema), removeShare);

export default router;
