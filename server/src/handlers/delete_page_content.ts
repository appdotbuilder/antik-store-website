
import { db } from '../db';
import { pageContentTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function deletePageContent(id: number): Promise<boolean> {
  try {
    const result = await db.delete(pageContentTable)
      .where(eq(pageContentTable.id, id))
      .returning()
      .execute();

    return result.length > 0;
  } catch (error) {
    console.error('Page content deletion failed:', error);
    throw error;
  }
}
