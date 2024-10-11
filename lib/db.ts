import 'server-only';

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import {
  pgTable,
  text,
  numeric,
  integer,
  timestamp,
  pgEnum,
  serial
} from 'drizzle-orm/pg-core';
import { count, eq, ilike } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';

export const db = drizzle(neon(process.env.POSTGRES_URL!));

export const statusEnum = pgEnum('status', ['active', 'inactive', 'archived']);

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  imageUrl: text('image_url').notNull(),
  name: text('name').notNull(),
  status: statusEnum('status').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  stock: integer('stock').notNull(),
  availableAt: timestamp('available_at').notNull()
});

// export type SelectProduct = typeof products.$inferSelect;
// export const insertProductSchema = createInsertSchema(products);

// export async function getProducts(
//   search: string,
//   offset: number
// ): Promise<{
//   products: SelectProduct[];
//   newOffset: number | null;
//   totalProducts: number;
// }> {
//   // Always search the full table, not per page
//   if (search) {
//     return {
//       products: await db
//         .select()
//         .from(products)
//         .where(ilike(products.name, `%${search}%`))
//         .limit(1000),
//       newOffset: null,
//       totalProducts: 0
//     };
//   }

//   if (offset === null) {
//     return { products: [], newOffset: null, totalProducts: 0 };
//   }

//   let totalProducts = await db.select({ count: count() }).from(products);
//   let moreProducts = await db.select().from(products).limit(5).offset(offset);
//   let newOffset = moreProducts.length >= 5 ? offset + 5 : null;

//   return {
//     products: moreProducts,
//     newOffset,
//     totalProducts: totalProducts[0].count
//   };
// }

// export async function deleteProductById(id: number) {
//   await db.delete(products).where(eq(products.id, id));
// }


// Define the transcripts table
export const transcripts = pgTable('transcripts', {
  id: serial('id').primaryKey(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  duration: text('duration').notNull(),
  // callers: text('callers').nullable(),
  transcript: text('transcript').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Create an insert schema for transcripts
export const insertTranscriptSchema = createInsertSchema(transcripts);

// Type for selecting transcripts
export type SelectTranscript = typeof transcripts.$inferSelect;


// Function to get transcripts from the database
export async function getTranscripts(
  search: string,
  offset: number
): Promise<{
  transcripts: SelectTranscript[];
  newOffset: number | null;
  totalTranscripts: number;
}> {
  // Search the transcripts table if a search term is provided
  if (search) {
    return {
      transcripts: await db
        .select()
        .from(transcripts)
        .where(ilike(transcripts.transcript, `%${search}%`))
        .limit(1000),
      newOffset: null,
      totalTranscripts: 0
    };
  }

  // Return an empty array if the offset is null
  if (offset === null) {
    return { transcripts: [], newOffset: null, totalTranscripts: 0 };
  }

  // Count the total number of transcripts in the database
  let totalTranscripts = await db.select({ count: count() }).from(transcripts);
  
  // Fetch transcripts with pagination
  let moreTranscripts = await db
    .select()
    .from(transcripts)
    .limit(5)
    .offset(offset);
  let newOffset = moreTranscripts.length >= 5 ? offset + 5 : null;

  return {
    transcripts: moreTranscripts,
    newOffset,
    totalTranscripts: totalTranscripts[0].count
  };
}

// Function to insert a transcript into the database
export async function insertTranscript(transcriptData: {
  startTime: string;
  endTime: string;
  duration: string;
  callers?: string | null;
  transcript: string;
}) {
  await db.insert(transcripts).values({
    startTime: new Date(transcriptData.startTime),
    endTime: new Date(transcriptData.endTime),
    duration: transcriptData.duration,
    callers: transcriptData.callers ?? null,
    transcript: transcriptData.transcript
  });
}

// import 'server-only';

// import { neon } from '@neondatabase/serverless';
// import { drizzle } from 'drizzle-orm/neon-http';
// import {
//   pgTable,
//   text,
//   numeric,
//   integer,
//   timestamp,
//   pgEnum,
//   serial
// } from 'drizzle-orm/pg-core';
// import { count, eq, ilike } from 'drizzle-orm';
// import { createInsertSchema } from 'drizzle-zod';

// export const db = drizzle(neon(process.env.POSTGRES_URL!));

// export const statusEnum = pgEnum('status', ['active', 'inactive', 'archived']);

// export const products = pgTable('products', {
//   id: serial('id').primaryKey(),
//   imageUrl: text('image_url').notNull(),
//   name: text('name').notNull(),
//   status: statusEnum('status').notNull(),
//   price: numeric('price', { precision: 10, scale: 2 }).notNull(),
//   stock: integer('stock').notNull(),
//   availableAt: timestamp('available_at').notNull()
// });

// export type SelectProduct = typeof products.$inferSelect;
// export const insertProductSchema = createInsertSchema(products);

// export async function getProducts(
//   search: string,
//   offset: number
// ): Promise<{
//   products: SelectProduct[];
//   newOffset: number | null;
//   totalProducts: number;
// }> {
//   // Always search the full table, not per page
//   if (search) {
//     return {
//       products: await db
//         .select()
//         .from(products)
//         .where(ilike(products.name, `%${search}%`))
//         .limit(1000),
//       newOffset: null,
//       totalProducts: 0
//     };
//   }

//   if (offset === null) {
//     return { products: [], newOffset: null, totalProducts: 0 };
//   }

//   let totalProducts = await db.select({ count: count() }).from(products);
//   let moreProducts = await db.select().from(products).limit(5).offset(offset);
//   let newOffset = moreProducts.length >= 5 ? offset + 5 : null;

//   return {
//     products: moreProducts,
//     newOffset,
//     totalProducts: totalProducts[0].count
//   };
// }

// export async function deleteProductById(id: number) {
//   await db.delete(products).where(eq(products.id, id));
// }
