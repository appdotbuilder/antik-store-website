
import { db } from '../db';
import { storeSettingsTable } from '../db/schema';
import { type UpdateStoreSettingsInput, type StoreSettings } from '../schema';
import { eq } from 'drizzle-orm';

export async function updateStoreSettings(input: UpdateStoreSettingsInput): Promise<StoreSettings> {
  try {
    // Check if settings record exists
    const existingSettings = await db.select()
      .from(storeSettingsTable)
      .limit(1)
      .execute();

    if (existingSettings.length === 0) {
      // Create new settings record with required fields
      const result = await db.insert(storeSettingsTable)
        .values({
          store_name: input.store_name || 'Antique Store',
          store_description: input.store_description,
          contact_email: input.contact_email || 'info@antiquestore.com',
          contact_phone: input.contact_phone,
          address: input.address,
          business_hours: input.business_hours,
          google_maps_embed_url: input.google_maps_embed_url,
          social_facebook: input.social_facebook,
          social_instagram: input.social_instagram,
          social_twitter: input.social_twitter
        })
        .returning()
        .execute();

      return result[0];
    } else {
      // Update existing settings record
      const settingsId = existingSettings[0].id;
      
      const result = await db.update(storeSettingsTable)
        .set({
          ...(input.store_name !== undefined && { store_name: input.store_name }),
          ...(input.store_description !== undefined && { store_description: input.store_description }),
          ...(input.contact_email !== undefined && { contact_email: input.contact_email }),
          ...(input.contact_phone !== undefined && { contact_phone: input.contact_phone }),
          ...(input.address !== undefined && { address: input.address }),
          ...(input.business_hours !== undefined && { business_hours: input.business_hours }),
          ...(input.google_maps_embed_url !== undefined && { google_maps_embed_url: input.google_maps_embed_url }),
          ...(input.social_facebook !== undefined && { social_facebook: input.social_facebook }),
          ...(input.social_instagram !== undefined && { social_instagram: input.social_instagram }),
          ...(input.social_twitter !== undefined && { social_twitter: input.social_twitter }),
          updated_at: new Date()
        })
        .where(eq(storeSettingsTable.id, settingsId))
        .returning()
        .execute();

      return result[0];
    }
  } catch (error) {
    console.error('Store settings update failed:', error);
    throw error;
  }
}
