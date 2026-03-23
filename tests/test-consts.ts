// external files
import * as seedData from './seed-data/faculty-admin';
export type possibleInputs = Array<'textbox'|'dropdown'|'numeric'|'date'|'remarks'|'checkbox'>;

//[ header, add button text, inputs, type of input field ]
export type testRowTuple = [string, string, string[], possibleInputs];

//for the tests to work with different test accounts
export const ITAcc = 'it@up.edu.ph';
export const AdminAcc = 'admin@up.edu.ph';

export const ITPass = 'password';
export const AdminPass = 'password';

export const ITConfig = 'playwright/.auth/it.json';
export const AdminConfig = 'playwright/.auth/admin.json';

// as of making this, the save confirmation hasn't yet been made
// so i made this preemtively
export const SaveConfirmText = 'Save'

// for editing records
export function getFieldTest() {
    return [
        'test-name', // Last name
        'test=name2', // First name 
        'test-name3', // Middle name
        'mm.', // suffix
        new Date().toLocaleDateString('en-GB'), // birth date
        new Date().toLocaleDateString('en-GB'), // date of original appointment
        'maiden-name', // maiden name
        //the numbers
        `${Math.floor(Math.random()*9999)}`,
        `${Math.floor(Math.random()*9999)}`,
        `${Math.floor(Math.random()*9999)}`,
        `${Math.floor(Math.random()*9999)}`,
        `${Math.floor(Math.random()*9999)}`,
        `${Math.floor(Math.random()*9999)}`,
        expectedStatuses[Math.floor(Math.random()*3)], // status
        new Date().toLocaleDateString('en-GB'), // date of original appointment
        'test remarks', // remarks
    ];
};

export function sampleEmails() { return ['test@up.edu.ph'];}
export function sampleContactNums() {return ['123456'];}
export function sampleHomeAddrs() {return ['up street'];}
export function sampleEduAttain() {
    return [
        'BS Test Degree',
        'UP Diliman',
        '3000',
    ]
}
export function sampleFieldsInterest() {
    return ['Test Interest'];
}
export function samplePromHist() {
    return [
        'Instructor 1', //todo: random picking of roles
        '10-2',
        '100000.00',
        'Tenured',
        new Date().toLocaleDateString('en-GB'),
    ]
}

export function samplePosition() {
    return [
        'Department Head',
        'Test Office',
        new Date().toLocaleDateString('en-GB'),
        new Date().toLocaleDateString('en-GB'),
        '2'
    ];
}

export function sampleMembership() {
    return [
        'membership-test',
        'test committee',
        new Date().toLocaleDateString('en-GB'),
        new Date().toLocaleDateString('en-GB'),
        '2',
    ];
}

export function sampleAdminWork() {
    return [
        'admin-test',
        new Date().toLocaleDateString('en-GB'),
        new Date().toLocaleDateString('en-GB'),
        '2',
    ];
}

export function sampleClass() {
    return [
        'Econ 11',
        'Section ABC',
        '11',
        '2',
        '5.0000',
    ];
}

export function sampleMentor() {
    return [
        'Lastname',
        'Firstname',
        'Middlename',
        'Test Category',
        new Date().toLocaleDateString('en-GB'),
        new Date().toLocaleDateString('en-GB'),
        '2',
    ];
}

export function sampleResearch() {
    return [
        'Title Testing',
        new Date().toLocaleDateString('en-GB'),
        new Date().toLocaleDateString('en-GB'),
        '100000.00',
        '2',
        'testmark',
    ];
}

export function sampleExt() {
    return [
        'Test Extension',
        'Test Agency',
        new Date().toLocaleDateString('en-GB'),
        new Date().toLocaleDateString('en-GB'),
        '2',
    ];
}

export function sampleStudy() {
    return [
        'BS More Test',
        'UP Diliman 2',
        '29',
        `${Math.random() < 0.5}`,
        `${Math.random() < 0.5}`,
        '2',
    ];
}

// in the case your sample data is different
export const expectedFacultyName = 'Dela Cruz, Juan';

export const expectedStatuses = ['Active', 'On Leave', 'Sabbatical'];

export const expectedRankPrefixes = [
    'Instructor',
    'Assistant Professor',
    'Associate Professor',
    'Professor',
];

