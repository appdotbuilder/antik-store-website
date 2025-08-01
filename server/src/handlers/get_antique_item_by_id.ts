
import { db } from '../db';
import { antiqueItemsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type AntiqueItem } from '../schema';

export const getAntiqueItemById = async (id: number): Promise<AntiqueItem | null> => {
  try {
    const result = await db.select()
      .from(antiqueItemsTable)
      .where(eq(antiqueItemsTable.id, id))
      .execute();

    if (result.length === 0) {
      return null;
    }

    const item = result[0];
    return {
      ...item,
      price: parseFloat(item.price) // Convert string back to number
    };
  } catch (error) {
    console.error('Failed to get antique item by id:', error);
    throw error;
  }
};
