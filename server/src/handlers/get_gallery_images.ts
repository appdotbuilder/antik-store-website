
import { db } from '../db';
import { galleryImagesTable } from '../db/schema';
import { type GalleryImage } from '../schema';
import { asc } from 'drizzle-orm';

export async function getGalleryImages(): Promise<GalleryImage[]> {
  try {
    const results = await db.select()
      .from(galleryImagesTable)
      .orderBy(asc(galleryImagesTable.display_order), asc(galleryImagesTable.created_at))
      .execute();

    // No numeric conversions needed - all fields are text, integer, or boolean
    return results;
  } catch (error) {
    console.error('Failed to fetch gallery images:', error);
    throw error;
  }
}
