
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { antiqueItemsTable } from '../db/schema';
import { type CreateAntiqueItemInput } from '../schema';
import { getAntiqueItemById } from '../handlers/get_antique_item_by_id';

// Test antique item input
const testInput: CreateAntiqueItemInput = {
  name: 'Victorian Dining Table',
  description: 'Beautiful Victorian era dining table made of mahogany',
  year: 1875,
  origin: 'England',
  price: 2500.00,
  availability_status: 'available',
  category: 'Furniture',
  condition: 'very_good',
  dimensions: '72" x 42" x 30"',
  material: 'Mahogany',
  main_image_url: 'https://example.com/table.jpg'
};

describe('getAntiqueItemById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return antique item when found', async () => {
    // Create test antique item
    const insertResult = await db.insert(antiqueItemsTable)
      .values({
        ...testInput,
        price: testInput.price.toString()
      })
      .returning()
      .execute();

    const createdItem = insertResult[0];

    // Get the item by ID
    const result = await getAntiqueItemById(createdItem.id);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdItem.id);
    expect(result!.name).toEqual('Victorian Dining Table');
    expect(result!.description).toEqual(testInput.description);
    expect(result!.year).toEqual(1875);
    expect(result!.origin).toEqual('England');
    expect(result!.price).toEqual(2500.00);
    expect(typeof result!.price).toBe('number');
    expect(result!.availability_status).toEqual('available');
    expect(result!.category).toEqual('Furniture');
    expect(result!.condition).toEqual('very_good');
    expect(result!.dimensions).toEqual('72" x 42" x 30"');
    expect(result!.material).toEqual('Mahogany');
    expect(result!.main_image_url).toEqual('https://example.com/table.jpg');
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when item not found', async () => {
    const result = await getAntiqueItemById(999);
    expect(result).toBeNull();
  });

  it('should handle items with nullable fields', async () => {
    // Create item with minimal required fields
    const minimalInput = {
      name: 'Mystery Artifact',
      description: 'Unknown antique item',
      year: null,
      origin: null,
      price: '150.00',
      availability_status: 'available' as const,
      category: 'Miscellaneous',
      condition: 'fair' as const,
      dimensions: null,
      material: null,
      main_image_url: null
    };

    const insertResult = await db.insert(antiqueItemsTable)
      .values(minimalInput)
      .returning()
      .execute();

    const createdItem = insertResult[0];

    // Get the item by ID
    const result = await getAntiqueItemById(createdItem.id);

    expect(result).not.toBeNull();
    expect(result!.name).toEqual('Mystery Artifact');
    expect(result!.year).toBeNull();
    expect(result!.origin).toBeNull();
    expect(result!.price).toEqual(150.00);
    expect(result!.dimensions).toBeNull();
    expect(result!.material).toBeNull();
    expect(result!.main_image_url).toBeNull();
  });
});
