import { and, desc, eq, ilike, or } from 'drizzle-orm';

import { db } from './db';

import {
    adminposition,
    appuser,
    changelog,
    faculty,
    facultyadminposition,
    facultyrank,
    facultyRecordSearchView,
    facultysemester,
    rank,
    semester,
} from './db/schema';

export async function getFacultyRecordList(searchTerm: string | null) {
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

    // Search in search table all faculty records affected
    const searchSq = await db
        .selectDistinct({
            id: facultyRecordSearchView.id,
        })
        .from(facultyRecordSearchView)
        // eslint-disable-next-line no-undefined -- can't use null in Drizzle WHERE queries
        .where(searchTerm ? ilike(facultyRecordSearchView.searchcontent, `%${searchTerm}%`) : undefined)
        .as('search_sq');

    // Get faculty records from database
    const shownFields = await db
        .select({
            facultyid: searchSq.id,
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
        .rightJoin(searchSq, eq(searchSq.id, faculty.facultyid))
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
        .leftJoin(appuser, eq(appuser.id, changelog.userid));

    return shownFields;
}
