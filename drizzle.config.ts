// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';
import { env } from 'node:process';

export default defineConfig({
    schema: './src/lib/server/db/schema.ts', // Where your tables are
    out: './drizzle',                       // Where migrations will be saved
    dialect: 'postgresql',                  // You are using the 'pg' library
    dbCredentials: {
        url: env.DATABASE_URL || '',        // Reads from your .env file
    },
});