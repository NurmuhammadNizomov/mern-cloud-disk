import { z } from 'zod';

export const renameFileSchema = z.object({
  name: z.string().min(1, 'New file name is required').max(255, 'File name cannot exceed 255 characters')
});
