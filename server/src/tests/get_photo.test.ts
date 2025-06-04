
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { photosTable } from '../db/schema';
import { getPhoto } from '../handlers/get_photo';

describe('getPhoto', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return a photo by id', async () => {
    // Create test photo
    const photoData = {
      title: 'Test Photo',
      filename: 'test.jpg',
      url: 'https://example.com/test.jpg',
      thumbnail_url: 'https://example.com/thumb/test.jpg',
      alt_text: 'A test photo'
    };

    const insertResult = await db.insert(photosTable)
      .values(photoData)
      .returning()
      .execute();

    const createdPhoto = insertResult[0];

    // Get photo by id
    const result = await getPhoto(createdPhoto.id);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdPhoto.id);
    expect(result!.title).toEqual('Test Photo');
    expect(result!.filename).toEqual('test.jpg');
    expect(result!.url).toEqual('https://example.com/test.jpg');
    expect(result!.thumbnail_url).toEqual('https://example.com/thumb/test.jpg');
    expect(result!.alt_text).toEqual('A test photo');
    expect(result!.uploaded_at).toBeInstanceOf(Date);
  });

  it('should return null for non-existent photo', async () => {
    const result = await getPhoto(999);

    expect(result).toBeNull();
  });

  it('should handle photo with null alt_text', async () => {
    // Create test photo without alt_text
    const photoData = {
      title: 'Photo without alt text',
      filename: 'no-alt.jpg',
      url: 'https://example.com/no-alt.jpg',
      thumbnail_url: 'https://example.com/thumb/no-alt.jpg',
      alt_text: null
    };

    const insertResult = await db.insert(photosTable)
      .values(photoData)
      .returning()
      .execute();

    const createdPhoto = insertResult[0];

    // Get photo by id
    const result = await getPhoto(createdPhoto.id);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdPhoto.id);
    expect(result!.title).toEqual('Photo without alt text');
    expect(result!.alt_text).toBeNull();
    expect(result!.uploaded_at).toBeInstanceOf(Date);
  });
});
