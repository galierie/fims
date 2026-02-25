import { drizzle as neonDrizzle } from 'drizzle-orm/neon-http';
import { drizzle as localDrizzle } from 'drizzle-orm/node-postgres';
import { neon } from '@neondatabase/serverless';
import { Pool } from 'pg';
import { sql } from 'drizzle-orm';

import { DATABASE_URL, MODE } from '$env/static/private';

import * as schema from './schema';

// for local/dev database, use
// postgresql://(user):(password)@localhost:(port)/(whatever you name the local database)
// within .env file under DATABASE
// also switch MODE to schema
// you can get the port using psql and doing \conninfo

// there has to be a cleaner way to do this
export const db =
    MODE === 'NEON'
        ? neonDrizzle(neon(DATABASE_URL), { schema })
        : MODE === 'LOCAL'
          ? localDrizzle(
                new Pool({
                    connectionString: DATABASE_URL,
                }),
                { schema },
            )
          : (() => {
                throw new Error('INVALID MODE');
            })();

await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);
