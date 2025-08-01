
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { storeSettingsTable } from '../db/schema';
import { getStoreSettings } from '../handlers/get_store_settings';

describe('getStoreSettings', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return null when no settings exist', async () => {
    const result = await getStoreSettings();
    expect(result).toBeNull();
  });

  it('should return store settings when they exist', async () => {
    // Create test store settings
    const testSettings = {
      store_name: 'Antique Treasures',
      store_description: 'Fine antiques and collectibles',
      contact_email: 'contact@antiquetreasures.com',
      contact_phone: '+1-555-0123',
      address: '123 Main St, Antique City, AC 12345',
      business_hours: 'Mon-Fri 9AM-6PM, Sat 10AM-4PM',
      google_maps_embed_url: 'https://maps.google.com/embed?q=123+Main+St',
      social_facebook: 'https://facebook.com/antiquetreasures',
      social_instagram: 'https://instagram.com/antiquetreasures',
      social_twitter: 'https://twitter.com/antiquetreasures'
    };

    await db.insert(storeSettingsTable)
      .values(testSettings)
      .execute();

    const result = await getStoreSettings();

    expect(result).not.toBeNull();
    expect(result!.store_name).toEqual('Antique Treasures');
    expect(result!.store_description).toEqual('Fine antiques and collectibles');
    expect(result!.contact_email).toEqual('contact@antiquetreasures.com');
    expect(result!.contact_phone).toEqual('+1-555-0123');
    expect(result!.address).toEqual('123 Main St, Antique City, AC 12345');
    expect(result!.business_hours).toEqual('Mon-Fri 9AM-6PM, Sat 10AM-4PM');
    expect(result!.google_maps_embed_url).toEqual('https://maps.google.com/embed?q=123+Main+St');
    expect(result!.social_facebook).toEqual('https://facebook.com/antiquetreasures');
    expect(result!.social_instagram).toEqual('https://instagram.com/antiquetreasures');
    expect(result!.social_twitter).toEqual('https://twitter.com/antiquetreasures');
    expect(result!.id).toBeDefined();
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return only first record when multiple exist', async () => {
    // Create two settings records
    await db.insert(storeSettingsTable)
      .values({
        store_name: 'First Store',
        contact_email: 'first@example.com'
      })
      .execute();

    await db.insert(storeSettingsTable)
      .values({
        store_name: 'Second Store',
        contact_email: 'second@example.com'
      })
      .execute();

    const result = await getStoreSettings();

    expect(result).not.toBeNull();
    expect(result!.store_name).toEqual('First Store');
    expect(result!.contact_email).toEqual('first@example.com');
  });

  it('should handle nullable fields correctly', async () => {
    // Create settings with only required fields
    await db.insert(storeSettingsTable)
      .values({
        store_name: 'Minimal Store',
        contact_email: 'minimal@example.com'
      })
      .execute();

    const result = await getStoreSettings();

    expect(result).not.toBeNull();
    expect(result!.store_name).toEqual('Minimal Store');
    expect(result!.contact_email).toEqual('minimal@example.com');
    expect(result!.store_description).toBeNull();
    expect(result!.contact_phone).toBeNull();
    expect(result!.address).toBeNull();
    expect(result!.business_hours).toBeNull();
    expect(result!.google_maps_embed_url).toBeNull();
    expect(result!.social_facebook).toBeNull();
    expect(result!.social_instagram).toBeNull();
    expect(result!.social_twitter).toBeNull();
  });
});
