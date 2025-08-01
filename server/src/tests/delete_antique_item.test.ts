
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { antiqueItemsTable } from '../db/schema';
import { type CreateAntiqueItemInput } from '../schema';
import { deleteAntiqueItem } from '../handlers/delete_antique_item';
import { eq } from 'drizzle-orm';

// Test antique item data
const testAntiqueItem: CreateAntiqueItemInput = {
  name: 'Victorian Chair',
  description: 'Beautiful antique Victorian chair in excellent condition',
  year: 1875,
  origin: 'England',
  price: 299.99,
  availability_status: 'available',
  category: 'Furniture',
  condition: 'excellent',
  dimensions: '80cm x 50cm x 45cm',
  material: 'Mahogany',
  main_image_url: 'https://example.com/chair.jpg'
};

describe('deleteAntiqueItem', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing antique item', async () => {
    // Create a test antique item first
    const createResult = await db.insert(antiqueItemsTable)
      .values({
        name: testAntiqueItem.name,
        description: testAntiqueItem.description,
        year: testAntiqueItem.year,
        origin: testAntiqueItem.origin,
        price: testAntiqueItem.price.toString(),
        availability_status: testAntiqueItem.availability_status,
        category: testAntiqueItem.category,
        condition: testAntiqueItem.condition,
        dimensions: testAntiqueItem.dimensions,
        material: testAntiqueItem.material,
        main_image_url: testAntiqueItem.main_image_url
      })
      .returning()
      .execute();

    const createdItem = createResult[0];

    // Delete the item
    const result = await deleteAntiqueItem(createdItem.id);

    expect(result).toBe(true);

    // Verify the item is actually deleted
    const remainingItems = await db.select()
      .from(antiqueItemsTable)
      .where(eq(antiqueItemsTable.id, createdItem.id))
      .execute();

    expect(remainingItems).toHaveLength(0);
  });

  it('should return false when trying to delete non-existent item', async () => {
    const nonExistentId = 99999;

    const result = await deleteAntiqueItem(nonExistentId);

    expect(result).toBe(false);
  });

  it('should not affect other items when deleting one item', async () => {
    // Create two test items
    const item1Result = await db.insert(antiqueItemsTable)
      .values({
        name: 'Item 1',
        description: 'First test item',
        year: 1900,
        origin: 'France',
        price: '100.00',
        availability_status: 'available',
        category: 'Furniture',
        condition: 'good',
        dimensions: null,
        material: null,
        main_image_url: null
      })
      .returning()
      .execute();

    const item2Result = await db.insert(antiqueItemsTable)
      .values({
        name: 'Item 2',
        description: 'Second test item',
        year: 1920,
        origin: 'Italy',
        price: '200.00',
        availability_status: 'available',
        category: 'Decorative',
        condition: 'very_good',
        dimensions: null,
        material: null,
        main_image_url: null
      })
      .returning()
      .execute();

    const item1 = item1Result[0];
    const item2 = item2Result[0];

    // Delete only the first item
    const result = await deleteAntiqueItem(item1.id);

    expect(result).toBe(true);

    // Verify first item is deleted
    const deletedItems = await db.select()
      .from(antiqueItemsTable)
      .where(eq(antiqueItemsTable.id, item1.id))
      .execute();

    expect(deletedItems).toHaveLength(0);

    // Verify second item still exists
    const remainingItems = await db.select()
      .from(antiqueItemsTable)
      .where(eq(antiqueItemsTable.id, item2.id))
      .execute();

    expect(remainingItems).toHaveLength(1);
    expect(remainingItems[0].name).toEqual('Item 2');
  });
});
