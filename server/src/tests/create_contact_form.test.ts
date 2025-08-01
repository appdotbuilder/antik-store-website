
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { contactFormsTable } from '../db/schema';
import { type CreateContactFormInput } from '../schema';
import { createContactForm } from '../handlers/create_contact_form';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateContactFormInput = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1-555-0123',
  subject: 'Inquiry about antique vase',
  message: 'I am interested in learning more about the Chinese porcelain vase from the Ming dynasty.'
};

// Test input without optional phone field
const testInputNoPhone: CreateContactFormInput = {
  name: 'Jane Smith',
  email: 'jane.smith@example.com',
  phone: null,
  subject: 'General inquiry',
  message: 'I would like to visit your store. What are your business hours?'
};

describe('createContactForm', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a contact form submission with all fields', async () => {
    const result = await createContactForm(testInput);

    // Validate all fields
    expect(result.name).toEqual('John Doe');
    expect(result.email).toEqual('john.doe@example.com');
    expect(result.phone).toEqual('+1-555-0123');
    expect(result.subject).toEqual('Inquiry about antique vase');
    expect(result.message).toEqual('I am interested in learning more about the Chinese porcelain vase from the Ming dynasty.');
    expect(result.is_read).toEqual(false);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should create a contact form submission without phone number', async () => {
    const result = await createContactForm(testInputNoPhone);

    // Validate fields including nullable phone
    expect(result.name).toEqual('Jane Smith');
    expect(result.email).toEqual('jane.smith@example.com');
    expect(result.phone).toBeNull();
    expect(result.subject).toEqual('General inquiry');
    expect(result.message).toEqual('I would like to visit your store. What are your business hours?');
    expect(result.is_read).toEqual(false);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save contact form submission to database', async () => {
    const result = await createContactForm(testInput);

    // Query database to verify persistence
    const submissions = await db.select()
      .from(contactFormsTable)
      .where(eq(contactFormsTable.id, result.id))
      .execute();

    expect(submissions).toHaveLength(1);
    expect(submissions[0].name).toEqual('John Doe');
    expect(submissions[0].email).toEqual('john.doe@example.com');
    expect(submissions[0].phone).toEqual('+1-555-0123');
    expect(submissions[0].subject).toEqual('Inquiry about antique vase');
    expect(submissions[0].message).toEqual(testInput.message);
    expect(submissions[0].is_read).toEqual(false);
    expect(submissions[0].created_at).toBeInstanceOf(Date);
  });

  it('should set default values correctly', async () => {
    const result = await createContactForm(testInput);

    // Verify default values are applied
    expect(result.is_read).toEqual(false);
    expect(result.created_at).toBeInstanceOf(Date);

    // Verify created_at is recent (within last minute)
    const now = new Date();
    const timeDiff = now.getTime() - result.created_at.getTime();
    expect(timeDiff).toBeLessThan(60000); // Less than 1 minute
  });
});
