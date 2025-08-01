
import { db } from '../db';
import { antiqueItemsTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function deleteAntiqueItem(id: number): Promise<boolean> {
  try {
    const result = await db.delete(antiqueItemsTable)
      .where(eq(antiqueItemsTable.id, id))
      .execute();

    // Check if any rows were affected (deleted)
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('Delete antique item failed:', error);
    throw error;
  }
}
