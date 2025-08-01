
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { galleryImagesTable } from '../db/schema';
import { type CreateGalleryImageInput } from '../schema';
import { createGalleryImage } from '../handlers/create_gallery_image';
import { eq } from 'drizzle-orm';

// Test input with all fields
const testInput: CreateGalleryImageInput = {
  title: 'Test Gallery Image',
  description: 'A beautiful antique piece for testing',
  image_url: 'https://example.com/test-image.jpg',
  alt_text: 'Test antique image',
  display_order: 5,
  is_featured: true
};

// Test input with minimal fields (using defaults)
const minimalInput: CreateGalleryImageInput = {
  title: 'Minimal Image',
  description: null,
  image_url: 'https://example.com/minimal.jpg',
  alt_text: null,
  display_order: 0, // Default value
  is_featured: false // Default value
};

describe('createGalleryImage', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a gallery image with all fields', async () => {
    const result = await createGalleryImage(testInput);

    // Basic field validation
    expect(result.title).toEqual('Test Gallery Image');
    expect(result.description).toEqual('A beautiful antique piece for testing');
    expect(result.image_url).toEqual('https://example.com/test-image.jpg');
    expect(result.alt_text).toEqual('Test antique image');
    expect(result.display_order).toEqual(5);
    expect(result.is_featured).toEqual(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should create a gallery image with minimal fields', async () => {
    const result = await createGalleryImage(minimalInput);

    // Basic field validation
    expect(result.title).toEqual('Minimal Image');
    expect(result.description).toBeNull();
    expect(result.image_url).toEqual('https://example.com/minimal.jpg');
    expect(result.alt_text).toBeNull();
    expect(result.display_order).toEqual(0);
    expect(result.is_featured).toEqual(false);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save gallery image to database', async () => {
    const result = await createGalleryImage(testInput);

    // Query using proper drizzle syntax
    const images = await db.select()
      .from(galleryImagesTable)
      .where(eq(galleryImagesTable.id, result.id))
      .execute();

    expect(images).toHaveLength(1);
    expect(images[0].title).toEqual('Test Gallery Image');
    expect(images[0].description).toEqual('A beautiful antique piece for testing');
    expect(images[0].image_url).toEqual('https://example.com/test-image.jpg');
    expect(images[0].alt_text).toEqual('Test antique image');
    expect(images[0].display_order).toEqual(5);
    expect(images[0].is_featured).toEqual(true);
    expect(images[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle nullable fields correctly', async () => {
    const inputWithNulls: CreateGalleryImageInput = {
      title: 'Image with Nulls',
      description: null,
      image_url: 'https://example.com/image.jpg',
      alt_text: null,
      display_order: 1,
      is_featured: false
    };

    const result = await createGalleryImage(inputWithNulls);

    expect(result.description).toBeNull();
    expect(result.alt_text).toBeNull();
    expect(result.title).toEqual('Image with Nulls');
    expect(result.image_url).toEqual('https://example.com/image.jpg');
  });
});
