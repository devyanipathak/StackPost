import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// This file initializes the Drizzle ORM client instance.
// We use the 'node-postgres' driver (via the 'pg' package) for PostgreSQL interaction.

// 1. Ensure the DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  // We use a robust error message here as this is a critical dependency
  throw new Error('DATABASE_URL is not set in environment variables. Please check your .env file.');
}

// 2. Create a connection pool using the pg library
// We use a Pool to manage multiple connections efficiently.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 3. Initialize the Drizzle ORM client
// We pass the schema object to enable relational queries and type inference.
export const db = drizzle(pool, { schema });

// Optional: Export the pool for direct access or potential use in migrations script
export { pool };