//specific db instance for the tests.
//uses the same schema though since the schema has no runes.
//remember to clean up entries from this
import dotenv from 'dotenv';
import { and, eq, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

import * as schema from '../src/lib/server/db/schema';

dotenv.config({ path: '.env' });

export const testDB = drizzle(neon(process.env.DATABASE_URL!), { schema });

//warning: this gets checks for records also deleted
export function getData(): string[] {
    const res: string[] = [];

    for (const rec of seedData.testFaculty) res.push(`${rec.lastname}, ${rec.firstname}`);

    return res;
}

//general seed function
export async function seed() {
    // clear all tables
    await testDB.delete(schema.faculty);
    await testDB.delete(schema.facultyrank);
    await testDB.delete(schema.facultysemester);
    await testDB.delete(schema.facultyadminposition);
    await testDB.delete(schema.office);
    await testDB.delete(schema.office);

    await testDB.execute(sql`REFRESH MATERIALIZED VIEW account_search_view`);
    await testDB.execute(sql`REFRESH MATERIALIZED VIEW faculty_record_search_view`);

    //push office
    await testDB
        .insert(schema.office)
        .values({
            officeid: 1,
            name: 'Test Office' 
        });

    // push faculty
    await testDB.insert(schema.faculty).values(seedData.testFaculty);

    // push faculty ranks
    await testDB.insert(schema.facultyrank).values(seedData.rankRelations);

    // push faculty semesters
    await testDB.insert(schema.facultysemester).values(seedData.semesterRelations);

    // push faculty adminpositions
    await testDB.insert(schema.facultyadminposition).values(seedData.adminRelations);

    // refresh views
    // TODO: restart serials
    await testDB.execute(sql`REFRESH MATERIALIZED VIEW account_search_view`);
    await testDB.execute(sql`REFRESH MATERIALIZED VIEW faculty_record_search_view`);

    /*
    for (const rec of testData) {
        // do not add duplicates
        // for simplicity's sake, just compare names
        const query = await testDB
            .select()
            .from(schema.faculty)
            .where(
                and(
                    eq(schema.faculty.lastname, rec.lastname),
                    eq(schema.faculty.firstname, rec.firstname),
                ),
            );
        if (query.length) continue;

        // i have NO idea why this has an error even though this works normally
        // probably a typescript thing
        // update: doesn't throw an error anymore for some reason
        await testDB.insert(schema.faculty).values({
            lastname: rec.lastname,
            middlename: rec.middlename,
            firstname: rec.firstname,
            suffix: rec.suffix,
            birthdate: new Date().toISOString(),
            status: rec.status,
            dateoforiginalappointment: new Date().toISOString(),
            psiitem: '',
            employeenumber: '',
            tin: '',
            gsis: '',
            philhealth: '',
            pagibig: '',
            remarks: '',
        });
    }
    */
}

// for list input
export const emailInputs:possibleInputs = ['textbox'];
export const contactNumInputs:possibleInputs = ['textbox'];
export const homeAddrsInputs:possibleInputs = ['textbox'];
export const eduAttainInputs:possibleInputs = ['textbox', 'textbox', 'textbox'];
export const fieldInterestInputs:possibleInputs = ['dropdown'];
export const promHistInputs:possibleInputs = ['dropdown', 'dropdown', 'date'];

export const adminPosInputs:possibleInputs = ['dropdown', 'dropdown', 'date', 'date', 'numeric'];
export const membershipInputs:possibleInputs = ['textbox', 'textbox', 'date', 'date', 'numeric'];
export const adminWorkInputs:possibleInputs = ['textbox', 'dropdown', 'date', 'date', 'numeric'];
export const classesInputs:possibleInputs = ['dropdown', 'textbox', 'numeric', 'numeric', 'numeric'];
export const mentorInputs:possibleInputs = ['textbox', 'textbox', 'textbox', 'textbox', 'date', 'date', 'numeric'];
export const researchInputs:possibleInputs = ['textbox', 'numeric', 'remarks'];
export const extInputs:possibleInputs = ['textbox', 'textbox', 'date', 'date', 'numeric'];
export const studyInputs:possibleInputs = ['textbox', 'textbox', 'numeric', 'checkbox', 'checkbox', 'numeric'];

export const profileLists = [
    emailInputs,
    contactNumInputs,
    homeAddrsInputs,
    eduAttainInputs,
    fieldInterestInputs,
    promHistInputs,
]

export const secRecLists = [
    adminPosInputs,
    membershipInputs,
    adminWorkInputs,
    classesInputs,
    mentorInputs,
    researchInputs,
    extInputs,
    studyInputs,
]

//for field input

export const profileTabFields = [
    'Last Name',
    'First Name',
    'Middle Name',
    'Suffix',
    'Birth Date',
    'Maiden Name',
    'PhilHealth No.',
    'Pag-IBIG No.',
    'PSI Item No.',
    'TIN',
    'GSIS BP No.',
    'Employee No.',
    'Status',
    'Date of Original Appointment',
    'Remarks',
]


export const semRecsFields = [
    'Current Rank',
    'Current Highest Educational Attainment',
    'Remarks',
]

// to spot the headers and stuff. basically gets a unique header from each list.
// also acts as some helper data structure to fill in sample data in inputs of a specific type
export function profileTabListSample():testRowTuple[] {
    return [
        ['Emails', '+ Add Email', sampleEmails(), emailInputs],
        ['Contact Numbers', '+ Add Contact Number', sampleContactNums(), contactNumInputs],
        ['Home Addresses', '+ Add Home Addresses', sampleHomeAddrs(), homeAddrsInputs],
        ['Degree', ' Add Educational Attainment', sampleEduAttain(), eduAttainInputs],
        ['Fields of Interest', '+ Add Fields of Interest', sampleFieldsInterest(), fieldInterestInputs],
        ['Rank of Renewal/Tenure', '+ Add Promotion', samplePromHist(), promHistInputs],
    ]
}

//same idea
export function semRecsTabListSample():testRowTuple[] {
    return [
        ['Position', '+ Add Position', samplePosition(), adminPosInputs],
        ['Nature of Membership', '+ Add Comittee Membership', sampleContactNums(), contactNumInputs],
        ['Nature of Administrative Work', '+ Add Administrative Work', sampleAdminWork(), adminWorkInputs],
        ['Course', '+ Add Class', sampleClass(), classesInputs],
        ['Mentee Last Name', '+ Add Mentee', sampleMentor(), mentorInputs],
        ['Title', '+ Add Research/TextbookWriting/Creative Work', sampleResearch(), researchInputs],
        ['Nature of Extension Work/Community Service', '+ Add Extension Work/Community Service', sampleExt(), extInputs],
        ['Degree', '+ Add Degree Program', sampleStudy(), studyInputs],
    ]
}