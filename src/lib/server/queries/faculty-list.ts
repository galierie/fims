import { and, asc, desc, eq, gt, ilike, lt, or, type SQL, type SQLWrapper } from 'drizzle-orm';

import type { FilterColumn } from '$lib/types/filter';

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
    status,
} from '../db/schema';
import { db } from '../db';

const pageSize = 50;

export async function getFacultyRecordList(
    searchTerm: string | null,
    filterMap: FilterColumn[],
    cursor?: number,
    isNext: boolean = true,
    initLoad: boolean = false,
) {
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

    // eslint-disable-next-line no-undefined
    const searchFilter = searchTerm
        ? ilike(facultyRecordSearchView.searchcontent, `%${searchTerm}%`)
        : undefined;

    const searchSq = await db
        .selectDistinct({
            id: facultyRecordSearchView.id,
        })
        .from(facultyRecordSearchView)
        .where(searchFilter)
        .as('search_sq');

    // Process filter queries
    const filterQueries: Array<SQL | undefined> = [];
    filterMap.forEach(({ obj, column }) => {
        const { selectedOpts } = obj;
        const sameColumnQueries: SQLWrapper[] = [];
        selectedOpts.forEach((opt) => {
            sameColumnQueries.push(eq(column, opt));
        });

        if (sameColumnQueries.length) filterQueries.push(or(...sameColumnQueries));
    });

    // Get only the single most recent admin position per semester
    const adminPositionSq = db
        .selectDistinctOn([facultyadminposition.facultysemesterid], {
            facultysemesterid: facultyadminposition.facultysemesterid,
            positions: adminposition.name,
        })
        .from(facultyadminposition)
        .leftJoin(
            adminposition,
            eq(adminposition.adminpositionid, facultyadminposition.adminpositionid),
        )
        .orderBy(
            facultyadminposition.facultysemesterid,
            desc(facultyadminposition.startdate), // Prioritize the latest start date
            desc(facultyadminposition.facultyadminpositionid), // Tiebreaker: highest ID
        )
        .as('admin_position_sq');

    // eslint-disable-next-line no-undefined
    let cursorFilter: SQL | undefined = undefined;
    if (cursor) {
        cursorFilter = isNext ? gt(faculty.facultyid, cursor) : lt(faculty.facultyid, cursor);
    }
    // Get faculty records from database
    const facultyRecordCountSq = await db
        .select({
            facultyid: searchSq.id,
            lastname: faculty.lastname,
            firstname: faculty.firstname,
            status: faculty.status,
            ranktitle: rank.ranktitle,
            adminposition: adminPositionSq.positions,
            latestchangelogid: faculty.latestchangelogid,
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
            adminPositionSq,
            eq(adminPositionSq.facultysemesterid, facultysemester.facultysemesterid),
        )
        .where(and(cursorFilter, and(...filterQueries)))
        .orderBy(isNext ? asc(faculty.facultyid) : desc(faculty.facultyid))
        .limit(pageSize + 1)
        .as('faculty_record_count_sq');

    // Check if there is a previous/next page
    let hasPrev = !initLoad;
    let hasNext = true;

    const facultyRecordCount = (await db.select().from(facultyRecordCountSq)).length;

    if (isNext) hasNext = facultyRecordCount > pageSize;
    else hasPrev = facultyRecordCount > pageSize;

    // Chop off the extra record
    const facultyRecordSq = await db
        .select()
        .from(facultyRecordCountSq)
        .orderBy(
            isNext ? asc(facultyRecordCountSq.facultyid) : desc(facultyRecordCountSq.facultyid),
        )
        .limit(pageSize)
        .as('user_sq');

    // Get cursors
    let [firstId] = await db
        .select({
            value: facultyRecordSq.facultyid,
        })
        .from(facultyRecordSq)
        .orderBy(asc(facultyRecordSq.facultyid))
        .limit(1);

    let [lastId] = await db
        .select({
            value: facultyRecordSq.facultyid,
        })
        .from(facultyRecordSq)
        .orderBy(desc(facultyRecordSq.facultyid))
        .limit(1);

    // Get changelogs
    const shownFields = await db
        .select({
            facultyid: facultyRecordSq.facultyid,
            lastname: facultyRecordSq.lastname,
            firstname: facultyRecordSq.firstname,
            status: facultyRecordSq.status,
            ranktitle: facultyRecordSq.ranktitle,
            adminposition: facultyRecordSq.adminposition,
            logTimestamp: changelog.timestamp,
            logMaker: appuser.email,
            logOperation: changelog.operation,
        })
        .from(facultyRecordSq)
        .leftJoin(changelog, eq(changelog.logid, facultyRecordSq.latestchangelogid))
        .leftJoin(appuser, eq(appuser.id, changelog.userid));

    // Reverse account list and cursors if previous page
    if (!isNext) {
        [lastId, firstId] = [firstId, lastId];
        shownFields.reverse();
    }

    return {
        facultyRecordList: shownFields,
        prevCursor: firstId?.value,
        nextCursor: lastId?.value,
        hasPrev,
        hasNext,
    };
}

export interface FacultyListDTO {
    facultyid: number | null;
    lastname: string | null;
    firstname: string | null;
    status: string | null;
    ranktitle: string | null;
    adminposition: string | null;
    logTimestamp: Date | null;
    logMaker: string | null;
    logOperation: string | null;
}

export async function refreshFacultyRecordSearchView() {
    // NOTE: Have faith na lang that this doesn't take too long
    await db.refreshMaterializedView(facultyRecordSearchView);
}

export async function getAllStatuses() {
    const uniqueRows = await db
        .select({
            status: status.status,
        })
        .from(status);

    const uniqueValues = uniqueRows.map(({ status }) => status);
    return uniqueValues;
}

export async function getAllRankTitles() {
    const uniqueRows = await db
        .select({
            ranktitle: rank.ranktitle,
        })
        .from(rank);

    const uniqueValues = uniqueRows.map(({ ranktitle }) => ranktitle);
    return uniqueValues;
}

export async function getAllAdminPositions() {
    const uniqueRows = await db
        .select({
            name: adminposition.name,
        })
        .from(adminposition);

    const uniqueValues = uniqueRows.map(({ name }) => name);
    return uniqueValues;
}
