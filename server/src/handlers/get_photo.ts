
import { db } from '../db';
import { photosTable } from '../db/schema';
import { type Photo } from '../schema';
import { eq } from 'drizzle-orm';

export const getPhoto = async (id: number): Promise<Photo | null> => {
  try {
    const result = await db.select()
      .from(photosTable)
      .where(eq(photosTable.id, id))
      .execute();

    if (result.length === 0) {
      return null;
    }

    return result[0];
  } catch (error) {
    console.error('Get photo failed:', error);
    throw error;
  }
};
