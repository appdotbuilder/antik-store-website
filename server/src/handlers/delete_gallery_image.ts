
import { db } from '../db';
import { galleryImagesTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function deleteGalleryImage(id: number): Promise<boolean> {
  try {
    const result = await db.delete(galleryImagesTable)
      .where(eq(galleryImagesTable.id, id))
      .returning()
      .execute();

    return result.length > 0;
  } catch (error) {
    console.error('Gallery image deletion failed:', error);
    throw error;
  }
}
