
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { galleryImagesTable } from '../db/schema';
import { type CreateGalleryImageInput } from '../schema';
import { deleteGalleryImage } from '../handlers/delete_gallery_image';
import { eq } from 'drizzle-orm';

// Test input for creating gallery images
const testImageInput: CreateGalleryImageInput = {
  title: 'Test Gallery Image',
  description: 'A test image for the gallery',
  image_url: 'https://example.com/test-image.jpg',
  alt_text: 'Test image alt text',
  display_order: 1,
  is_featured: false
};

describe('deleteGalleryImage', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing gallery image', async () => {
    // Create a gallery image first
    const createResult = await db.insert(galleryImagesTable)
      .values({
        title: testImageInput.title,
        description: testImageInput.description,
        image_url: testImageInput.image_url,
        alt_text: testImageInput.alt_text,
        display_order: testImageInput.display_order,
        is_featured: testImageInput.is_featured
      })
      .returning()
      .execute();

    const createdImage = createResult[0];

    // Delete the gallery image
    const result = await deleteGalleryImage(createdImage.id);

    expect(result).toBe(true);

    // Verify image was deleted from database
    const images = await db.select()
      .from(galleryImagesTable)
      .where(eq(galleryImagesTable.id, createdImage.id))
      .execute();

    expect(images).toHaveLength(0);
  });

  it('should return false when trying to delete non-existent gallery image', async () => {
    const nonExistentId = 9999;

    const result = await deleteGalleryImage(nonExistentId);

    expect(result).toBe(false);
  });

  it('should not affect other gallery images when deleting one', async () => {
    // Create two gallery images
    const image1Result = await db.insert(galleryImagesTable)
      .values({
        title: 'First Image',
        description: 'First test image',
        image_url: 'https://example.com/image1.jpg',
        alt_text: 'First image',
        display_order: 1,
        is_featured: false
      })
      .returning()
      .execute();

    const image2Result = await db.insert(galleryImagesTable)
      .values({
        title: 'Second Image',
        description: 'Second test image',
        image_url: 'https://example.com/image2.jpg',
        alt_text: 'Second image',
        display_order: 2,
        is_featured: true
      })
      .returning()
      .execute();

    const image1 = image1Result[0];
    const image2 = image2Result[0];

    // Delete first image
    const result = await deleteGalleryImage(image1.id);

    expect(result).toBe(true);

    // Verify only first image was deleted
    const remainingImages = await db.select()
      .from(galleryImagesTable)
      .execute();

    expect(remainingImages).toHaveLength(1);
    expect(remainingImages[0].id).toEqual(image2.id);
    expect(remainingImages[0].title).toEqual('Second Image');
  });
});
