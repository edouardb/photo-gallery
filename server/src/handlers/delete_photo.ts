
import { db } from '../db';
import { photosTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export const deletePhoto = async (id: number): Promise<{ success: boolean }> => {
  try {
    const result = await db.delete(photosTable)
      .where(eq(photosTable.id, id))
      .returning()
      .execute();

    return { success: result.length > 0 };
  } catch (error) {
    console.error('Photo deletion failed:', error);
    throw error;
  }
};
