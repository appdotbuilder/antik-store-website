
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { contactFormsTable } from '../db/schema';
import { getContactForms } from '../handlers/get_contact_forms';

describe('getContactForms', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no contact forms exist', async () => {
    const result = await getContactForms();
    expect(result).toEqual([]);
  });

  it('should return all contact forms', async () => {
    // Create test contact forms
    await db.insert(contactFormsTable).values([
      {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        subject: 'Inquiry about vase',
        message: 'I am interested in the Ming vase.',
        is_read: false
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: null,
        subject: 'General question',
        message: 'What are your business hours?',
        is_read: true
      }
    ]).execute();

    const result = await getContactForms();

    expect(result).toHaveLength(2);
    expect(result[0].name).toBeDefined();
    expect(result[0].email).toBeDefined();
    expect(result[0].subject).toBeDefined();
    expect(result[0].message).toBeDefined();
    expect(result[0].is_read).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
  });

  it('should return contact forms ordered by created_at desc (newest first)', async () => {
    // Create contact forms with different timestamps
    const firstForm = await db.insert(contactFormsTable).values({
      name: 'First User',
      email: 'first@example.com',
      phone: null,
      subject: 'First submission',
      message: 'This was submitted first.',
      is_read: false
    }).returning().execute();

    // Wait a bit to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const secondForm = await db.insert(contactFormsTable).values({
      name: 'Second User',
      email: 'second@example.com',
      phone: '555-0123',
      subject: 'Second submission',
      message: 'This was submitted second.',
      is_read: false
    }).returning().execute();

    const result = await getContactForms();

    expect(result).toHaveLength(2);
    // Newest should be first (second submission)
    expect(result[0].name).toEqual('Second User');
    expect(result[0].subject).toEqual('Second submission');
    // Oldest should be second (first submission)
    expect(result[1].name).toEqual('First User');
    expect(result[1].subject).toEqual('First submission');
    
    // Verify timestamps are properly ordered
    expect(result[0].created_at >= result[1].created_at).toBe(true);
  });

  it('should handle nullable fields correctly', async () => {
    await db.insert(contactFormsTable).values({
      name: 'Test User',
      email: 'test@example.com',
      phone: null, // Testing nullable field
      subject: 'Test subject',
      message: 'Test message',
      is_read: false
    }).execute();

    const result = await getContactForms();

    expect(result).toHaveLength(1);
    expect(result[0].phone).toBeNull();
    expect(result[0].name).toEqual('Test User');
    expect(result[0].email).toEqual('test@example.com');
  });
});
