
import { serial, text, pgTable, timestamp, numeric, integer, boolean, pgEnum } from 'drizzle-orm/pg-core';

// Enums
export const availabilityStatusEnum = pgEnum('availability_status', ['available', 'sold', 'reserved']);
export const conditionEnum = pgEnum('condition', ['excellent', 'very_good', 'good', 'fair', 'needs_restoration']);

// Antique Items table
export const antiqueItemsTable = pgTable('antique_items', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  year: integer('year'), // Nullable - some antiques may have unknown dates
  origin: text('origin'), // Nullable - origin may be unknown
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  availability_status: availabilityStatusEnum('availability_status').notNull().default('available'),
  category: text('category').notNull(),
  condition: conditionEnum('condition').notNull(),
  dimensions: text('dimensions'), // Nullable - dimensions may not always be available
  material: text('material'), // Nullable - material may be unknown
  main_image_url: text('main_image_url'), // Nullable - image may not be uploaded yet
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Gallery Images table
export const galleryImagesTable = pgTable('gallery_images', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'), // Nullable - description is optional
  image_url: text('image_url').notNull(),
  alt_text: text('alt_text'), // Nullable - alt text is optional but recommended
  display_order: integer('display_order').notNull().default(0),
  is_featured: boolean('is_featured').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Page Content table for CMS
export const pageContentTable = pgTable('page_content', {
  id: serial('id').primaryKey(),
  page_slug: text('page_slug').notNull().unique(), // Unique slug for each page
  title: text('title').notNull(),
  content: text('content').notNull(),
  meta_description: text('meta_description'), // Nullable - SEO meta description
  is_published: boolean('is_published').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Contact Form submissions table
export const contactFormsTable = pgTable('contact_forms', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'), // Nullable - phone is optional
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  is_read: boolean('is_read').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Store Settings table for general site configuration
export const storeSettingsTable = pgTable('store_settings', {
  id: serial('id').primaryKey(),
  store_name: text('store_name').notNull(),
  store_description: text('store_description'), // Nullable - optional store description
  contact_email: text('contact_email').notNull(),
  contact_phone: text('contact_phone'), // Nullable - phone is optional
  address: text('address'), // Nullable - physical address is optional
  business_hours: text('business_hours'), // Nullable - business hours info
  google_maps_embed_url: text('google_maps_embed_url'), // Nullable - Google Maps integration
  social_facebook: text('social_facebook'), // Nullable - social media links
  social_instagram: text('social_instagram'), // Nullable
  social_twitter: text('social_twitter'), // Nullable
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// TypeScript types for the table schemas
export type AntiqueItem = typeof antiqueItemsTable.$inferSelect;
export type NewAntiqueItem = typeof antiqueItemsTable.$inferInsert;
export type GalleryImage = typeof galleryImagesTable.$inferSelect;
export type NewGalleryImage = typeof galleryImagesTable.$inferInsert;
export type PageContent = typeof pageContentTable.$inferSelect;
export type NewPageContent = typeof pageContentTable.$inferInsert;
export type ContactForm = typeof contactFormsTable.$inferSelect;
export type NewContactForm = typeof contactFormsTable.$inferInsert;
export type StoreSettings = typeof storeSettingsTable.$inferSelect;
export type NewStoreSettings = typeof storeSettingsTable.$inferInsert;

// Export all tables for relation queries
export const tables = {
  antiqueItems: antiqueItemsTable,
  galleryImages: galleryImagesTable,
  pageContent: pageContentTable,
  contactForms: contactFormsTable,
  storeSettings: storeSettingsTable,
};
