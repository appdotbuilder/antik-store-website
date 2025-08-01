
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { storeSettingsTable } from '../db/schema';
import { type UpdateStoreSettingsInput } from '../schema';
import { updateStoreSettings } from '../handlers/update_store_settings';
import { eq } from 'drizzle-orm';

describe('updateStoreSettings', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create new settings when none exist', async () => {
    const input: UpdateStoreSettingsInput = {
      store_name: 'My Antique Shop',
      store_description: 'A wonderful antique shop',
      contact_email: 'contact@myshop.com',
      contact_phone: '+1-555-0123',
      address: '123 Main St, City, State 12345'
    };

    const result = await updateStoreSettings(input);

    expect(result.id).toBeDefined();
    expect(result.store_name).toEqual('My Antique Shop');
    expect(result.store_description).toEqual('A wonderful antique shop');
    expect(result.contact_email).toEqual('contact@myshop.com');
    expect(result.contact_phone).toEqual('+1-555-0123');
    expect(result.address).toEqual('123 Main St, City, State 12345');
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create settings with defaults when minimal input provided', async () => {
    const input: UpdateStoreSettingsInput = {};

    const result = await updateStoreSettings(input);

    expect(result.store_name).toEqual('Antique Store');
    expect(result.contact_email).toEqual('info@antiquestore.com');
    expect(result.store_description).toBeNull();
    expect(result.contact_phone).toBeNull();
  });

  it('should update existing settings', async () => {
    // Create initial settings
    await db.insert(storeSettingsTable)
      .values({
        store_name: 'Old Store Name',
        contact_email: 'old@email.com',
        store_description: 'Old description'
      })
      .execute();

    const input: UpdateStoreSettingsInput = {
      store_name: 'Updated Store Name',
      contact_email: 'new@email.com',
      business_hours: 'Mon-Fri 9am-5pm'
    };

    const result = await updateStoreSettings(input);

    expect(result.store_name).toEqual('Updated Store Name');
    expect(result.contact_email).toEqual('new@email.com');
    expect(result.business_hours).toEqual('Mon-Fri 9am-5pm');
    expect(result.store_description).toEqual('Old description'); // Should keep existing value
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update only provided fields', async () => {
    // Create initial settings
    await db.insert(storeSettingsTable)
      .values({
        store_name: 'Original Name',
        contact_email: 'original@email.com',
        store_description: 'Original description',
        contact_phone: '+1-555-0000'
      })
      .execute();

    const input: UpdateStoreSettingsInput = {
      store_name: 'Updated Name Only'
    };

    const result = await updateStoreSettings(input);

    expect(result.store_name).toEqual('Updated Name Only');
    expect(result.contact_email).toEqual('original@email.com'); // Unchanged
    expect(result.store_description).toEqual('Original description'); // Unchanged
    expect(result.contact_phone).toEqual('+1-555-0000'); // Unchanged
  });

  it('should save settings to database', async () => {
    const input: UpdateStoreSettingsInput = {
      store_name: 'Test Store',
      contact_email: 'test@store.com',
      social_facebook: 'https://facebook.com/teststore',
      social_instagram: 'https://instagram.com/teststore'
    };

    const result = await updateStoreSettings(input);

    const settings = await db.select()
      .from(storeSettingsTable)
      .where(eq(storeSettingsTable.id, result.id))
      .execute();

    expect(settings).toHaveLength(1);
    expect(settings[0].store_name).toEqual('Test Store');
    expect(settings[0].contact_email).toEqual('test@store.com');
    expect(settings[0].social_facebook).toEqual('https://facebook.com/teststore');
    expect(settings[0].social_instagram).toEqual('https://instagram.com/teststore');
  });

  it('should handle null values correctly', async () => {
    const input: UpdateStoreSettingsInput = {
      store_name: 'Store with Nulls',
      contact_email: 'contact@store.com',
      store_description: null,
      contact_phone: null,
      address: null
    };

    const result = await updateStoreSettings(input);

    expect(result.store_name).toEqual('Store with Nulls');
    expect(result.contact_email).toEqual('contact@store.com');
    expect(result.store_description).toBeNull();
    expect(result.contact_phone).toBeNull();
    expect(result.address).toBeNull();
  });

  it('should maintain single settings record', async () => {
    // Create first settings
    await updateStoreSettings({ store_name: 'First Store' });

    // Update settings
    await updateStoreSettings({ store_name: 'Second Store' });

    // Check that only one record exists
    const allSettings = await db.select()
      .from(storeSettingsTable)
      .execute();

    expect(allSettings).toHaveLength(1);
    expect(allSettings[0].store_name).toEqual('Second Store');
  });
});
