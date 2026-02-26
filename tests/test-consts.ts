//for the tests to work with different test accounts
export const ITAcc = "it@up.edu.ph";
export const AdminAcc = "admin@up.edu.ph";

export const ITPass = "password";
export const AdminPass = "password";

export const ITConfig = "playwright/.auth/it.json";
export const AdminConfig = "playwright/.auth/admin.json";

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
import dotenv from 'dotenv'
import * as schema from '../src/lib/server/db/schema'
import { and, eq, sql } from 'drizzle-orm';

dotenv.config({path: '.env'});

export const testDB = drizzle(neon(process.env.DATABASE_URL!), { schema });

// seed dummy records
const testData:{
    firstname:string,
    lastname:string,
    middlename:string,
    suffix:string,
    status:string,
}[] = [
    {
        firstname: 'Juan',
        lastname: 'Dela Cruz',
        middlename: 'Middle',
        suffix: 'Mr.',
        status: 'Active',
    },
    {
        firstname: 'Alan',
        lastname: 'Doe',
        middlename: 'John',
        suffix: 'Mr.',
        status: 'On Leave',
    },
    {
        firstname: 'Mel',
        lastname: 'Doe',
        middlename: 'Jane',
        suffix: 'Mrs.',
        status: 'Sabbatical',
    },
]

//warning: this gets checks for records also deleted
export function getData():string[] {
    const res:string[] = []

    for (let rec of testData) {
        res.push(`${rec.lastname}, ${rec.firstname}`);
    }

    return res
}

export async function seed() {
    for (let rec of testData) {
        // do not add duplicates
        // for simplicity's sake, just compare names
        const query = await testDB
            .select()
            .from(schema.faculty)
            .where(and(eq(schema.faculty.lastname, rec.lastname), eq(schema.faculty.firstname, rec.firstname)));
        if (query.length) continue;

        // i have NO idea why this has an error even though this works normally
        // probably a typescript thing
        await testDB
            .insert(schema.faculty)
            .values({
                firstname: rec.firstname,
                middlename: rec.middlename,
                lastname: rec.lastname,
                suffix: rec.suffix,
                status: rec.status, 
                birthdate: new Date(),
                dateoforiginalappointment: new Date(),
                psiitem: "",
                employeenumber: "",
                tin: "",
                gsis: '',
                philhealth: '',
                pagibig: '',
                remarks: '',
            });
            
    }       
    // refresh views
    await testDB
        .execute(sql`REFRESH MATERIALIZED VIEW account_search_view`);
    await testDB
        .execute(sql`REFRESH MATERIALIZED VIEW faculty_record_search_view`);
}