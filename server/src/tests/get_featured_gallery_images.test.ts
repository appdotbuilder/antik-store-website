
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { galleryImagesTable } from '../db/schema';
import { type CreateGalleryImageInput } from '../schema';
import { getFeaturedGalleryImages } from '../handlers/get_featured_gallery_images';

const featuredImage1: CreateGalleryImageInput = {
  title: 'Featured Image 1',
  description: 'First featured image',
  image_url: 'https://example.com/featured1.jpg',
  alt_text: 'Featured image 1',
  display_order: 2,
  is_featured: true
};

const featuredImage2: CreateGalleryImageInput = {
  title: 'Featured Image 2',
  description: 'Second featured image',
  image_url: 'https://example.com/featured2.jpg',
  alt_text: 'Featured image 2',
  display_order: 1,
  is_featured: true
};

const nonFeaturedImage: CreateGalleryImageInput = {
  title: 'Regular Image',
  description: 'Not featured image',
  image_url: 'https://example.com/regular.jpg',
  alt_text: 'Regular image',
  display_order: 0,
  is_featured: false
};

describe('getFeaturedGalleryImages', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return only featured images', async () => {
    // Create test images
    await db.insert(galleryImagesTable)
      .values([featuredImage1, featuredImage2, nonFeaturedImage])
      .execute();

    const result = await getFeaturedGalleryImages();

    expect(result).toHaveLength(2);
    result.forEach(image => {
      expect(image.is_featured).toBe(true);
    });
  });

  it('should return images ordered by display_order', async () => {
    // Create test images
    await db.insert(galleryImagesTable)
      .values([featuredImage1, featuredImage2])
      .execute();

    const result = await getFeaturedGalleryImages();

    expect(result).toHaveLength(2);
    expect(result[0].display_order).toBe(1);
    expect(result[1].display_order).toBe(2);
    expect(result[0].title).toBe('Featured Image 2');
    expect(result[1].title).toBe('Featured Image 1');
  });

  it('should return empty array when no featured images exist', async () => {
    // Create only non-featured image
    await db.insert(galleryImagesTable)
      .values([nonFeaturedImage])
      .execute();

    const result = await getFeaturedGalleryImages();

    expect(result).toHaveLength(0);
  });

  it('should return all expected fields', async () => {
    await db.insert(galleryImagesTable)
      .values([featuredImage1])
      .execute();

    const result = await getFeaturedGalleryImages();

    expect(result).toHaveLength(1);
    const image = result[0];
    
    expect(image.id).toBeDefined();
    expect(image.title).toBe('Featured Image 1');
    expect(image.description).toBe('First featured image');
    expect(image.image_url).toBe('https://example.com/featured1.jpg');
    expect(image.alt_text).toBe('Featured image 1');
    expect(image.display_order).toBe(2);
    expect(image.is_featured).toBe(true);
    expect(image.created_at).toBeInstanceOf(Date);
  });
});
