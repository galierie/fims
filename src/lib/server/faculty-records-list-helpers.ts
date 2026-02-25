import { and, desc, eq, ilike, or } from 'drizzle-orm';

import { db } from './db';

import {
    adminposition,
    appuser,
    changelog,
    faculty,
    facultyadminposition,
    facultyrank,
    facultysemester,
    rank,
    semester,
} from './db/schema';

export async function getFacultyRecordList(searchQuery: string = '') {
    // Get entries for the current semester
    // TODO: Find a better way to know current semester
    const currentAcademicYear = 2026;
    const currentSemester = 2;
    const [latestSemester] = await db
        .select({
            acadsemesterid: semester.acadsemesterid,
        })
        .from(semester)
        .where(
            and(
                eq(semester.academicyear, currentAcademicYear),
                eq(semester.semester, currentSemester),
            ),
        )
        .limit(1);

    // fallback ID in case there are no entries for current semester
    const currentSemesterId = latestSemester?.acadsemesterid ?? -1;

    // 3. Define the Search Condition
    // We search across First Name, Last Name, and Status
    const searchCondition = searchQuery
        ? or(
              ilike(faculty.firstname, `%${searchQuery}%`),
              ilike(faculty.lastname, `%${searchQuery}%`),
              ilike(faculty.status, `%${searchQuery}%`),
          )
        : // eslint-disable-next-line no-undefined -- can't use null in Drizzle WHERE queries
          undefined;

    const shownFields = await db
        .select({
            facultyid: faculty.facultyid,
            lastname: faculty.lastname,
            firstname: faculty.firstname,
            status: faculty.status,
            ranktitle: rank.ranktitle,
            adminposition: adminposition.name,
            logTimestamp: changelog.timestamp,
            logMaker: appuser.email,
            logOperation: changelog.operation,
        })
        .from(faculty)
        .leftJoin(
            facultysemester,
            and(
                eq(facultysemester.facultyid, faculty.facultyid),
                eq(facultysemester.acadsemesterid, currentSemesterId), // Match only the current semester
            ),
        )
        .leftJoin(facultyrank, eq(facultyrank.facultyrankid, facultysemester.currentrankid))
        .leftJoin(rank, eq(rank.rankid, facultyrank.rankid))
        .leftJoin(
            facultyadminposition,
            eq(facultyadminposition.facultysemesterid, facultysemester.facultysemesterid),
        )
        .leftJoin(
            adminposition,
            eq(adminposition.adminpositionid, facultyadminposition.adminpositionid),
        )
        .leftJoin(changelog, eq(changelog.logid, faculty.latestchangelogid))
        .leftJoin(appuser, eq(appuser.id, changelog.userid))
        .where(
            // 4. Combine the Semester check AND the Search condition
            and(eq(facultysemester.acadsemesterid, latestSemester.acadsemesterid), searchCondition),
        );

    return shownFields;
}
