import { and, asc, desc, eq, gt, ilike, lt, or, type SQL, type SQLWrapper, sql } from 'drizzle-orm';

import type { FilterColumn } from '$lib/types/filter';

import {
    academicSemester,
    adminPosition,
    changelog,
    faculty,
    facultyAcademicSemester,
    facultyAdminPosition,
    facultyRank,
    facultyRecordSearchView,
    profile,
    rank,
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
    // Get entries for the current AcademicSemester
    // TODO: Find a better way to know current AcademicSemester
    const currentAcademicYear = 2026;
    const currentAcademicSemester = 2;
    const [latestAcademicSemester] = await db
        .select({
            academicSemesterid: academicSemester.id,
        })
        .from(academicSemester)
        .where(
            and(
                eq(academicSemester.academicYear, currentAcademicYear),
                eq(academicSemester.semesterNumber, currentAcademicSemester),
            ),
        )
        .limit(1);

    // fallback ID in case there are no entries for current AcademicSemester
    const currentAcademicSemesterId = latestAcademicSemester?.academicSemesterid ?? -1;

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

    // Get only the single most recent admin position per AcademicSemester
    const adminPositionSq = db
        .selectDistinctOn([facultyAdminPosition.facultyAcademicSemesterId], {
            facultyAcademicSemesterId: facultyAdminPosition.facultyAcademicSemesterId,
            title: sql<string>`${adminPosition.title}`.as('position_title'),
        })
        .from(facultyAdminPosition)
        .leftJoin(adminPosition, eq(adminPosition.id, facultyAdminPosition.adminPositionId))
        .orderBy(
            facultyAdminPosition.facultyAcademicSemesterId,
            desc(facultyAdminPosition.startDate), // Prioritize the latest start date
            desc(facultyAdminPosition.id), // Tiebreaker: highest ID
        )
        .as('admin_position_sq');

    let cursorFilter: SQL | undefined;
    if (cursor) cursorFilter = isNext ? gt(faculty.id, cursor) : lt(faculty.id, cursor);

    // Get faculty records from database
    const facultyRecordCountSq = await db
        .select({
            id: searchSq.id,
            lastName: faculty.lastName,
            firstName: faculty.firstName,
            status: faculty.status,
            rankTitle: rank.title,
            adminPosition: adminPositionSq.title,
            latestChangelogId: faculty.latestChangelogId,
        })
        .from(faculty)
        .rightJoin(searchSq, eq(searchSq.id, faculty.id))
        .leftJoin(
            facultyAcademicSemester,
            and(
                eq(facultyAcademicSemester.facultyId, faculty.id),
                eq(facultyAcademicSemester.academicSemesterId, currentAcademicSemesterId), // Match only the current AcademicSemester
            ),
        )
        .leftJoin(facultyRank, eq(facultyRank.id, facultyAcademicSemester.currentRankId))
        .leftJoin(rank, eq(rank.id, facultyRank.rankId))
        .leftJoin(
            adminPositionSq,
            eq(adminPositionSq.facultyAcademicSemesterId, facultyAcademicSemester.id),
        )
        .where(and(cursorFilter, and(...filterQueries)))
        .orderBy(isNext ? asc(faculty.id) : desc(faculty.id))
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
        .orderBy(isNext ? asc(facultyRecordCountSq.id) : desc(facultyRecordCountSq.id))
        .limit(pageSize)
        .as('user_sq');

    // Get cursors
    let [firstId] = await db
        .select({
            value: facultyRecordSq.id,
        })
        .from(facultyRecordSq)
        .orderBy(asc(facultyRecordSq.id))
        .limit(1);

    let [lastId] = await db
        .select({
            value: facultyRecordSq.id,
        })
        .from(facultyRecordSq)
        .orderBy(desc(facultyRecordSq.id))
        .limit(1);

    // Get changelogs
    const shownFields = await db
        .select({
            id: facultyRecordSq.id,
            lastName: facultyRecordSq.lastName,
            firstName: facultyRecordSq.firstName,
            status: facultyRecordSq.status,
            rankTitle: facultyRecordSq.rankTitle,
            adminPosition: facultyRecordSq.adminPosition,
            logTimestamp: changelog.timestamp,
            logMaker: profile.email,
            logOperation: changelog.operation,
        })
        .from(facultyRecordSq)
        .leftJoin(changelog, eq(changelog.id, facultyRecordSq.latestChangelogId))
        .leftJoin(profile, eq(profile.id, changelog.operatorId));

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
    id: number | null;
    lastName: string | null;
    firstName: string | null;
    status: string | null;
    rankTitle: string | null;
    adminPosition: string | null;
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
            title: rank.title,
        })
        .from(rank);

    const uniqueValues = uniqueRows.map(({ title }) => title);
    return uniqueValues;
}

export async function getAllAdminPositions() {
    const uniqueRows = await db
        .select({
            title: adminPosition.title,
        })
        .from(adminPosition);

    const uniqueValues = uniqueRows.map(({ title }) => title);
    return uniqueValues;
}

// TODO: still need to differentiate between user and faculty id
export async function getFacultyRecordChangelogs(facultyid: number, limit: number, offset: number) {
    const changelogs = await db
        .select({
            timestamp: changelog.timestamp,
            email: profile.email,
            info: changelog.operation,
        })
        .from(changelog)
        .where(eq(changelog.tupleId, facultyid))
        .innerJoin(profile, eq(profile.id, changelog.operatorId))
        .limit(limit)
        .offset(offset) // for pages if needed.
        .orderBy(desc(changelog.timestamp));

    return changelogs;
}
