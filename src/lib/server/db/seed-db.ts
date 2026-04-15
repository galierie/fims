import { sql } from 'drizzle-orm';

import { appointmentStatus, course, degreeProgram, fieldOfInterest, rank, role, status } from './schema';
import { db } from './index';

export const appointmentStatuses = [
    { appointmentStatus: 'Permanent' },
    { appointmentStatus: 'Full-Time' },
    { appointmentStatus: 'Temporary' },
    { appointmentStatus: 'Part-Time' },
];

export const degreePrograms = [
    {
        id: 1,
        name: 'Undergraduate',
        isGraduateLevel: false,
    },
    {
        id: 2,
        name: 'MA/PhD',
        isGraduateLevel: true,
    },
    {
        id: 3,
        name: 'MDE',
        isGraduateLevel: true,
    },
];

export const ranks = [
    {
        title: 'Instructor 1',
        salaryGrade: '14-1',
        salaryRate: '500000.00',
    },
    {
        title: 'Instructor 2',
        salaryGrade: '15-1',
        salaryRate: '500000.00',
    },
    {
        title: 'Instructor 3',
        salaryGrade: '15-3',
        salaryRate: '500000.00',
    },
    {
        title: 'Instructor 4',
        salaryGrade: '16-1',
        salaryRate: '500000.00',
    },
    {
        title: 'Instructor 5',
        salaryGrade: '16-3',
        salaryRate: '500000.00',
    },
    {
        title: 'Instructor 6',
        salaryGrade: '17-1',
        salaryRate: '500000.00',
    },
    {
        title: 'Instructor 7',
        salaryGrade: '17-3',
        salaryRate: '500000.00',
    },
    {
        title: 'Assistant Professor 1',
        salaryGrade: '18-1',
        salaryRate: '500000.00',
    },
    {
        title: 'Assistant Professor 2',
        salaryGrade: '19-1',
        salaryRate: '500000.00',
    },
    {
        title: 'Assistant Professor 3',
        salaryGrade: '19-3',
        salaryRate: '500000.00',
    },
    {
        title: 'Assistant Professor 4',
        salaryGrade: '20-1',
        salaryRate: '500000.00',
    },
    {
        title: 'Assistant Professor 5',
        salaryGrade: '21-1',
        salaryRate: '500000.00',
    },
    {
        title: 'Assistant Professor 6',
        salaryGrade: '21-3',
        salaryRate: '500000.00',
    },
    {
        title: 'Assistant Professor 7',
        salaryGrade: '21-5',
        salaryRate: '500000.00',
    },
    {
        title: 'Associate Professor 1',
        salaryGrade: '22-4',
        salaryRate: '500000.00',
    },
    {
        title: 'Associate Professor 2',
        salaryGrade: '22-5',
        salaryRate: '500000.00',
    },
    {
        title: 'Associate Professor 3',
        salaryGrade: '23-4',
        salaryRate: '500000.00',
    },
    {
        title: 'Associate Professor 4',
        salaryGrade: '24-3',
        salaryRate: '500000.00',
    },
    {
        title: 'Associate Professor 5',
        salaryGrade: '25-2',
        salaryRate: '500000.00',
    },
    {
        title: 'Associate Professor 6',
        salaryGrade: '25-3',
        salaryRate: '500000.00',
    },
    {
        title: 'Associate Professor 7',
        salaryGrade: '25-5',
        salaryRate: '500000.00',
    },
    {
        title: 'Professor 1',
        salaryGrade: '26-4',
        salaryRate: '500000.00',
    },
    {
        title: 'Professor 2',
        salaryGrade: '26-5',
        salaryRate: '500000.00',
    },
    {
        title: 'Professor 3',
        salaryGrade: '26-6',
        salaryRate: '500000.00',
    },
    {
        title: 'Professor 4',
        salaryGrade: '27-5',
        salaryRate: '500000.00',
    },
    {
        title: 'Professor 5',
        salaryGrade: '27-6',
        salaryRate: '500000.00',
    },
    {
        title: 'Professor 6',
        salaryGrade: '27-7',
        salaryRate: '500000.00',
    },
    {
        title: 'Professor 7',
        salaryGrade: '28-6',
        salaryRate: '500000.00',
    },
    {
        title: 'Professor 8',
        salaryGrade: '28-7',
        salaryRate: '500000.00',
    },
    {
        title: 'Professor 9',
        salaryGrade: '28-8',
        salaryRate: '500000.00',
    },
    {
        title: 'Professor 10',
        salaryGrade: '29-7',
        salaryRate: '500000.00',
    },
    {
        title: 'Professor 11',
        salaryGrade: '29-8',
        salaryRate: '500000.00',
    },
    {
        title: 'Professor 12',
        salaryGrade: '29-8',
        salaryRate: '500000.00',
    },
];

