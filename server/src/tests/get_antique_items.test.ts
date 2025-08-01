
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { antiqueItemsTable } from '../db/schema';
import { type CreateAntiqueItemInput } from '../schema';
import { getAntiqueItems } from '../handlers/get_antique_items';

// Test input for creating antique items
const testItem1: Omit<CreateAntiqueItemInput, 'availability_status'> = {
  name: 'Victorian Chair',
  description: 'Beautiful Victorian era dining chair',
  year: 1880,
  origin: 'England',
  price: 299.99,
  category: 'Furniture',
  condition: 'very_good',
  dimensions: '18" x 20" x 36"',
  material: 'Mahogany',
  main_image_url: 'https://example.com/chair.jpg'
};

const testItem2: Omit<CreateAntiqueItemInput, 'availability_status'> = {
  name: 'Art Deco Vase',
  description: 'Stunning Art Deco ceramic vase',
  year: 1925,
  origin: 'France',
  price: 149.50,
  category: 'Ceramics',
  condition: 'excellent',
  dimensions: '8" diameter x 12" height',
  material: 'Ceramic',
  main_image_url: 'https://example.com/vase.jpg'
};

describe('getAntiqueItems', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no items exist', async () => {
    const results = await getAntiqueItems();
    expect(results).toEqual([]);
  });

  it('should return all antique items', async () => {
    // Create test items
    await db.insert(antiqueItemsTable)
      .values([
        {
          ...testItem1,
          price: testItem1.price.toString(),
          availability_status: 'available'
        },
        {
          ...testItem2,
          price: testItem2.price.toString(),
          availability_status: 'available'
        }
      ])
      .execute();

    const results = await getAntiqueItems();

    expect(results).toHaveLength(2);
    
    // Verify all fields are present and correctly typed
    results.forEach(item => {
      expect(item.id).toBeDefined();
      expect(typeof item.name).toBe('string');
      expect(typeof item.description).toBe('string');
      expect(typeof item.price).toBe('number');
      expect(item.created_at).toBeInstanceOf(Date);
      expect(item.updated_at).toBeInstanceOf(Date);
    });

    // Verify specific item data
    const chairItem = results.find(item => item.name === 'Victorian Chair');
    expect(chairItem).toBeDefined();
    expect(chairItem!.price).toEqual(299.99);
    expect(chairItem!.year).toEqual(1880);
    expect(chairItem!.condition).toEqual('very_good');

    const vaseItem = results.find(item => item.name === 'Art Deco Vase');
    expect(vaseItem).toBeDefined();
    expect(vaseItem!.price).toEqual(149.50);
    expect(vaseItem!.origin).toEqual('France');
    expect(vaseItem!.condition).toEqual('excellent');
  });

  it('should return items ordered by created_at descending', async () => {
    // Create first item
    await db.insert(antiqueItemsTable)
      .values({
        ...testItem1,
        price: testItem1.price.toString(),
        availability_status: 'available'
      })
      .execute();

    // Wait a moment to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    // Create second item
    await db.insert(antiqueItemsTable)
      .values({
        ...testItem2,
        price: testItem2.price.toString(),
        availability_status: 'available'
      })
      .execute();

    const results = await getAntiqueItems();

    expect(results).toHaveLength(2);
    // Most recently created item should be first
    expect(results[0].name).toEqual('Art Deco Vase');
    expect(results[1].name).toEqual('Victorian Chair');
    
    // Verify ordering by timestamp
    expect(results[0].created_at >= results[1].created_at).toBe(true);
  });

  it('should handle items with nullable fields', async () => {
    // Create item with minimal required fields
    await db.insert(antiqueItemsTable)
      .values({
        name: 'Unknown Artifact',
        description: 'Mysterious antique item',
        price: '75.00',
        category: 'Miscellaneous',
        condition: 'fair',
        availability_status: 'available',
        year: null,
        origin: null,
        dimensions: null,
        material: null,
        main_image_url: null
      })
      .execute();

    const results = await getAntiqueItems();

    expect(results).toHaveLength(1);
    const item = results[0];
    
    expect(item.name).toEqual('Unknown Artifact');
    expect(item.price).toEqual(75.00);
    expect(item.year).toBeNull();
    expect(item.origin).toBeNull();
    expect(item.dimensions).toBeNull();
    expect(item.material).toBeNull();
    expect(item.main_image_url).toBeNull();
  });
});
