// db.js
// import 'server-only';

// db.js

const { Pool } = require('pg');

// Create a pool of connections using environment variables for configuration
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL, // Ensure this environment variable is set correctly
});

// Function to execute a query
async function query(text, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result.rows;
  } finally {
    client.release();
  }
}

// Define functions to interact with the transcripts table
async function insertTranscript(transcriptData) {
  const { startTime, endTime, duration, callers, transcript } = transcriptData;
  const queryText = `
    INSERT INTO transcripts (start_time, end_time, duration, callers, transcript, created_at)
    VALUES ($1, $2, $3, $4, $5, NOW())
    RETURNING *;
  `;
  const values = [startTime, endTime, duration, callers, transcript];
  return query(queryText, values);
}

async function getTranscripts(search = '', offset = 0) {
  let queryText = 'SELECT * FROM transcripts WHERE transcript ILIKE $1 LIMIT 5 OFFSET $2';
  const values = [`%${search}%`, offset];
  return query(queryText, values);
}

// Export the functions for use in server.js
module.exports = {
  query,
  insertTranscript,
  getTranscripts,
};



// import { neon } from '@neondatabase/serverless';
// import { drizzle } from 'drizzle-orm/neon-http';
// import {
//   pgTable,
//   text,
//   timestamp,
//   serial
// } from 'drizzle-orm/pg-core';
// import { count, eq, ilike } from 'drizzle-orm';

// export const db = drizzle(neon(process.env.POSTGRES_URL));

// export const transcripts = pgTable('transcripts', {
//   id: serial('id').primaryKey(),
//   startTime: timestamp('start_time').notNull(),
//   endTime: timestamp('end_time').notNull(),
//   duration: text('duration').notNull(),
//   callers: text('callers'),
//   transcript: text('transcript').notNull(),
//   createdAt: timestamp('created_at').defaultNow().notNull()
// });

// export async function insertTranscript(transcriptData) {
//   await db.insert(transcripts).values({
//     startTime: new Date(transcriptData.startTime),
//     endTime: new Date(transcriptData.endTime),
//     duration: transcriptData.duration,
//     callers: transcriptData.callers ?? null,
//     transcript: transcriptData.transcript
//   });
// }

// export async function getTranscripts(search, offset) {
//   if (search) {
//     return {
//       transcripts: await db
//         .select()
//         .from(transcripts)
//         .where(ilike(transcripts.transcript, `%${search}%`))
//         .limit(1000),
//       newOffset: null,
//       totalTranscripts: 0
//     };
//   }

//   if (offset === null) {
//     return { transcripts: [], newOffset: null, totalTranscripts: 0 };
//   }

//   let totalTranscripts = await db.select({ count: count() }).from(transcripts);
//   let moreTranscripts = await db.select().from(transcripts).limit(5).offset(offset);
//   let newOffset = moreTranscripts.length >= 5 ? offset + 5 : null;

//   return {
//     transcripts: moreTranscripts,
//     newOffset,
//     totalTranscripts: totalTranscripts[0].count
//   };
// }
