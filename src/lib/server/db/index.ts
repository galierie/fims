import { drizzle as neonDrizzle } from 'drizzle-orm/neon-http';
import { drizzle as pgDrizzle } from 'drizzle-orm/node-postgres';
import { error } from '@sveltejs/kit';
import { neon } from '@neondatabase/serverless';
import { Pool as PgPool } from 'pg';

import { DATABASE_URL, MODE } from '$env/static/private';

import * as schema from './schema';

// for local/dev database, use
// postgresql://(user):(password)@localhost:(port)/(whatever you name the local database)
// within .env file under DATABASE
// also switch MODE to schema
// you can get the port using psql and doing \conninfo

function initializeDbClient() {
    switch (MODE) {
        case 'LOCAL': {
            return pgDrizzle(new PgPool({ connectionString: DATABASE_URL }), { schema });
        }
        case 'NEON': {
            return neonDrizzle(neon(DATABASE_URL), { schema });
        }
        default:
            throw error(500, { message: 'Cannot initialize database client.' });
    }
}

export const db = initializeDbClient();
