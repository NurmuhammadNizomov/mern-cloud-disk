import { z } from 'zod';

export const shareItemSchema = z.object({
  email: z.string().email('Please enter a valid email address to share with'),
  role: z.enum(['viewer', 'editor']).default('viewer')
});

export const removeShareSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});
