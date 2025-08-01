
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { pageContentTable } from '../db/schema';
import { type CreatePageContentInput } from '../schema';
import { createPageContent } from '../handlers/create_page_content';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreatePageContentInput = {
  page_slug: 'about-us',
  title: 'About Our Antique Store',
  content: 'We are a family-owned antique store with over 30 years of experience.',
  meta_description: 'Learn about our history and passion for antiques',
  is_published: true
};

describe('createPageContent', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create page content', async () => {
    const result = await createPageContent(testInput);

    // Basic field validation
    expect(result.page_slug).toEqual('about-us');
    expect(result.title).toEqual('About Our Antique Store');
    expect(result.content).toEqual(testInput.content);
    expect(result.meta_description).toEqual('Learn about our history and passion for antiques');
    expect(result.is_published).toEqual(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save page content to database', async () => {
    const result = await createPageContent(testInput);

    // Query using proper drizzle syntax
    const pageContents = await db.select()
      .from(pageContentTable)
      .where(eq(pageContentTable.id, result.id))
      .execute();

    expect(pageContents).toHaveLength(1);
    expect(pageContents[0].page_slug).toEqual('about-us');
    expect(pageContents[0].title).toEqual('About Our Antique Store');
    expect(pageContents[0].content).toEqual(testInput.content);
    expect(pageContents[0].meta_description).toEqual(testInput.meta_description);
    expect(pageContents[0].is_published).toEqual(true);
    expect(pageContents[0].created_at).toBeInstanceOf(Date);
    expect(pageContents[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle null meta_description', async () => {
    const inputWithNullMeta: CreatePageContentInput = {
      page_slug: 'contact',
      title: 'Contact Us',
      content: 'Get in touch with our team.',
      meta_description: null,
      is_published: true
    };

    const result = await createPageContent(inputWithNullMeta);

    expect(result.meta_description).toBeNull();
    expect(result.page_slug).toEqual('contact');
    expect(result.title).toEqual('Contact Us');
  });

  it('should apply default values from Zod schema', async () => {
    const minimalInput = {
      page_slug: 'services',
      title: 'Our Services',
      content: 'We offer various antique services.'
    } as CreatePageContentInput;

    const result = await createPageContent(minimalInput);

    expect(result.is_published).toEqual(true); // Default from Zod schema
    expect(result.meta_description).toBeNull(); // Explicitly set to null
    expect(result.page_slug).toEqual('services');
    expect(result.title).toEqual('Our Services');
  });

  it('should reject duplicate page slugs', async () => {
    // Create first page content
    await createPageContent(testInput);

    // Try to create second page content with same slug
    expect(createPageContent(testInput)).rejects.toThrow(/unique/i);
  });
});
