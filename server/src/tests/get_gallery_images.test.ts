
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { galleryImagesTable } from '../db/schema';
import { getGalleryImages } from '../handlers/get_gallery_images';

describe('getGalleryImages', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no images exist', async () => {
    const result = await getGalleryImages();
    expect(result).toEqual([]);
  });

  it('should return all gallery images', async () => {
    // Create test gallery images
    await db.insert(galleryImagesTable)
      .values([
        {
          title: 'Test Image 1',
          description: 'First test image',
          image_url: 'https://example.com/image1.jpg',
          alt_text: 'Alt text 1',
          display_order: 1,
          is_featured: true
        },
        {
          title: 'Test Image 2',
          description: null,
          image_url: 'https://example.com/image2.jpg',
          alt_text: null,
          display_order: 2,
          is_featured: false
        }
      ])
      .execute();

    const result = await getGalleryImages();

    expect(result).toHaveLength(2);
    
    // Verify first image
    expect(result[0].title).toEqual('Test Image 1');
    expect(result[0].description).toEqual('First test image');
    expect(result[0].image_url).toEqual('https://example.com/image1.jpg');
    expect(result[0].alt_text).toEqual('Alt text 1');
    expect(result[0].display_order).toEqual(1);
    expect(result[0].is_featured).toEqual(true);
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);

    // Verify second image
    expect(result[1].title).toEqual('Test Image 2');
    expect(result[1].description).toBeNull();
    expect(result[1].image_url).toEqual('https://example.com/image2.jpg');
    expect(result[1].alt_text).toBeNull();
    expect(result[1].display_order).toEqual(2);
    expect(result[1].is_featured).toEqual(false);
  });

  it('should return images ordered by display_order then by created_at', async () => {
    // Create images with same display_order but different creation times
    const firstImage = await db.insert(galleryImagesTable)
      .values({
        title: 'First Created',
        image_url: 'https://example.com/first.jpg',
        display_order: 5,
        is_featured: false
      })
      .returning()
      .execute();

    // Wait a moment to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(galleryImagesTable)
      .values([
        {
          title: 'Lower Display Order',
          image_url: 'https://example.com/lower.jpg',
          display_order: 1,
          is_featured: false
        },
        {
          title: 'Second Created Same Order',
          image_url: 'https://example.com/second.jpg',
          display_order: 5,
          is_featured: false
        }
      ])
      .execute();

    const result = await getGalleryImages();

    expect(result).toHaveLength(3);
    
    // Should be ordered by display_order first
    expect(result[0].title).toEqual('Lower Display Order');
    expect(result[0].display_order).toEqual(1);
    
    // Then by created_at for same display_order
    expect(result[1].title).toEqual('First Created');
    expect(result[1].display_order).toEqual(5);
    expect(result[2].title).toEqual('Second Created Same Order');
    expect(result[2].display_order).toEqual(5);
    
    // Verify chronological order for same display_order
    expect(result[1].created_at.getTime()).toBeLessThan(result[2].created_at.getTime());
  });

  it('should handle images with null optional fields', async () => {
    await db.insert(galleryImagesTable)
      .values({
        title: 'Minimal Image',
        description: null,
        image_url: 'https://example.com/minimal.jpg',
        alt_text: null,
        display_order: 0,
        is_featured: false
      })
      .execute();

    const result = await getGalleryImages();

    expect(result).toHaveLength(1);
    expect(result[0].title).toEqual('Minimal Image');
    expect(result[0].description).toBeNull();
    expect(result[0].alt_text).toBeNull();
    expect(result[0].image_url).toEqual('https://example.com/minimal.jpg');
    expect(result[0].display_order).toEqual(0);
    expect(result[0].is_featured).toEqual(false);
  });
});
