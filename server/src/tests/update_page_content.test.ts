
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { pageContentTable } from '../db/schema';
import { type UpdatePageContentInput, type CreatePageContentInput } from '../schema';
import { updatePageContent } from '../handlers/update_page_content';
import { eq } from 'drizzle-orm';

// Test data
const testPageContent: CreatePageContentInput = {
  page_slug: 'test-page',
  title: 'Test Page',
  content: 'This is test content for the page',
  meta_description: 'Test meta description',
  is_published: true
};

describe('updatePageContent', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update page content successfully', async () => {
    // Create initial page content
    const created = await db.insert(pageContentTable)
      .values(testPageContent)
      .returning()
      .execute();
    
    const pageId = created[0].id;

    // Update the page content
    const updateInput: UpdatePageContentInput = {
      id: pageId,
      title: 'Updated Test Page',
      content: 'This is updated content',
      meta_description: 'Updated meta description',
      is_published: false
    };

    const result = await updatePageContent(updateInput);

    // Verify update was successful
    expect(result).toBeDefined();
    expect(result!.id).toEqual(pageId);
    expect(result!.title).toEqual('Updated Test Page');
    expect(result!.content).toEqual('This is updated content');
    expect(result!.meta_description).toEqual('Updated meta description');
    expect(result!.is_published).toEqual(false);
    expect(result!.page_slug).toEqual('test-page'); // Should remain unchanged
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should update partial fields only', async () => {
    // Create initial page content
    const created = await db.insert(pageContentTable)
      .values(testPageContent)
      .returning()
      .execute();
    
    const pageId = created[0].id;

    // Update only title and content
    const updateInput: UpdatePageContentInput = {
      id: pageId,
      title: 'Partially Updated Title',
      content: 'Partially updated content'
    };

    const result = await updatePageContent(updateInput);

    // Verify only specified fields were updated
    expect(result).toBeDefined();
    expect(result!.title).toEqual('Partially Updated Title');
    expect(result!.content).toEqual('Partially updated content');
    expect(result!.meta_description).toEqual('Test meta description'); // Unchanged
    expect(result!.is_published).toEqual(true); // Unchanged
    expect(result!.page_slug).toEqual('test-page'); // Unchanged
  });

  it('should return null for non-existent page', async () => {
    const updateInput: UpdatePageContentInput = {
      id: 999999,
      title: 'Non-existent Page'
    };

    const result = await updatePageContent(updateInput);

    expect(result).toBeNull();
  });

  it('should persist changes to database', async () => {
    // Create initial page content
    const created = await db.insert(pageContentTable)
      .values(testPageContent)
      .returning()
      .execute();
    
    const pageId = created[0].id;

    // Update the page content
    const updateInput: UpdatePageContentInput = {
      id: pageId,
      title: 'Database Persisted Title',
      is_published: false
    };

    await updatePageContent(updateInput);

    // Verify changes were persisted in database
    const dbRecord = await db.select()
      .from(pageContentTable)
      .where(eq(pageContentTable.id, pageId))
      .execute();

    expect(dbRecord).toHaveLength(1);
    expect(dbRecord[0].title).toEqual('Database Persisted Title');
    expect(dbRecord[0].is_published).toEqual(false);
    expect(dbRecord[0].updated_at).toBeInstanceOf(Date);
  });

  it('should return existing record when no update fields provided', async () => {
    // Create initial page content
    const created = await db.insert(pageContentTable)
      .values(testPageContent)
      .returning()
      .execute();
    
    const pageId = created[0].id;

    // Update with only ID (no fields to update)
    const updateInput: UpdatePageContentInput = {
      id: pageId
    };

    const result = await updatePageContent(updateInput);

    // Should return existing record unchanged
    expect(result).toBeDefined();
    expect(result!.id).toEqual(pageId);
    expect(result!.title).toEqual('Test Page');
    expect(result!.content).toEqual('This is test content for the page');
    expect(result!.page_slug).toEqual('test-page');
  });

  it('should handle nullable fields correctly', async () => {
    // Create page content with nullable fields set to null
    const contentWithNulls: CreatePageContentInput = {
      page_slug: 'null-test-page',
      title: 'Page with Nulls',
      content: 'Content with null fields',
      meta_description: null,
      is_published: true
    };

    const created = await db.insert(pageContentTable)
      .values(contentWithNulls)
      .returning()
      .execute();
    
    const pageId = created[0].id;

    // Update nullable field from null to value
    const updateInput: UpdatePageContentInput = {
      id: pageId,
      meta_description: 'Now has meta description'
    };

    const result = await updatePageContent(updateInput);

    expect(result).toBeDefined();
    expect(result!.meta_description).toEqual('Now has meta description');

    // Update nullable field from value to null
    const updateToNull: UpdatePageContentInput = {
      id: pageId,
      meta_description: null
    };

    const resultNull = await updatePageContent(updateToNull);

    expect(resultNull).toBeDefined();
    expect(resultNull!.meta_description).toBeNull();
  });
});
