
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { pageContentTable } from '../db/schema';
import { type CreatePageContentInput } from '../schema';
import { getAllPageContent } from '../handlers/get_all_page_content';

// Test page content inputs
const testPage1: CreatePageContentInput = {
  page_slug: 'about-us',
  title: 'About Us',
  content: 'Welcome to our antique store with over 50 years of experience.',
  meta_description: 'Learn about our antique store history',
  is_published: true
};

const testPage2: CreatePageContentInput = {
  page_slug: 'contact',
  title: 'Contact Information',
  content: 'Get in touch with us for inquiries about our antiques.',
  meta_description: 'Contact our antique store',
  is_published: false
};

const testPage3: CreatePageContentInput = {
  page_slug: 'services',
  title: 'Our Services',
  content: 'We offer appraisals, restoration, and buying services.',
  meta_description: null,
  is_published: true
};

describe('getAllPageContent', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no pages exist', async () => {
    const result = await getAllPageContent();

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should return all page content', async () => {
    // Create test pages
    await db.insert(pageContentTable)
      .values([
        {
          page_slug: testPage1.page_slug,
          title: testPage1.title,
          content: testPage1.content,
          meta_description: testPage1.meta_description,
          is_published: testPage1.is_published
        },
        {
          page_slug: testPage2.page_slug,
          title: testPage2.title,
          content: testPage2.content,
          meta_description: testPage2.meta_description,
          is_published: testPage2.is_published
        }
      ])
      .execute();

    const result = await getAllPageContent();

    expect(result).toHaveLength(2);
    
    // Verify all fields are present
    result.forEach(page => {
      expect(page.id).toBeDefined();
      expect(page.page_slug).toBeDefined();
      expect(page.title).toBeDefined();
      expect(page.content).toBeDefined();
      expect(page.created_at).toBeInstanceOf(Date);
      expect(page.updated_at).toBeInstanceOf(Date);
      expect(typeof page.is_published).toBe('boolean');
    });

    // Verify specific content
    const aboutPage = result.find(p => p.page_slug === 'about-us');
    const contactPage = result.find(p => p.page_slug === 'contact');

    expect(aboutPage).toBeDefined();
    expect(aboutPage!.title).toEqual('About Us');
    expect(aboutPage!.is_published).toBe(true);

    expect(contactPage).toBeDefined();
    expect(contactPage!.title).toEqual('Contact Information');
    expect(contactPage!.is_published).toBe(false);
  });

  it('should return both published and unpublished pages', async () => {
    // Create mix of published and unpublished pages
    await db.insert(pageContentTable)
      .values([
        {
          page_slug: testPage1.page_slug,
          title: testPage1.title,
          content: testPage1.content,
          meta_description: testPage1.meta_description,
          is_published: true
        },
        {
          page_slug: testPage2.page_slug,
          title: testPage2.title,
          content: testPage2.content,
          meta_description: testPage2.meta_description,
          is_published: false
        }
      ])
      .execute();

    const result = await getAllPageContent();

    expect(result).toHaveLength(2);
    
    const publishedPages = result.filter(p => p.is_published);
    const unpublishedPages = result.filter(p => !p.is_published);

    expect(publishedPages).toHaveLength(1);
    expect(unpublishedPages).toHaveLength(1);
  });

  it('should handle pages with nullable fields correctly', async () => {
    // Create page with null meta_description
    await db.insert(pageContentTable)
      .values({
        page_slug: testPage3.page_slug,
        title: testPage3.title,
        content: testPage3.content,
        meta_description: testPage3.meta_description, // null
        is_published: testPage3.is_published
      })
      .execute();

    const result = await getAllPageContent();

    expect(result).toHaveLength(1);
    expect(result[0].meta_description).toBeNull();
    expect(result[0].page_slug).toEqual('services');
    expect(result[0].title).toEqual('Our Services');
  });

  it('should order pages by updated_at descending', async () => {
    // Create first page
    const firstPageResult = await db.insert(pageContentTable)
      .values({
        page_slug: 'first-page',
        title: 'First Page',
        content: 'First page content',
        meta_description: null,
        is_published: true
      })
      .returning()
      .execute();

    // Wait a bit to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    // Create second page (should have later timestamp)
    const secondPageResult = await db.insert(pageContentTable)
      .values({
        page_slug: 'second-page',
        title: 'Second Page',
        content: 'Second page content',
        meta_description: null,
        is_published: true
      })
      .returning()
      .execute();

    const result = await getAllPageContent();

    expect(result).toHaveLength(2);
    
    // First result should be the most recently updated (second page)
    expect(result[0].page_slug).toEqual('second-page');
    expect(result[1].page_slug).toEqual('first-page');
    
    // Verify ordering by comparing timestamps
    expect(result[0].updated_at >= result[1].updated_at).toBe(true);
  });
});
