// external files
import dotenv from 'dotenv';
import { and, eq, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

import * as schema from '../src/lib/server/db/schema';

import * as seedData from './seed-data/faculty-admin';

dotenv.config({ path: '.env' });

export const testDB = drizzle(neon(process.env.DATABASE_URL!), { schema });

//warning: this gets checks for records also deleted
export function getData(): string[] {
    const res: string[] = [];

    for (const rec of seedData.testFaculty) res.push(`${rec.lastName}, ${rec.firstName}`);

    return res;
}

//general seed function
export async function seed() {
    console.log('seeding!!!');
    // clear all tables
    await testDB.delete(schema.faculty);
    await testDB.delete(schema.facultyRank);
    await testDB.delete(schema.facultyAcademicSemester);
    await testDB.delete(schema.facultyAdminPosition);
    await testDB.delete(schema.appointmentStatus);
    await testDB.delete(schema.office);

    await testDB.execute(sql`REFRESH MATERIALIZED VIEW account_search_view`);
    await testDB.execute(sql`REFRESH MATERIALIZED VIEW faculty_record_search_view`);

    //push office
    await testDB.insert(schema.office).values({
        id: 1,
        name: 'Test Office',
    });

    //push appointment statuses
    await testDB.insert(schema.appointmentStatus).values(seedData.apppointmentStatuses);

    // push faculty
    await testDB.insert(schema.faculty).values(seedData.testFaculty);

    // push faculty ranks
    await testDB.insert(schema.facultyRank).values(seedData.rankRelations);

    // push faculty semesters
    await testDB.insert(schema.facultyAcademicSemester).values(seedData.semesterRelations);

    // push faculty adminpositions
    await testDB.insert(schema.facultyAdminPosition).values(seedData.adminRelations);

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
export const emailInputs: possibleInputs = ['textbox'];
export const contactNumInputs: possibleInputs = ['textbox'];
export const homeAddrsInputs: possibleInputs = ['textbox'];
export const eduAttainInputs: possibleInputs = ['textbox', 'textbox', 'textbox'];
export const fieldInterestInputs: possibleInputs = ['dropdown'];
export const promHistInputs: possibleInputs = ['dropdown', 'none', 'none', 'dropdown', 'date'];

export const adminPosInputs: possibleInputs = ['dropdown', 'dropdown', 'date', 'date', 'numeric'];
export const membershipInputs: possibleInputs = ['textbox', 'textbox', 'date', 'date', 'numeric'];
export const adminWorkInputs: possibleInputs = ['textbox', 'dropdown', 'date', 'date', 'numeric'];
export const classesInputs: possibleInputs = [
    'dropdown',
    'textbox',
    'numeric',
    'numeric',
    'numeric',
];
export const mentorInputs: possibleInputs = [
    'textbox',
    'textbox',
    'textbox',
    'textbox',
    'date',
    'date',
    'numeric',
];
export const researchInputs: possibleInputs = ['textbox', 'numeric', 'remarks'];
export const extInputs: possibleInputs = ['textbox', 'textbox', 'date', 'date', 'numeric'];
export const studyInputs: possibleInputs = [
    'textbox',
    'textbox',
    'numeric',
    'checkbox',
    'checkbox',
    'numeric',
];

export const profileLists = [
    emailInputs,
    contactNumInputs,
    homeAddrsInputs,
    eduAttainInputs,
    fieldInterestInputs,
    promHistInputs,
];

export const secRecLists = [
    adminPosInputs,
    membershipInputs,
    adminWorkInputs,
    classesInputs,
    mentorInputs,
    researchInputs,
    extInputs,
    studyInputs,
];

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
];

export const semRecsFields = ['Current Rank', 'Current Highest Educational Attainment', 'Remarks'];

// to spot the headers and stuff. basically gets a unique header from each list.
// also acts as some helper data structure to fill in sample data in inputs of a specific type
export function profileTabListSample(): testRowTuple[] {
    return [
        ['Emails', '+ Add Email', sampleEmails(), emailInputs],
        ['Contact Numbers', '+ Add Contact Number', sampleContactNums(), contactNumInputs],
        ['Home Addresses', '+ Add Home Address', sampleHomeAddrs(), homeAddrsInputs],
        ['Degree', '+ Add Educational Attainment', sampleEduAttain(), eduAttainInputs],
        [
            'Fields of Interest',
            '+ Add Fields of Interest',
            sampleFieldsInterest(),
            fieldInterestInputs,
        ],
        ['Rank of Renewal/Tenure', '+ Add Promotion', samplePromHist(), promHistInputs],
    ];
}

//same idea
export function semRecsTabListSample(): testRowTuple[] {
    return [
        ['Position', '+ Add Position', samplePosition(), adminPosInputs],
        [
            'Nature of Membership',
            '+ Add Comittee Membership',
            sampleContactNums(),
            contactNumInputs,
        ],
        [
            'Nature of Administrative Work',
            '+ Add Administrative Work',
            sampleAdminWork(),
            adminWorkInputs,
        ],
        ['Course', '+ Add Class', sampleClass(), classesInputs],
        ['Mentee Last Name', '+ Add Mentee', sampleMentor(), mentorInputs],
        ['Title', '+ Add Research/TextbookWriting/Creative Work', sampleResearch(), researchInputs],
        [
            'Nature of Extension Work/Community Service',
            '+ Add Extension Work/Community Service',
            sampleExt(),
            extInputs,
        ],
        ['Degree', '+ Add Degree Program', sampleStudy(), studyInputs],
    ];
}
