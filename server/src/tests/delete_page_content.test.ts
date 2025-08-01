
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { pageContentTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { deletePageContent } from '../handlers/delete_page_content';

describe('deletePageContent', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete existing page content and return true', async () => {
    // Create test page content
    const insertResult = await db.insert(pageContentTable)
      .values({
        page_slug: 'test-page',
        title: 'Test Page',
        content: 'Test content for the page',
        meta_description: 'Test meta description',
        is_published: true
      })
      .returning()
      .execute();

    const pageId = insertResult[0].id;

    // Delete the page content
    const result = await deletePageContent(pageId);

    expect(result).toBe(true);

    // Verify it was deleted from database
    const remainingPages = await db.select()
      .from(pageContentTable)
      .where(eq(pageContentTable.id, pageId))
      .execute();

    expect(remainingPages).toHaveLength(0);
  });

  it('should return false when page content does not exist', async () => {
    const nonExistentId = 99999;

    const result = await deletePageContent(nonExistentId);

    expect(result).toBe(false);
  });

  it('should not affect other page content when deleting specific page', async () => {
    // Create multiple page contents
    const insertResults = await db.insert(pageContentTable)
      .values([
        {
          page_slug: 'page-1',
          title: 'Page 1',
          content: 'Content 1',
          meta_description: null,
          is_published: true
        },
        {
          page_slug: 'page-2',
          title: 'Page 2',
          content: 'Content 2',
          meta_description: 'Meta 2',
          is_published: false
        }
      ])
      .returning()
      .execute();

    const page1Id = insertResults[0].id;
    const page2Id = insertResults[1].id;

    // Delete first page
    const result = await deletePageContent(page1Id);

    expect(result).toBe(true);

    // Verify only first page was deleted
    const page1 = await db.select()
      .from(pageContentTable)
      .where(eq(pageContentTable.id, page1Id))
      .execute();

    const page2 = await db.select()
      .from(pageContentTable)
      .where(eq(pageContentTable.id, page2Id))
      .execute();

    expect(page1).toHaveLength(0);
    expect(page2).toHaveLength(1);
    expect(page2[0].title).toEqual('Page 2');
  });
});