export const roles = [
    {
        role: 'Admin',
        canAddFaculty: true,
        canModifyFaculty: true,
        canAddAccount: false,
        canModifyAccount: false,
        canViewChangelogs: false,
    },
    {
        role: 'IT',
        canAddFaculty: true,
        canModifyFaculty: true,
        canAddAccount: true,
        canModifyAccount: true,
        canViewChangelogs: true,
    },
];

export const statuses = [
    { status: 'Active' },
    { status: 'On Leave' },
    { status: 'Sabbatical' },
    { status: 'On Secondment' },
];


export const courses = [
    {
        name: 'Econ 11',
        units: 3,
        degreeProgramId: 1,
    },
];

// dummy, needs to be changed
export const fieldsOfInterest = [
    { field: 'Software Engineering' },
    { field: 'Data Science' },
    { field: 'Artificial Intelligence' },
    { field: 'Cybersecurity' },
    { field: 'Information Systems' },
];

async function seedAppointmentStatusTable() {
    const rows = await db.select().from(appointmentStatus).limit(1);
    if (rows.length > 0) return { success: true };

    const response = await db.insert(appointmentStatus).values(appointmentStatuses).returning();
    return { success: response.length === appointmentStatuses.length };
}

async function seedDegreeProgramTable() {
    // Don't proceed if table is already seeded
    const rows = await db.select().from(degreeProgram).limit(1);
    if (rows.length > 0) return { success: true };

    const response = await db.insert(degreeProgram).values(degreePrograms).returning();

    // Check response
    return { success: response.length === degreePrograms.length };
}

async function seedRankTable() {
    // Don't proceed if table is already seeded
    const rows = await db.select().from(rank).limit(1);
    if (rows.length > 0) return { success: true };

    const response = await db.insert(rank).values(ranks).returning();

    // Check response
    return { success: response.length === ranks.length };
}

async function seedRoleTable() {
    // Don't proceed if table is already seeded
    const rows = await db.select().from(role).limit(1);
    if (rows.length > 0) return { success: true };

    const response = await db.insert(role).values(roles).returning();

    // Check response
    return { success: response.length === roles.length };
}

async function seedStatusTable() {
    // Don't proceed if table is already seeded
    const rows = await db.select().from(status).limit(1);
    if (rows.length > 0) return { success: true };

    const response = await db.insert(status).values(statuses).returning();

    // Check response
    return { success: response.length === statuses.length };
}

async function seedCourseTable() {
    // Don't proceed if table is already seeded
    const rows = await db.select().from(course).limit(1);
    if (rows.length > 0) return { success: true };

    const response = await db.insert(course).values(courses).returning();

    // Check response
    return { success: response.length === courses.length };
}

async function seedFieldOfInterestTable() {
    const rows = await db.select().from(fieldOfInterest).limit(1);
    if (rows.length > 0) return { success: true };

    const response = await db.insert(fieldOfInterest).values(fieldsOfInterest).returning();
    return { success: response.length === fieldsOfInterest.length };
}

export async function seedDatabase() {
    // Enable pg_trgm extension
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);

    // Insert into
    await seedStatusTable(); // status
    await seedRankTable(); // rank
    await seedDegreeProgramTable(); // course
    await seedCourseTable(); // course
    await seedRoleTable(); // role
    await seedFieldOfInterestTable(); // field of interest
    await seedAppointmentStatusTable(); // appointment status
}
