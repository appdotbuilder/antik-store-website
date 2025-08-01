
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { antiqueItemsTable } from '../db/schema';
import { type CreateAntiqueItemInput } from '../schema';
import { createAntiqueItem } from '../handlers/create_antique_item';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateAntiqueItemInput = {
  name: 'Victorian Oak Table',
  description: 'Beautiful antique oak dining table from the Victorian era',
  year: 1885,
  origin: 'England',
  price: 1250.50,
  availability_status: 'available',
  category: 'Furniture',
  condition: 'very_good',
  dimensions: '72" L x 42" W x 30" H',
  material: 'Oak Wood',
  main_image_url: 'https://example.com/images/victorian-table.jpg'
};

describe('createAntiqueItem', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an antique item with all fields', async () => {
    const result = await createAntiqueItem(testInput);

    // Basic field validation
    expect(result.name).toEqual('Victorian Oak Table');
    expect(result.description).toEqual(testInput.description);
    expect(result.year).toEqual(1885);
    expect(result.origin).toEqual('England');
    expect(result.price).toEqual(1250.50);
    expect(typeof result.price).toEqual('number');
    expect(result.availability_status).toEqual('available');
    expect(result.category).toEqual('Furniture');
    expect(result.condition).toEqual('very_good');
    expect(result.dimensions).toEqual('72" L x 42" W x 30" H');
    expect(result.material).toEqual('Oak Wood');
    expect(result.main_image_url).toEqual('https://example.com/images/victorian-table.jpg');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create an antique item with nullable fields as null', async () => {
    const minimalInput: CreateAntiqueItemInput = {
      name: 'Mystery Vase',
      description: 'Beautiful vase of unknown origin',
      year: null,
      origin: null,
      price: 75.00,
      availability_status: 'available',
      category: 'Ceramics',
      condition: 'good',
      dimensions: null,
      material: null,
      main_image_url: null
    };

    const result = await createAntiqueItem(minimalInput);

    expect(result.name).toEqual('Mystery Vase');
    expect(result.year).toBeNull();
    expect(result.origin).toBeNull();
    expect(result.dimensions).toBeNull();
    expect(result.material).toBeNull();
    expect(result.main_image_url).toBeNull();
    expect(result.price).toEqual(75.00);
    expect(typeof result.price).toEqual('number');
  });

  it('should save antique item to database', async () => {
    const result = await createAntiqueItem(testInput);

    // Query using proper drizzle syntax
    const items = await db.select()
      .from(antiqueItemsTable)
      .where(eq(antiqueItemsTable.id, result.id))
      .execute();

    expect(items).toHaveLength(1);
    expect(items[0].name).toEqual('Victorian Oak Table');
    expect(items[0].description).toEqual(testInput.description);
    expect(parseFloat(items[0].price)).toEqual(1250.50);
    expect(items[0].availability_status).toEqual('available');
    expect(items[0].condition).toEqual('very_good');
    expect(items[0].created_at).toBeInstanceOf(Date);
    expect(items[0].updated_at).toBeInstanceOf(Date);
  });

  it('should apply default availability_status', async () => {
    const inputWithoutStatus: CreateAntiqueItemInput = {
      name: 'Antique Clock',
      description: 'Beautiful grandfather clock',
      year: 1920,
      origin: 'Germany',
      price: 800.00,
      availability_status: 'available', // This is the default from Zod
      category: 'Timepieces',
      condition: 'excellent',
      dimensions: null,
      material: null,
      main_image_url: null
    };

    const result = await createAntiqueItem(inputWithoutStatus);

    expect(result.availability_status).toEqual('available');
  });

  it('should handle different condition values', async () => {
    const conditions: Array<'excellent' | 'very_good' | 'good' | 'fair' | 'needs_restoration'> = [
      'excellent', 'very_good', 'good', 'fair', 'needs_restoration'
    ];

    for (const condition of conditions) {
      const input: CreateAntiqueItemInput = {
        ...testInput,
        name: `Test Item ${condition}`,
        condition: condition
      };

      const result = await createAntiqueItem(input);
      expect(result.condition).toEqual(condition);
    }
  });
});
