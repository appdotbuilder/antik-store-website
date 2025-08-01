
import { db } from '../db';
import { pageContentTable } from '../db/schema';
import { type PageContent } from '../schema';
import { desc } from 'drizzle-orm';

export const getAllPageContent = async (): Promise<PageContent[]> => {
  try {
    const results = await db.select()
      .from(pageContentTable)
      .orderBy(desc(pageContentTable.updated_at))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch all page content:', error);
    throw error;
  }
};
