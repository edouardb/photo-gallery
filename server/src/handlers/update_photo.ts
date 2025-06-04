
import { db } from '../db';
import { photosTable } from '../db/schema';
import { type UpdatePhotoInput, type Photo } from '../schema';
import { eq } from 'drizzle-orm';

export const updatePhoto = async (input: UpdatePhotoInput): Promise<Photo> => {
  try {
    // Build update object with only provided fields
    const updateData: Partial<typeof photosTable.$inferInsert> = {};
    
    if (input.title !== undefined) {
      updateData.title = input.title;
    }
    if (input.filename !== undefined) {
      updateData.filename = input.filename;
    }
    if (input.url !== undefined) {
      updateData.url = input.url;
    }
    if (input.thumbnail_url !== undefined) {
      updateData.thumbnail_url = input.thumbnail_url;
    }
    if (input.alt_text !== undefined) {
      updateData.alt_text = input.alt_text;
    }

    // Update photo record
    const result = await db.update(photosTable)
      .set(updateData)
      .where(eq(photosTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Photo with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Photo update failed:', error);
    throw error;
  }
};
