
import { db } from '../db';
import { antiqueItemsTable } from '../db/schema';
import { type UpdateAntiqueItemInput, type AntiqueItem } from '../schema';
import { eq } from 'drizzle-orm';

export const updateAntiqueItem = async (input: UpdateAntiqueItemInput): Promise<AntiqueItem | null> => {
  try {
    // Extract ID and update fields
    const { id, ...updateFields } = input;

    // Check if there are any fields to update
    if (Object.keys(updateFields).length === 0) {
      // No fields to update, just return the existing item
      const existing = await db.select()
        .from(antiqueItemsTable)
        .where(eq(antiqueItemsTable.id, id))
        .execute();

      if (existing.length === 0) {
        return null;
      }

      return {
        ...existing[0],
        price: parseFloat(existing[0].price)
      };
    }

    // Prepare update values with numeric conversion for price
    const updateValues: any = { ...updateFields };
    if (updateFields.price !== undefined) {
      updateValues.price = updateFields.price.toString();
    }

    // Add updated_at timestamp
    updateValues.updated_at = new Date();

    // Update the antique item
    const result = await db.update(antiqueItemsTable)
      .set(updateValues)
      .where(eq(antiqueItemsTable.id, id))
      .returning()
      .execute();

    // Return null if no item was found/updated
    if (result.length === 0) {
      return null;
    }

    // Convert numeric fields back to numbers before returning
    const updatedItem = result[0];
    return {
      ...updatedItem,
      price: parseFloat(updatedItem.price)
    };
  } catch (error) {
    console.error('Antique item update failed:', error);
    throw error;
  }
};
