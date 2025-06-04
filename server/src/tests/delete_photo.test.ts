
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { photosTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { deletePhoto } from '../handlers/delete_photo';

describe('deletePhoto', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing photo', async () => {
    // Create a test photo first
    const insertResult = await db.insert(photosTable)
      .values({
        title: 'Test Photo',
        filename: 'test.jpg',
        url: 'https://example.com/test.jpg',
        thumbnail_url: 'https://example.com/thumb.jpg',
        alt_text: 'Test photo'
      })
      .returning()
      .execute();

    const photoId = insertResult[0].id;

    // Delete the photo
    const result = await deletePhoto(photoId);

    expect(result.success).toBe(true);

    // Verify photo was deleted from database
    const photos = await db.select()
      .from(photosTable)
      .where(eq(photosTable.id, photoId))
      .execute();

    expect(photos).toHaveLength(0);
  });

  it('should return false when trying to delete non-existent photo', async () => {
    const result = await deletePhoto(999);

    expect(result.success).toBe(false);
  });

  it('should not affect other photos when deleting one', async () => {
    // Create two test photos
    const insertResult = await db.insert(photosTable)
      .values([
        {
          title: 'Photo 1',
          filename: 'photo1.jpg',
          url: 'https://example.com/photo1.jpg',
          thumbnail_url: 'https://example.com/thumb1.jpg',
        },
        {
          title: 'Photo 2',
          filename: 'photo2.jpg',
          url: 'https://example.com/photo2.jpg',
          thumbnail_url: 'https://example.com/thumb2.jpg',
        }
      ])
      .returning()
      .execute();

    const photo1Id = insertResult[0].id;
    const photo2Id = insertResult[1].id;

    // Delete first photo
    const result = await deletePhoto(photo1Id);

    expect(result.success).toBe(true);

    // Verify first photo was deleted
    const deletedPhotos = await db.select()
      .from(photosTable)
      .where(eq(photosTable.id, photo1Id))
      .execute();

    expect(deletedPhotos).toHaveLength(0);

    // Verify second photo still exists
    const remainingPhotos = await db.select()
      .from(photosTable)
      .where(eq(photosTable.id, photo2Id))
      .execute();

    expect(remainingPhotos).toHaveLength(1);
    expect(remainingPhotos[0].title).toEqual('Photo 2');
  });
});
