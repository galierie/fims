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

// Sort keywords
const sortMaps: Map<string, SQL[]> = new Map();

sortMaps.set('asc-full-name', [asc(faculty.lastName), asc(faculty.firstName), asc(faculty.middleName)]);
sortMaps.set('desc-full-name', [desc(faculty.lastName), desc(faculty.firstName), desc(faculty.middleName)]);

sortMaps.set('asc-status', [asc(faculty.status)])
sortMaps.set('desc-status', [desc(faculty.status)])

sortMaps.set('asc-rank', [asc(rank.title)]);
sortMaps.set('desc-rank', [desc(rank.title)]);

export async function getFacultyRecordList(
    searchTerm: string | null,
    filterMap: FilterColumn[],
    sortBys: string[],
    cursor?: number,
    isNext: boolean = true,
    initLoad: boolean = false,
) {
    // Get entries for the current AcademicSemester
    // Get latest AcademicSemester (including Midyear) from relation academic_semester
    const [latestAcademicSemester] = await db
        .select({
            academicSemesterid: academicSemester.id,
        })
        .from(academicSemester)
        .orderBy(desc(academicSemester.academicYear), desc(academicSemester.semesterNumber))
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

    // Adding missing sort mappings
    sortMaps.set('asc-admin-position', [asc(adminPositionSq.title)]);
    sortMaps.set('desc-admin-position', [desc(adminPositionSq.title)]);

    // Process sorting order
    let sortOrder: Array<SQL> = [];
    sortBys.forEach(rawSortKey => {
        let sortKey = rawSortKey;

        if (!isNext) {
            const [keyOrder, ...keyArr] = sortKey.split('-');
            if (typeof keyOrder === 'undefined') return;
            if (keyArr.length === 0) return;

            const flipOrder = (keyOrder === 'asc') ? 'desc' : 'asc';
            sortKey = [flipOrder, ...keyArr].join('-');
        }

        const orders = sortMaps.get(sortKey);
        if (typeof orders === 'undefined') return;
        sortOrder = [...sortOrder, ...orders];
    });
    sortOrder.push(isNext ? asc(faculty.id) : desc(faculty.id));

    // Get faculty records from database
    const shownFields = await db
        .select({
            id: faculty.id,
            lastName: faculty.lastName,
            firstName: faculty.firstName,
            status: faculty.status,
            rankTitle: rank.title,
            adminPosition: adminPositionSq.title,
            logTimestamp: changelog.timestamp,
            logMaker: profile.email,
            logOperation: changelog.operation,
        })
        .from(faculty)
        .rightJoin(searchSq, eq(searchSq.id, faculty.id))
        .leftJoin(
            facultyAcademicSemester,
            and(
                eq(facultyAcademicSemester.facultyId, faculty.id),
                eq(facultyAcademicSemester.academicSemesterId, currentAcademicSemesterId),
            ),
        )
        .leftJoin(facultyRank, eq(facultyRank.id, facultyAcademicSemester.currentRankId))
        .leftJoin(rank, eq(rank.id, facultyRank.rankId))
        .leftJoin(
            adminPositionSq,
            eq(adminPositionSq.facultyAcademicSemesterId, facultyAcademicSemester.id),
        )
        .leftJoin(changelog, eq(changelog.id, faculty.latestChangelogId))
        .leftJoin(profile, eq(profile.id, changelog.operatorId))
        .where(and(cursorFilter, and(...filterQueries)))
        .orderBy(...sortOrder)
        .limit(pageSize + 1);

    // Check if there is a previous/next page

    const facultyRecordCount = shownFields.length;
    const isTooMuch = facultyRecordCount > pageSize;

    const hasPrev = (isNext) ? !initLoad : isTooMuch;
    const hasNext = (isNext) ? isTooMuch : true;

    // Reverse faculty list if previous page
    if (!isNext) shownFields.reverse();

    // Chop off the extra record if isTooMuch
    if (isTooMuch)
        shownFields.pop();

    // Get cursors
    const [firstId, , lastId] = shownFields;

    return {
        facultyRecordList: shownFields,
        prevCursor: firstId?.id,
        nextCursor: lastId?.id,
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
