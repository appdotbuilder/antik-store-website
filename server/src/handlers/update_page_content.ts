
import { db } from '../db';
import { pageContentTable } from '../db/schema';
import { type UpdatePageContentInput, type PageContent } from '../schema';
import { eq } from 'drizzle-orm';

export async function updatePageContent(input: UpdatePageContentInput): Promise<PageContent | null> {
  try {
    // Extract ID from input and create update object
    const { id, ...updateData } = input;
    
    // If no fields to update, return current record
    if (Object.keys(updateData).length === 0) {
      const existing = await db.select()
        .from(pageContentTable)
        .where(eq(pageContentTable.id, id))
        .execute();
      
      return existing.length > 0 ? existing[0] : null;
    }

    // Update the page content record
    const result = await db.update(pageContentTable)
      .set({
        ...updateData,
        updated_at: new Date()
      })
      .where(eq(pageContentTable.id, id))
      .returning()
      .execute();

    // Return the updated record or null if not found
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Page content update failed:', error);
    throw error;
  }
}
