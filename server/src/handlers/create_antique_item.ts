
import { db } from '../db';
import { antiqueItemsTable } from '../db/schema';
import { type CreateAntiqueItemInput, type AntiqueItem } from '../schema';

export const createAntiqueItem = async (input: CreateAntiqueItemInput): Promise<AntiqueItem> => {
  try {
    // Insert antique item record
    const result = await db.insert(antiqueItemsTable)
      .values({
        name: input.name,
        description: input.description,
        year: input.year,
        origin: input.origin,
        price: input.price.toString(), // Convert number to string for numeric column
        availability_status: input.availability_status,
        category: input.category,
        condition: input.condition,
        dimensions: input.dimensions,
        material: input.material,
        main_image_url: input.main_image_url
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const antiqueItem = result[0];
    return {
      ...antiqueItem,
      price: parseFloat(antiqueItem.price) // Convert string back to number
    };
  } catch (error) {
    console.error('Antique item creation failed:', error);
    throw error;
  }
};
