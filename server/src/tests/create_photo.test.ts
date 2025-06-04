
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { photosTable } from '../db/schema';
import { type CreatePhotoInput } from '../schema';
import { createPhoto } from '../handlers/create_photo';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreatePhotoInput = {
  title: 'Test Photo',
  filename: 'test-photo.jpg',
  url: 'https://example.com/photos/test-photo.jpg',
  thumbnail_url: 'https://example.com/thumbnails/test-photo.jpg',
  alt_text: 'A beautiful test photo'
};

// Test input without optional alt_text
const testInputNoAlt: CreatePhotoInput = {
  title: 'Photo Without Alt Text',
  filename: 'no-alt-photo.jpg',
  url: 'https://example.com/photos/no-alt-photo.jpg',
  thumbnail_url: 'https://example.com/thumbnails/no-alt-photo.jpg'
};

describe('createPhoto', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a photo with all fields', async () => {
    const result = await createPhoto(testInput);

    // Basic field validation
    expect(result.title).toEqual('Test Photo');
    expect(result.filename).toEqual('test-photo.jpg');
    expect(result.url).toEqual('https://example.com/photos/test-photo.jpg');
    expect(result.thumbnail_url).toEqual('https://example.com/thumbnails/test-photo.jpg');
    expect(result.alt_text).toEqual('A beautiful test photo');
    expect(result.id).toBeDefined();
    expect(result.uploaded_at).toBeInstanceOf(Date);
  });

  it('should create a photo without alt_text', async () => {
    const result = await createPhoto(testInputNoAlt);

    expect(result.title).toEqual('Photo Without Alt Text');
    expect(result.filename).toEqual('no-alt-photo.jpg');
    expect(result.url).toEqual('https://example.com/photos/no-alt-photo.jpg');
    expect(result.thumbnail_url).toEqual('https://example.com/thumbnails/no-alt-photo.jpg');
    expect(result.alt_text).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.uploaded_at).toBeInstanceOf(Date);
  });

  it('should save photo to database', async () => {
    const result = await createPhoto(testInput);

    // Query using proper drizzle syntax
    const photos = await db.select()
      .from(photosTable)
      .where(eq(photosTable.id, result.id))
      .execute();

    expect(photos).toHaveLength(1);
    expect(photos[0].title).toEqual('Test Photo');
    expect(photos[0].filename).toEqual('test-photo.jpg');
    expect(photos[0].url).toEqual('https://example.com/photos/test-photo.jpg');
    expect(photos[0].thumbnail_url).toEqual('https://example.com/thumbnails/test-photo.jpg');
    expect(photos[0].alt_text).toEqual('A beautiful test photo');
    expect(photos[0].uploaded_at).toBeInstanceOf(Date);
  });

  it('should handle null alt_text correctly in database', async () => {
    const result = await createPhoto(testInputNoAlt);

    const photos = await db.select()
      .from(photosTable)
      .where(eq(photosTable.id, result.id))
      .execute();

    expect(photos).toHaveLength(1);
    expect(photos[0].alt_text).toBeNull();
  });
});
