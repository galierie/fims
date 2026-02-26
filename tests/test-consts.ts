//for the tests to work with different test accounts
export const ITAcc = "testacc@up.edu.ph";
export const AdminAcc = "testadmin@up.edu.ph";

export const ITPass = "password";
export const AdminPass = "adminpass";


// in the case your sample data is different
export const expectedFacultyName = "Dela Cruz, Juan";


export const expectedStatuses = [
    'Active',
    'On Leave',
    'Sabbatical',
];

export const expectedRankPrefixes = [
    'Instructor',
    'Assistant Professor',
    'Associate Professor',
    'Professor',
];

//specific db instance for the tests.
//uses the same schema though since the schema has no runes.
//remember to clean up entries from this
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from '../src/lib/server/db/schema'

export const testDB = drizzle(neon(process.env.DATABASE_URL!), { schema });