
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import {
  createAntiqueItemInputSchema,
  updateAntiqueItemInputSchema,
  getAntiqueItemByIdSchema,
  deleteAntiqueItemSchema,
  createGalleryImageInputSchema,
  deleteGalleryImageSchema,
  createPageContentInputSchema,
  updatePageContentInputSchema,
  getPageContentBySlugSchema,
  deletePageContentSchema,
  createContactFormInputSchema,
  updateStoreSettingsInputSchema
} from './schema';

// Import handlers
import { createAntiqueItem } from './handlers/create_antique_item';
import { getAntiqueItems } from './handlers/get_antique_items';
import { getAntiqueItemById } from './handlers/get_antique_item_by_id';
import { updateAntiqueItem } from './handlers/update_antique_item';
import { deleteAntiqueItem } from './handlers/delete_antique_item';
import { createGalleryImage } from './handlers/create_gallery_image';
import { getGalleryImages } from './handlers/get_gallery_images';
import { getFeaturedGalleryImages } from './handlers/get_featured_gallery_images';
import { deleteGalleryImage } from './handlers/delete_gallery_image';
import { createPageContent } from './handlers/create_page_content';
import { getPageContentBySlug } from './handlers/get_page_content_by_slug';
import { getAllPageContent } from './handlers/get_all_page_content';
import { updatePageContent } from './handlers/update_page_content';
import { deletePageContent } from './handlers/delete_page_content';
import { createContactForm } from './handlers/create_contact_form';
import { getContactForms } from './handlers/get_contact_forms';
import { markContactFormRead } from './handlers/mark_contact_form_read';
import { getStoreSettings } from './handlers/get_store_settings';
import { updateStoreSettings } from './handlers/update_store_settings';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Antique Items routes
  createAntiqueItem: publicProcedure
    .input(createAntiqueItemInputSchema)
    .mutation(({ input }) => createAntiqueItem(input)),
  
  getAntiqueItems: publicProcedure
    .query(() => getAntiqueItems()),
  
  getAntiqueItemById: publicProcedure
    .input(getAntiqueItemByIdSchema)
    .query(({ input }) => getAntiqueItemById(input.id)),
  
  updateAntiqueItem: publicProcedure
    .input(updateAntiqueItemInputSchema)
    .mutation(({ input }) => updateAntiqueItem(input)),
  
  deleteAntiqueItem: publicProcedure
    .input(deleteAntiqueItemSchema)
    .mutation(({ input }) => deleteAntiqueItem(input.id)),

  // Gallery routes
  createGalleryImage: publicProcedure
    .input(createGalleryImageInputSchema)
    .mutation(({ input }) => createGalleryImage(input)),
  
  getGalleryImages: publicProcedure
    .query(() => getGalleryImages()),
  
  getFeaturedGalleryImages: publicProcedure
    .query(() => getFeaturedGalleryImages()),
  
  deleteGalleryImage: publicProcedure
    .input(deleteGalleryImageSchema)
    .mutation(({ input }) => deleteGalleryImage(input.id)),

  // CMS Page Content routes
  createPageContent: publicProcedure
    .input(createPageContentInputSchema)
    .mutation(({ input }) => createPageContent(input)),
  
  getPageContentBySlug: publicProcedure
    .input(getPageContentBySlugSchema)
    .query(({ input }) => getPageContentBySlug(input.slug)),
  
  getAllPageContent: publicProcedure
    .query(() => getAllPageContent()),
  
  updatePageContent: publicProcedure
    .input(updatePageContentInputSchema)
    .mutation(({ input }) => updatePageContent(input)),
  
  deletePageContent: publicProcedure
    .input(deletePageContentSchema)
    .mutation(({ input }) => deletePageContent(input.id)),

  // Contact Form routes
  createContactForm: publicProcedure
    .input(createContactFormInputSchema)
    .mutation(({ input }) => createContactForm(input)),
  
  getContactForms: publicProcedure
    .query(() => getContactForms()),
  
  markContactFormRead: publicProcedure
    .input(getAntiqueItemByIdSchema) // Reusing the same schema since it's just { id: number }
    .mutation(({ input }) => markContactFormRead(input.id)),

  // Store Settings routes
  getStoreSettings: publicProcedure
    .query(() => getStoreSettings()),
  
  updateStoreSettings: publicProcedure
    .input(updateStoreSettingsInputSchema)
    .mutation(({ input }) => updateStoreSettings(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
