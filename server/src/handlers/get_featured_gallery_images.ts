
import { db } from '../db';
import { galleryImagesTable } from '../db/schema';
import { type GalleryImage } from '../schema';
import { eq, asc } from 'drizzle-orm';

export const getFeaturedGalleryImages = async (): Promise<GalleryImage[]> => {
  try {
    const results = await db.select()
      .from(galleryImagesTable)
      .where(eq(galleryImagesTable.is_featured, true))
      .orderBy(asc(galleryImagesTable.display_order))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch featured gallery images:', error);
    throw error;
  }
};
