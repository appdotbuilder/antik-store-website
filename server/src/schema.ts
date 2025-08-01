
import { z } from 'zod';

// Antique Item schema
export const antiqueItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  year: z.number().int().nullable(),
  origin: z.string().nullable(),
  price: z.number(),
  availability_status: z.enum(['available', 'sold', 'reserved']),
  category: z.string(),
  condition: z.enum(['excellent', 'very_good', 'good', 'fair', 'needs_restoration']),
  dimensions: z.string().nullable(),
  material: z.string().nullable(),
  main_image_url: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type AntiqueItem = z.infer<typeof antiqueItemSchema>;

// Create antique item input schema
export const createAntiqueItemInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  year: z.number().int().nullable(),
  origin: z.string().nullable(),
  price: z.number().positive("Price must be positive"),
  availability_status: z.enum(['available', 'sold', 'reserved']).default('available'),
  category: z.string().min(1, "Category is required"),
  condition: z.enum(['excellent', 'very_good', 'good', 'fair', 'needs_restoration']),
  dimensions: z.string().nullable(),
  material: z.string().nullable(),
  main_image_url: z.string().url().nullable()
});

export type CreateAntiqueItemInput = z.infer<typeof createAntiqueItemInputSchema>;

// Update antique item input schema
export const updateAntiqueItemInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  year: z.number().int().nullable().optional(),
  origin: z.string().nullable().optional(),
  price: z.number().positive().optional(),
  availability_status: z.enum(['available', 'sold', 'reserved']).optional(),
  category: z.string().min(1).optional(),
  condition: z.enum(['excellent', 'very_good', 'good', 'fair', 'needs_restoration']).optional(),
  dimensions: z.string().nullable().optional(),
  material: z.string().nullable().optional(),
  main_image_url: z.string().url().nullable().optional()
});

export type UpdateAntiqueItemInput = z.infer<typeof updateAntiqueItemInputSchema>;

// Gallery Image schema
export const galleryImageSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  image_url: z.string(),
  alt_text: z.string().nullable(),
  display_order: z.number().int(),
  is_featured: z.boolean(),
  created_at: z.coerce.date()
});

export type GalleryImage = z.infer<typeof galleryImageSchema>;

// Create gallery image input schema
export const createGalleryImageInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable(),
  image_url: z.string().url("Must be a valid URL"),
  alt_text: z.string().nullable(),
  display_order: z.number().int().nonnegative().default(0),
  is_featured: z.boolean().default(false)
});

export type CreateGalleryImageInput = z.infer<typeof createGalleryImageInputSchema>;

// Page Content schema for CMS
export const pageContentSchema = z.object({
  id: z.number(),
  page_slug: z.string(),
  title: z.string(),
  content: z.string(),
  meta_description: z.string().nullable(),
  is_published: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type PageContent = z.infer<typeof pageContentSchema>;

// Create page content input schema
export const createPageContentInputSchema = z.object({
  page_slug: z.string().min(1, "Page slug is required"),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  meta_description: z.string().nullable(),
  is_published: z.boolean().default(true)
});

export type CreatePageContentInput = z.infer<typeof createPageContentInputSchema>;

// Update page content input schema
export const updatePageContentInputSchema = z.object({
  id: z.number(),
  page_slug: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  meta_description: z.string().nullable().optional(),
  is_published: z.boolean().optional()
});

export type UpdatePageContentInput = z.infer<typeof updatePageContentInputSchema>;

// Contact Form schema
export const contactFormSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  subject: z.string(),
  message: z.string(),
  is_read: z.boolean(),
  created_at: z.coerce.date()
});

export type ContactForm = z.infer<typeof contactFormSchema>;

// Create contact form input schema
export const createContactFormInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Must be a valid email"),
  phone: z.string().nullable(),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required")
});

export type CreateContactFormInput = z.infer<typeof createContactFormInputSchema>;

// Store Settings schema for general site configuration
export const storeSettingsSchema = z.object({
  id: z.number(),
  store_name: z.string(),
  store_description: z.string().nullable(),
  contact_email: z.string(),
  contact_phone: z.string().nullable(),
  address: z.string().nullable(),
  business_hours: z.string().nullable(),
  google_maps_embed_url: z.string().nullable(),
  social_facebook: z.string().nullable(),
  social_instagram: z.string().nullable(),
  social_twitter: z.string().nullable(),
  updated_at: z.coerce.date()
});

export type StoreSettings = z.infer<typeof storeSettingsSchema>;

// Update store settings input schema
export const updateStoreSettingsInputSchema = z.object({
  store_name: z.string().min(1).optional(),
  store_description: z.string().nullable().optional(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  business_hours: z.string().nullable().optional(),
  google_maps_embed_url: z.string().url().nullable().optional(),
  social_facebook: z.string().url().nullable().optional(),
  social_instagram: z.string().url().nullable().optional(),
  social_twitter: z.string().url().nullable().optional()
});

export type UpdateStoreSettingsInput = z.infer<typeof updateStoreSettingsInputSchema>;

// Query parameter schemas
export const getAntiqueItemByIdSchema = z.object({
  id: z.number()
});

export const getPageContentBySlugSchema = z.object({
  slug: z.string()
});

export const deleteAntiqueItemSchema = z.object({
  id: z.number()
});

export const deleteGalleryImageSchema = z.object({
  id: z.number()
});

export const deletePageContentSchema = z.object({
  id: z.number()
});
