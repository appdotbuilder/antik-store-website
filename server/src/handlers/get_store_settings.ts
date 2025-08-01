
import { db } from '../db';
import { storeSettingsTable } from '../db/schema';
import { type StoreSettings } from '../schema';

export const getStoreSettings = async (): Promise<StoreSettings | null> => {
  try {
    // Get the first (and only) store settings record
    const result = await db.select()
      .from(storeSettingsTable)
      .limit(1)
      .execute();

    if (result.length === 0) {
      return null;
    }

    const settings = result[0];
    return {
      ...settings,
      // All fields are already in the correct format (text/boolean/timestamp)
      // No numeric conversions needed for this table
    };
  } catch (error) {
    console.error('Store settings retrieval failed:', error);
    throw error;
  }
};
