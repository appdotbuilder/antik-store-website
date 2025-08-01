
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { contactFormsTable } from '../db/schema';
import { type CreateContactFormInput } from '../schema';
import { markContactFormRead } from '../handlers/mark_contact_form_read';
import { eq } from 'drizzle-orm';

// Test input for creating a contact form
const testInput: CreateContactFormInput = {
  name: 'John Doe',
  email: 'john@example.com',
  phone: '555-1234',
  subject: 'Inquiry about antique',
  message: 'I am interested in learning more about your Victorian era items.'
};

describe('markContactFormRead', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should mark contact form as read', async () => {
    // Create a contact form first
    const created = await db.insert(contactFormsTable)
      .values({
        name: testInput.name,
        email: testInput.email,
        phone: testInput.phone,
        subject: testInput.subject,
        message: testInput.message,
        is_read: false // Start as unread
      })
      .returning()
      .execute();

    const contactFormId = created[0].id;

    // Mark it as read
    const result = await markContactFormRead(contactFormId);

    // Verify the result
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(contactFormId);
    expect(result!.name).toEqual('John Doe');
    expect(result!.email).toEqual('john@example.com');
    expect(result!.phone).toEqual('555-1234');
    expect(result!.subject).toEqual('Inquiry about antique');
    expect(result!.message).toEqual(testInput.message);
    expect(result!.is_read).toBe(true);
    expect(result!.created_at).toBeInstanceOf(Date);
  });

  it('should update contact form in database', async () => {
    // Create a contact form first
    const created = await db.insert(contactFormsTable)
      .values({
        name: testInput.name,
        email: testInput.email,
        phone: testInput.phone,
        subject: testInput.subject,
        message: testInput.message,
        is_read: false
      })
      .returning()
      .execute();

    const contactFormId = created[0].id;

    // Mark it as read
    await markContactFormRead(contactFormId);

    // Query the database to verify the update
    const forms = await db.select()
      .from(contactFormsTable)
      .where(eq(contactFormsTable.id, contactFormId))
      .execute();

    expect(forms).toHaveLength(1);
    expect(forms[0].is_read).toBe(true);
    expect(forms[0].name).toEqual('John Doe');
    expect(forms[0].email).toEqual('john@example.com');
  });

  it('should return null for non-existent contact form', async () => {
    const result = await markContactFormRead(999);

    expect(result).toBeNull();
  });

  it('should handle already read contact form', async () => {
    // Create a contact form that's already read
    const created = await db.insert(contactFormsTable)
      .values({
        name: testInput.name,
        email: testInput.email,
        phone: testInput.phone,
        subject: testInput.subject,
        message: testInput.message,
        is_read: true // Already read
      })
      .returning()
      .execute();

    const contactFormId = created[0].id;

    // Mark it as read again
    const result = await markContactFormRead(contactFormId);

    // Should still work and return the form
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(contactFormId);
    expect(result!.is_read).toBe(true);
  });
});
