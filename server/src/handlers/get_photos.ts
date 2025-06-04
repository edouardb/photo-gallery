
import { db } from '../db';
import { photosTable } from '../db/schema';
import { type GetPhotosInput, type Photo } from '../schema';
import { desc } from 'drizzle-orm';

export const getPhotos = async (input: GetPhotosInput = { limit: 20, offset: 0 }): Promise<Photo[]> => {
  try {
    // Build query with pagination and ordering
    const query = db.select()
      .from(photosTable)
      .orderBy(desc(photosTable.uploaded_at))
      .limit(input.limit)
      .offset(input.offset);

    const results = await query.execute();

    return results;
  } catch (error) {
    console.error('Get photos failed:', error);
    throw error;
  }
};
