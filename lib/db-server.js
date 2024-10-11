// db-server.js
// import { db, transcripts } from './db.ts'; // Import the db and transcripts table from the shared db file

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import {
  pgTable,
  text,
  timestamp,
  serial
} from 'drizzle-orm/pg-core';
import { count, ilike } from 'drizzle-orm';

// // Check for the existence of the environment variable
// if (!process.env.POSTGRES_URL) {
//   throw new Error('POSTGRES_URL environment variable is not set.');
// }

// Set up the database connection
const POSTGRES_URL="postgres://default:rNIxQ8V3KFnB@ep-proud-snowflake-a4h2nmd9-pooler.us-east-1.aws.neon.tech/verceldb?sslmode=require"
export const db = drizzle(neon(POSTGRES_URL));

// Define the transcripts table
export const transcripts = pgTable('transcripts', {
  id: serial('id').primaryKey(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  duration: text('duration').notNull(),
  transcript: text('transcript').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});


// Function to insert a transcript into the database
export async function insertTranscript(transcriptData) {
  await db.insert(transcripts).values({
    startTime: new Date(transcriptData.startTime),
    endTime: new Date(transcriptData.endTime),
    duration: transcriptData.duration,
    callers: transcriptData.callers || null,
    transcript: transcriptData.transcript
  });
}




// const { db, transcripts } = require('./db');

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