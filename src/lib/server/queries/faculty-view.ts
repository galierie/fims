import { eq } from 'drizzle-orm';

import { db } from '../db';

import {
    faculty,
} from '../db/schema';

export async function getFacultyName(facultyid: number) {
    const response = await db
        .select({
            lastName: faculty.lastname,
            firstName: faculty.firstname,
        })
        .from(faculty)
        .where(eq(faculty.facultyid, facultyid));

    if (response.length === 0) return null;

    const [record] = response;
    return record;
}
