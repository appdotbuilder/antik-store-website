
import { db } from '../db';
import { galleryImagesTable } from '../db/schema';
import { type CreateGalleryImageInput, type GalleryImage } from '../schema';

export const createGalleryImage = async (input: CreateGalleryImageInput): Promise<GalleryImage> => {
  try {
    // Insert gallery image record
    const result = await db.insert(galleryImagesTable)
      .values({
        title: input.title,
        description: input.description,
        image_url: input.image_url,
        alt_text: input.alt_text,
        display_order: input.display_order,
        is_featured: input.is_featured
      })
      .returning()
      .execute();

    // Return the created gallery image
    const galleryImage = result[0];
    return galleryImage;
  } catch (error) {
    console.error('Gallery image creation failed:', error);
    throw error;
  }
};
