import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Export the configuration object
export default defineConfig({
  // MANDATORY: Specifies the database type for Drizzle Kit's internal logic.
  dialect: 'postgresql',
  
  // The 'schema' path points to your table definitions.
  schema: './src/db/schema.ts',

  // The output directory for migration files.
  out: './drizzle',

  // FIX: For the 'push' command to work with long connection strings, 
  // we must provide the URL directly as the 'url' property, NOT inside 
  // the dbCredentials object (which expects host/port/database).
  url: process.env.DATABASE_URL!, 
  
  // We can remove the entire dbCredentials block now that we are using 'url'.
  
  // Optional settings
  // strict: true, 
  // verbose: true,
});