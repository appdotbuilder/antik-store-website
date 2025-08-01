
import { db } from '../db';
import { contactFormsTable } from '../db/schema';
import { type ContactForm } from '../schema';
import { eq } from 'drizzle-orm';

export async function markContactFormRead(id: number): Promise<ContactForm | null> {
  try {
    // Update the contact form to mark as read
    const result = await db.update(contactFormsTable)
      .set({
        is_read: true
      })
      .where(eq(contactFormsTable.id, id))
      .returning()
      .execute();

    // Return the updated contact form or null if not found
    if (result.length === 0) {
      return null;
    }

    return result[0];
  } catch (error) {
    console.error('Mark contact form read failed:', error);
    throw error;
  }
}
