
import { db } from '../db';
import { antiqueItemsTable } from '../db/schema';
import { type AntiqueItem } from '../schema';
import { desc } from 'drizzle-orm';

export const getAntiqueItems = async (): Promise<AntiqueItem[]> => {
  try {
    const results = await db.select()
      .from(antiqueItemsTable)
      .orderBy(desc(antiqueItemsTable.created_at))
      .execute();

    // Convert numeric fields back to numbers before returning
    return results.map(item => ({
      ...item,
      price: parseFloat(item.price)
    }));
  } catch (error) {
    console.error('Failed to fetch antique items:', error);
    throw error;
  }
};
