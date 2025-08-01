
import { db } from '../db';
import { pageContentTable } from '../db/schema';
import { type PageContent } from '../schema';
import { eq, and } from 'drizzle-orm';

export async function getPageContentBySlug(slug: string): Promise<PageContent | null> {
  try {
    const results = await db.select()
      .from(pageContentTable)
      .where(and(
        eq(pageContentTable.page_slug, slug),
        eq(pageContentTable.is_published, true)
      ))
      .limit(1)
      .execute();

    if (results.length === 0) {
      return null;
    }

    const pageContent = results[0];
    return pageContent;
  } catch (error) {
    console.error('Failed to get page content by slug:', error);
    throw error;
  }
}
