import { sql } from 'drizzle-orm';

import { course, rank, role, status } from './schema';
import { db } from './index';

// TODO: Check if tama

export const statuses = [{ status: 'Active' }, { status: 'On Leave' }, { status: 'Sabbatical' }];

export const ranks = [
    {
        ranktitle: 'Instructor 1',
        salarygrade: '14-1',
        salaryrate: '500000.00',
    },
    {
        ranktitle: 'Instructor 2',
        salarygrade: '15-1',
        salaryrate: '500000.00',
    },
    {
        ranktitle: 'Instructor 3',
        salarygrade: '15-3',
        salaryrate: '500000.00',
    },
    {
        ranktitle: 'Instructor 4',
        salarygrade: '16-1',
        salaryrate: '500000.00',
    },
    {
        ranktitle: 'Instructor 5',
        salarygrade: '16-3',
        salaryrate: '500000.00',
    },
    {
        ranktitle: 'Instructor 6',
        salarygrade: '17-1',
        salaryrate: '500000.00',
    },
    {
        ranktitle: 'Instructor 7',
        salarygrade: '17-3',
        salaryrate: '500000.00',
    },
    {
        ranktitle: 'Assistant Professor 1',
        salarygrade: '18-1',
        salaryrate: '500000.00',
    },
    {
        ranktitle: 'Assistant Professor 2',
        salarygrade: '19-1',
        salaryrate: '500000.00',
    },
    {
        ranktitle: 'Assistant Professor 3',
        salarygrade: '19-3',
        salaryrate: '500000.00',
    },
    {
        ranktitle: 'Assistant Professor 4',
        salarygrade: '20-1',
        salaryrate: '500000.00',
    },
    {
        ranktitle: 'Assistant Professor 5',
        salarygrade: '21-1',
        salaryrate: '500000.00',
    },
    {
        ranktitle: 'Assistant Professor 6',
        salarygrade: '21-3',
        salaryrate: '500000.00',
    },
    {
        ranktitle: 'Assistant Professor 7',
        salarygrade: '21-5',
        salaryrate: '500000.00',
    },
    {
        ranktitle: 'Associate Professor 1',
        salarygrade: '22-4',
        salaryrate: '500000.00',
    },
    {
        ranktitle: 'Associate Professor 2',
        salarygrade: '22-5',
        salaryrate: '500000.00',
    },
    {
        ranktitle: 'Associate Professor 3',
        salarygrade: '23-4',
        salaryrate: '500000.00',
    },
    {
        ranktitle: 'Associate Professor 4',
        salarygrade: '24-3',
        salaryrate: '500000.00',
    },
    {
        ranktitle: 'Associate Professor 5',
        salarygrade: '25-2',
        salaryrate: '500000.00',
    },
    {
        ranktitle: 'Associate Professor 6',
        salarygrade: '25-3',
        salaryrate: '500000.00',
    },
    {
        ranktitle: 'Associate Professor 7',
        salarygrade: '25-5',
        salaryrate: '500000.00',
    },
    {
        ranktitle: 'Professor 1',
        salarygrade: '26-4',
        salaryrate: '500000.00',
    },
    {
        ranktitle: 'Professor 2',
        salarygrade: '26-5',
        salaryrate: '500000.00',
    },
    {
        ranktitle: 'Professor 3',
        salarygrade: '26-6',
        salaryrate: '500000.00',
    },
    {
        ranktitle: 'Professor 4',
        salarygrade: '27-5',
        salaryrate: '500000.00',
    },
    {
        ranktitle: 'Professor 5',
        salarygrade: '27-6',
        salaryrate: '500000.00',
    },
    {
        ranktitle: 'Professor 6',
        salarygrade: '27-7',
        salaryrate: '500000.00',
    },
    {
        ranktitle: 'Professor 7',
        salarygrade: '28-6',
        salaryrate: '500000.00',
    },
    {
        ranktitle: 'Professor 8',
        salarygrade: '28-7',
        salaryrate: '500000.00',
    },
    {
        ranktitle: 'Professor 9',
        salarygrade: '28-8',
        salaryrate: '500000.00',
    },
    {
        ranktitle: 'Professor 10',
        salarygrade: '29-7',
        salaryrate: '500000.00',
    },
    {
        ranktitle: 'Professor 11',
        salarygrade: '29-8',
        salaryrate: '500000.00',
    },
    {
        ranktitle: 'Professor 12',
        salarygrade: '29-8',
        salaryrate: '500000.00',
    },
];

export const courses = [
    {
        coursename: 'Econ 11',
        units: 3,
    },
];

export const roles = [
    {
        role: 'Admin',
        canaddfaculty: true,
        canmodifyfaculty: true,
        canaddaccount: false,
        canmodifyaccount: false,
        canviewchangelogs: false,
    },
    {
        role: 'IT',
        canaddfaculty: true,
        canmodifyfaculty: true,
        canaddaccount: true,
        canmodifyaccount: true,
        canviewchangelogs: true,
    },
];

async function seedStatusTable() {
    // Don't proceed if table is already seeded
    const rows = await db.select().from(status).limit(1);
    if (rows.length > 0) return { success: true };

    const response = await db.insert(status).values(statuses).returning();

    // Check response
    return { success: response.length === 3 };
}

async function seedRankTable() {
    // Don't proceed if table is already seeded
    const rows = await db.select().from(rank).limit(1);
    if (rows.length > 0) return { success: true };

    const response = await db.insert(rank).values(ranks).returning();

    // Check response
    return { success: response.length === 3 };
}

async function seedCourseTable() {
    // Don't proceed if table is already seeded
    const rows = await db.select().from(course).limit(1);
    if (rows.length > 0) return { success: true };

    const response = await db.insert(course).values(courses).returning();

    // Check response
    return { success: response.length === 3 };
}

async function seedRoleTable() {
    // Don't proceed if table is already seeded
    const rows = await db.select().from(role).limit(1);
    if (rows.length > 0) return { success: true };

    const response = await db.insert(role).values(roles).returning();

    // Check response
    return { success: response.length === 3 };
}

export async function seedDatabase() {
    // Enable pg_trgm extension
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);

    // Insert into
    await seedStatusTable(); // status
    await seedRankTable(); // rank
    await seedCourseTable(); // course
    await seedRoleTable(); // role
}
