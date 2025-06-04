
import { z } from 'zod';

// Photo schema
export const photoSchema = z.object({
  id: z.number(),
  title: z.string(),
  filename: z.string(),
  url: z.string(),
  thumbnail_url: z.string(),
  alt_text: z.string().nullable(),
  uploaded_at: z.coerce.date()
});

export type Photo = z.infer<typeof photoSchema>;

// Input schema for creating photos
export const createPhotoInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  filename: z.string().min(1, "Filename is required"),
  url: z.string().url("Must be a valid URL"),
  thumbnail_url: z.string().url("Must be a valid URL"),
  alt_text: z.string().nullable().optional()
});

export type CreatePhotoInput = z.infer<typeof createPhotoInputSchema>;

// Input schema for updating photos
export const updatePhotoInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1).optional(),
  filename: z.string().min(1).optional(),
  url: z.string().url().optional(),
  thumbnail_url: z.string().url().optional(),
  alt_text: z.string().nullable().optional()
});

export type UpdatePhotoInput = z.infer<typeof updatePhotoInputSchema>;

// Query schema for getting photos with pagination
export const getPhotosInputSchema = z.object({
  limit: z.number().int().positive().max(100).optional().default(20),
  offset: z.number().int().nonnegative().optional().default(0)
});

export type GetPhotosInput = z.infer<typeof getPhotosInputSchema>;
