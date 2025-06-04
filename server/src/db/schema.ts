
import { serial, text, pgTable, timestamp } from 'drizzle-orm/pg-core';

export const photosTable = pgTable('photos', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  filename: text('filename').notNull(),
  url: text('url').notNull(),
  thumbnail_url: text('thumbnail_url').notNull(),
  alt_text: text('alt_text'), // Nullable by default
  uploaded_at: timestamp('uploaded_at').defaultNow().notNull(),
});

// TypeScript type for the table schema
export type Photo = typeof photosTable.$inferSelect;
export type NewPhoto = typeof photosTable.$inferInsert;

// Export all tables for relation queries
export const tables = { photos: photosTable };
