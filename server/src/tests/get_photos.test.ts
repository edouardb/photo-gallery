
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { photosTable } from '../db/schema';
import { type CreatePhotoInput, type GetPhotosInput } from '../schema';
import { getPhotos } from '../handlers/get_photos';

// Test photo data
const testPhoto1: CreatePhotoInput = {
  title: 'Test Photo 1',
  filename: 'test1.jpg',
  url: 'https://example.com/test1.jpg',
  thumbnail_url: 'https://example.com/thumb1.jpg',
  alt_text: 'First test photo'
};

const testPhoto2: CreatePhotoInput = {
  title: 'Test Photo 2',
  filename: 'test2.jpg',
  url: 'https://example.com/test2.jpg',
  thumbnail_url: 'https://example.com/thumb2.jpg',
  alt_text: null
};

const testPhoto3: CreatePhotoInput = {
  title: 'Test Photo 3',
  filename: 'test3.jpg',
  url: 'https://example.com/test3.jpg',
  thumbnail_url: 'https://example.com/thumb3.jpg',
  alt_text: 'Third test photo'
};

describe('getPhotos', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no photos exist', async () => {
    const result = await getPhotos();

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should return photos with default pagination', async () => {
    // Create test photos
    await db.insert(photosTable).values([
      { ...testPhoto1 },
      { ...testPhoto2 },
      { ...testPhoto3 }
    ]).execute();

    const result = await getPhotos();

    expect(result).toHaveLength(3);
    expect(result[0].title).toBeDefined();
    expect(result[0].filename).toBeDefined();
    expect(result[0].url).toBeDefined();
    expect(result[0].thumbnail_url).toBeDefined();
    expect(result[0].uploaded_at).toBeInstanceOf(Date);
    expect(result[0].id).toBeDefined();
  });

  it('should respect limit parameter', async () => {
    // Create test photos
    await db.insert(photosTable).values([
      { ...testPhoto1 },
      { ...testPhoto2 },
      { ...testPhoto3 }
    ]).execute();

    const input: GetPhotosInput = { limit: 2, offset: 0 };
    const result = await getPhotos(input);

    expect(result).toHaveLength(2);
  });

  it('should respect offset parameter', async () => {
    // Create test photos
    await db.insert(photosTable).values([
      { ...testPhoto1 },
      { ...testPhoto2 },
      { ...testPhoto3 }
    ]).execute();

    const input: GetPhotosInput = { limit: 20, offset: 2 };
    const result = await getPhotos(input);

    expect(result).toHaveLength(1);
  });

  it('should return photos ordered by uploaded_at descending', async () => {
    // Create photos with slight delay to ensure different timestamps
    await db.insert(photosTable).values({ ...testPhoto1 }).execute();
    
    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));
    
    await db.insert(photosTable).values({ ...testPhoto2 }).execute();
    
    await new Promise(resolve => setTimeout(resolve, 10));
    
    await db.insert(photosTable).values({ ...testPhoto3 }).execute();

    const result = await getPhotos();

    expect(result).toHaveLength(3);
    // Most recent should be first (descending order)
    expect(result[0].title).toEqual('Test Photo 3');
    expect(result[1].title).toEqual('Test Photo 2');
    expect(result[2].title).toEqual('Test Photo 1');
  });

  it('should handle pagination correctly', async () => {
    // Create 5 test photos
    const photos = Array.from({ length: 5 }, (_, i) => ({
      title: `Photo ${i + 1}`,
      filename: `photo${i + 1}.jpg`,
      url: `https://example.com/photo${i + 1}.jpg`,
      thumbnail_url: `https://example.com/thumb${i + 1}.jpg`,
      alt_text: `Photo ${i + 1} description`
    }));

    await db.insert(photosTable).values(photos).execute();

    // Test first page
    const firstPage = await getPhotos({ limit: 2, offset: 0 });
    expect(firstPage).toHaveLength(2);

    // Test second page
    const secondPage = await getPhotos({ limit: 2, offset: 2 });
    expect(secondPage).toHaveLength(2);

    // Test third page
    const thirdPage = await getPhotos({ limit: 2, offset: 4 });
    expect(thirdPage).toHaveLength(1);

    // Verify no duplicate results
    const firstPageIds = firstPage.map(p => p.id);
    const secondPageIds = secondPage.map(p => p.id);
    const thirdPageIds = thirdPage.map(p => p.id);

    expect(firstPageIds.some(id => secondPageIds.includes(id))).toBe(false);
    expect(firstPageIds.some(id => thirdPageIds.includes(id))).toBe(false);
    expect(secondPageIds.some(id => thirdPageIds.includes(id))).toBe(false);
  });

  it('should handle null alt_text correctly', async () => {
    await db.insert(photosTable).values({ ...testPhoto2 }).execute();

    const result = await getPhotos();

    expect(result).toHaveLength(1);
    expect(result[0].alt_text).toBeNull();
  });
});
