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
// // import { count, eq, ilike } from 'drizzle-orm';
// // import { createInsertSchema } from 'drizzle-zod';

// // export const db = drizzle(neon(process.env.POSTGRES_URL!));
// export const db = drizzle(neon(process.env.POSTGRES_URL!));

// export const statusEnum = pgEnum('status', ['active', 'inactive', 'archived']);


// // Define the transcripts table
// export const transcripts = pgTable('transcripts', {
//   id: serial('id').primaryKey(),
//   startTime: timestamp('start_time').notNull(),
//   endTime: timestamp('end_time').notNull(),
//   duration: text('duration').notNull(),
//   // callers: text('callers').nullable(),
//   transcript: text('transcript').notNull(),
//   createdAt: timestamp('created_at').defaultNow().notNull()
// });

// // Function to insert a transcript into the database
// export async function insertTranscript(transcriptData: {
//   startTime: string;
//   endTime: string;
//   duration: string;
//   callers?: string | null;
//   transcript: string;
// }) {
//   await db.insert(transcripts).values({
//     startTime: new Date(transcriptData.startTime),
//     endTime: new Date(transcriptData.endTime),
//     duration: transcriptData.duration,
//     callers: transcriptData.callers ?? null,
//     transcript: transcriptData.transcript
//   });
// }
