import { db } from '$lib/server/db';
import { academicSemester } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';

export async function load() {
    // Fetch the absolute latest academic semester in the entire system
    const latestSemArr = await db
        .select()
        .from(academicSemester)
        .orderBy(desc(academicSemester.academicYear), desc(academicSemester.semesterNumber))
        .limit(1);

    // Default fallbacks just in case the entire database is empty
    let systemLatestAcadYear = new Date().getFullYear();
    let systemLatestSemNum = 1;

    if (latestSemArr.length > 0) {
        systemLatestAcadYear = latestSemArr[0].academicYear;
        systemLatestSemNum = latestSemArr[0].semesterNumber;
    }

    return {
        systemLatestAcadYear,
        systemLatestSemNum,
    };
}