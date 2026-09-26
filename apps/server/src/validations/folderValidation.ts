import { z } from 'zod';

export const createFolderSchema = z.object({
  name: z.string().min(1, 'Folder name is required').max(100, 'Folder name cannot exceed 100 characters'),
  parentFolder: z.string().nullable().optional(),
  color: z.string().optional()
});

export const renameFolderSchema = z.object({
  name: z.string().min(1, 'New folder name is required').max(100, 'Folder name cannot exceed 100 characters')
});

export const moveFolderSchema = z.object({
  targetFolderId: z.string().nullable().optional()
});
