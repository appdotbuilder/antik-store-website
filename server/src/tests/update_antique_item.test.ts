
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { antiqueItemsTable } from '../db/schema';
import { type CreateAntiqueItemInput, type UpdateAntiqueItemInput } from '../schema';
import { updateAntiqueItem } from '../handlers/update_antique_item';
import { eq } from 'drizzle-orm';

// Test input for creating an antique item
const testCreateInput: CreateAntiqueItemInput = {
  name: 'Victorian Chair',
  description: 'Beautiful antique Victorian chair',
  year: 1850,
  origin: 'England',
  price: 299.99,
  availability_status: 'available',
  category: 'Furniture',
  condition: 'very_good',
  dimensions: '32" H x 18" W x 16" D',
  material: 'Mahogany',
  main_image_url: 'https://example.com/chair.jpg'
};

describe('updateAntiqueItem', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update an existing antique item', async () => {
    // Create initial item
    const [created] = await db.insert(antiqueItemsTable)
      .values({
        ...testCreateInput,
        price: testCreateInput.price.toString()
      })
      .returning()
      .execute();

    // Update the item
    const updateInput: UpdateAntiqueItemInput = {
      id: created.id,
      name: 'Updated Victorian Chair',
      price: 350.00,
      condition: 'excellent'
    };

    const result = await updateAntiqueItem(updateInput);

    // Verify update was successful
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(created.id);
    expect(result!.name).toEqual('Updated Victorian Chair');
    expect(result!.price).toEqual(350.00);
    expect(result!.condition).toEqual('excellent');
    expect(result!.description).toEqual(testCreateInput.description); // Unchanged field
    expect(result!.updated_at).toBeInstanceOf(Date);
    expect(result!.updated_at > created.updated_at).toBe(true);
  });

  it('should save updated item to database', async () => {
    // Create initial item
    const [created] = await db.insert(antiqueItemsTable)
      .values({
        ...testCreateInput,
        price: testCreateInput.price.toString()
      })
      .returning()
      .execute();

    // Update the item
    const updateInput: UpdateAntiqueItemInput = {
      id: created.id,
      price: 400.50,
      availability_status: 'sold'
    };

    await updateAntiqueItem(updateInput);

    // Verify in database
    const dbItems = await db.select()
      .from(antiqueItemsTable)
      .where(eq(antiqueItemsTable.id, created.id))
      .execute();

    expect(dbItems).toHaveLength(1);
    expect(parseFloat(dbItems[0].price)).toEqual(400.50);
    expect(dbItems[0].availability_status).toEqual('sold');
    expect(dbItems[0].name).toEqual(testCreateInput.name); // Unchanged field
  });

  it('should return null for non-existent item', async () => {
    const updateInput: UpdateAntiqueItemInput = {
      id: 999,
      name: 'Non-existent Item'
    };

    const result = await updateAntiqueItem(updateInput);

    expect(result).toBeNull();
  });

  it('should handle partial updates with nullable fields', async () => {
    // Create initial item
    const [created] = await db.insert(antiqueItemsTable)
      .values({
        ...testCreateInput,
        price: testCreateInput.price.toString()
      })
      .returning()
      .execute();

    // Update with nullable fields
    const updateInput: UpdateAntiqueItemInput = {
      id: created.id,
      year: null,
      origin: null,
      dimensions: null
    };

    const result = await updateAntiqueItem(updateInput);

    expect(result).not.toBeNull();
    expect(result!.year).toBeNull();
    expect(result!.origin).toBeNull();
    expect(result!.dimensions).toBeNull();
    expect(result!.name).toEqual(testCreateInput.name); // Unchanged field
  });

  it('should return existing item when no update fields provided', async () => {
    // Create initial item
    const [created] = await db.insert(antiqueItemsTable)
      .values({
        ...testCreateInput,
        price: testCreateInput.price.toString()
      })
      .returning()
      .execute();

    // Update with only ID (no update fields)
    const updateInput: UpdateAntiqueItemInput = {
      id: created.id
    };

    const result = await updateAntiqueItem(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(created.id);
    expect(result!.name).toEqual(testCreateInput.name);
    expect(result!.price).toEqual(testCreateInput.price);
    expect(typeof result!.price).toBe('number');
  });

  it('should handle numeric price conversion correctly', async () => {
    // Create initial item
    const [created] = await db.insert(antiqueItemsTable)
      .values({
        ...testCreateInput,
        price: testCreateInput.price.toString()
      })
      .returning()
      .execute();

    // Update with new price
    const updateInput: UpdateAntiqueItemInput = {
      id: created.id,
      price: 125.75
    };

    const result = await updateAntiqueItem(updateInput);

    expect(result).not.toBeNull();
    expect(result!.price).toEqual(125.75);
    expect(typeof result!.price).toBe('number');

    // Verify in database (stored as string)
    const dbItems = await db.select()
      .from(antiqueItemsTable)
      .where(eq(antiqueItemsTable.id, created.id))
      .execute();

    expect(parseFloat(dbItems[0].price)).toEqual(125.75);
  });
});
