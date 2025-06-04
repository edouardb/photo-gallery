
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { photosTable } from '../db/schema';
import { type CreatePhotoInput, type UpdatePhotoInput } from '../schema';
import { updatePhoto } from '../handlers/update_photo';
import { eq } from 'drizzle-orm';

// Test photo data
const testPhotoData: CreatePhotoInput = {
  title: 'Original Photo',
  filename: 'original.jpg',
  url: 'https://example.com/original.jpg',
  thumbnail_url: 'https://example.com/thumb_original.jpg',
  alt_text: 'Original alt text'
};

describe('updatePhoto', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update a photo with all fields', async () => {
    // Create a photo first
    const createResult = await db.insert(photosTable)
      .values(testPhotoData)
      .returning()
      .execute();
    
    const photoId = createResult[0].id;

    // Update the photo
    const updateInput: UpdatePhotoInput = {
      id: photoId,
      title: 'Updated Photo',
      filename: 'updated.jpg',
      url: 'https://example.com/updated.jpg',
      thumbnail_url: 'https://example.com/thumb_updated.jpg',
      alt_text: 'Updated alt text'
    };

    const result = await updatePhoto(updateInput);

    // Verify all fields were updated
    expect(result.id).toEqual(photoId);
    expect(result.title).toEqual('Updated Photo');
    expect(result.filename).toEqual('updated.jpg');
    expect(result.url).toEqual('https://example.com/updated.jpg');
    expect(result.thumbnail_url).toEqual('https://example.com/thumb_updated.jpg');
    expect(result.alt_text).toEqual('Updated alt text');
    expect(result.uploaded_at).toBeInstanceOf(Date);
  });

  it('should update only specified fields', async () => {
    // Create a photo first
    const createResult = await db.insert(photosTable)
      .values(testPhotoData)
      .returning()
      .execute();
    
    const photoId = createResult[0].id;

    // Update only title and alt_text
    const updateInput: UpdatePhotoInput = {
      id: photoId,
      title: 'Partially Updated Photo',
      alt_text: 'New alt text'
    };

    const result = await updatePhoto(updateInput);

    // Verify only specified fields were updated
    expect(result.id).toEqual(photoId);
    expect(result.title).toEqual('Partially Updated Photo');
    expect(result.filename).toEqual('original.jpg'); // Should remain unchanged
    expect(result.url).toEqual('https://example.com/original.jpg'); // Should remain unchanged
    expect(result.thumbnail_url).toEqual('https://example.com/thumb_original.jpg'); // Should remain unchanged
    expect(result.alt_text).toEqual('New alt text');
    expect(result.uploaded_at).toBeInstanceOf(Date);
  });

  it('should update alt_text to null', async () => {
    // Create a photo first
    const createResult = await db.insert(photosTable)
      .values(testPhotoData)
      .returning()
      .execute();
    
    const photoId = createResult[0].id;

    // Update alt_text to null
    const updateInput: UpdatePhotoInput = {
      id: photoId,
      alt_text: null
    };

    const result = await updatePhoto(updateInput);

    // Verify alt_text was set to null
    expect(result.id).toEqual(photoId);
    expect(result.alt_text).toBeNull();
    expect(result.title).toEqual('Original Photo'); // Should remain unchanged
  });

  it('should save updates to database', async () => {
    // Create a photo first
    const createResult = await db.insert(photosTable)
      .values(testPhotoData)
      .returning()
      .execute();
    
    const photoId = createResult[0].id;

    // Update the photo
    const updateInput: UpdatePhotoInput = {
      id: photoId,
      title: 'Database Updated Photo',
      url: 'https://example.com/database_updated.jpg'
    };

    await updatePhoto(updateInput);

    // Query database directly to verify changes were persisted
    const photos = await db.select()
      .from(photosTable)
      .where(eq(photosTable.id, photoId))
      .execute();

    expect(photos).toHaveLength(1);
    expect(photos[0].title).toEqual('Database Updated Photo');
    expect(photos[0].url).toEqual('https://example.com/database_updated.jpg');
    expect(photos[0].filename).toEqual('original.jpg'); // Should remain unchanged
  });

  it('should throw error when photo does not exist', async () => {
    const updateInput: UpdatePhotoInput = {
      id: 999, // Non-existent ID
      title: 'Non-existent Photo'
    };

    await expect(updatePhoto(updateInput)).rejects.toThrow(/Photo with id 999 not found/i);
  });
});
