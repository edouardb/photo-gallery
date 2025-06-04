
import { db } from '../db';
import { photosTable } from '../db/schema';
import { type CreatePhotoInput, type Photo } from '../schema';

export const createPhoto = async (input: CreatePhotoInput): Promise<Photo> => {
  try {
    // Insert photo record
    const result = await db.insert(photosTable)
      .values({
        title: input.title,
        filename: input.filename,
        url: input.url,
        thumbnail_url: input.thumbnail_url,
        alt_text: input.alt_text ?? null // Handle optional field
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Photo creation failed:', error);
    throw error;
  }
};
