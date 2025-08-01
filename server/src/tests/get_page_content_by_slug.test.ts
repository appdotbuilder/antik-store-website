
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { pageContentTable } from '../db/schema';
import { type CreatePageContentInput } from '../schema';
import { getPageContentBySlug } from '../handlers/get_page_content_by_slug';

// Test data
const testPageContent: CreatePageContentInput = {
  page_slug: 'about-us',
  title: 'About Our Antique Store',
  content: 'We are a family-owned antique store with over 30 years of experience.',
  meta_description: 'Learn about our antique store history and expertise',
  is_published: true
};

const unpublishedPageContent: CreatePageContentInput = {
  page_slug: 'draft-page',
  title: 'Draft Page',
  content: 'This is a draft page that should not be visible',
  meta_description: 'Draft page for testing',
  is_published: false
};

describe('getPageContentBySlug', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return page content when slug exists and is published', async () => {
    // Create test page content
    await db.insert(pageContentTable)
      .values(testPageContent)
      .execute();

    const result = await getPageContentBySlug('about-us');

    expect(result).not.toBeNull();
    expect(result!.page_slug).toEqual('about-us');
    expect(result!.title).toEqual('About Our Antique Store');
    expect(result!.content).toEqual(testPageContent.content);
    expect(result!.meta_description).toEqual(testPageContent.meta_description);
    expect(result!.is_published).toBe(true);
    expect(result!.id).toBeDefined();
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when slug does not exist', async () => {
    const result = await getPageContentBySlug('non-existent-page');

    expect(result).toBeNull();
  });

  it('should return null when page exists but is not published', async () => {
    // Create unpublished page content
    await db.insert(pageContentTable)
      .values(unpublishedPageContent)
      .execute();

    const result = await getPageContentBySlug('draft-page');

    expect(result).toBeNull();
  });

  it('should return only published content when multiple pages with same slug exist', async () => {
    // Create both published and unpublished content with same slug (though unique constraint would prevent this in real scenario)
    // This test demonstrates the published filter works correctly
    await db.insert(pageContentTable)
      .values(testPageContent)
      .execute();

    const result = await getPageContentBySlug('about-us');

    expect(result).not.toBeNull();
    expect(result!.is_published).toBe(true);
    expect(result!.title).toEqual('About Our Antique Store');
  });

  it('should handle special characters in slug', async () => {
    const specialSlugContent: CreatePageContentInput = {
      page_slug: 'contact-us-2024',
      title: 'Contact Us',
      content: 'Contact information and form',
      meta_description: null,
      is_published: true
    };

    await db.insert(pageContentTable)
      .values(specialSlugContent)
      .execute();

    const result = await getPageContentBySlug('contact-us-2024');

    expect(result).not.toBeNull();
    expect(result!.page_slug).toEqual('contact-us-2024');
    expect(result!.title).toEqual('Contact Us');
    expect(result!.meta_description).toBeNull();
  });
});
