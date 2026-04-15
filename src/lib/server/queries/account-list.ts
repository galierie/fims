import { and, asc, desc, eq, gt, ilike, lt, ne, or, type SQL, type SQLWrapper } from 'drizzle-orm';

import type { FilterColumn } from '$lib/types/filter';

import { accountSearchView, changelog, profile, profileInfo, role } from '../db/schema';
import { db } from '../db';
import { logChange } from './db-helpers';
import { alias } from 'drizzle-orm/pg-core';

const pageSize = 50;

// Sort keywords
const sortMaps: Map<string, SQL[]> = new Map();

sortMaps.set('asc-email', [asc(profile.email)]);
sortMaps.set('desc-email', [desc(profile.email)]);

export async function getAccountList(
    currentUserId: string,
    searchTerm: string | null,
    filterMap: FilterColumn[],
    sortBys: string[],
    cursor?: number,
    isNext: boolean = true,
    initLoad: boolean = false,
) {
    // Search in search table all profiles affected
    const searchSq = await db
        .select({
            id: accountSearchView.id,
        })
        .from(accountSearchView)
        .where(searchTerm ? ilike(accountSearchView.searchcontent, `%${searchTerm}%`) : undefined)
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

    // Process sorting order
    let sortOrder: Array<SQL> = [];
    sortBys.forEach((rawSortKey) => {
        let sortKey = rawSortKey;

        if (!isNext) {
            const [keyOrder, ...keyArr] = sortKey.split('-');
            if (typeof keyOrder === 'undefined') return;
            if (keyArr.length === 0) return;

            const flipOrder = keyOrder === 'asc' ? 'desc' : 'asc';
            sortKey = [flipOrder, ...keyArr].join('-');
        }

        const orders = sortMaps.get(sortKey);
        if (typeof orders === 'undefined') return;
        sortOrder = [...sortOrder, ...orders];
    });
    sortOrder.push(isNext ? asc(profileInfo.id) : desc(profileInfo.id));

    // Get accounts from database
    const operator = alias(profile, 'operator');
    const shownFields = await db
        .select({
            id: searchSq.id,
            email: profile.email,
            role: profileInfo.role,
            logTimestamp: changelog.timestamp,
            logMaker: operator.email,
            logOperation: changelog.operation,
        })
        .from(profile)
        .rightJoin(searchSq, eq(searchSq.id, profile.id))
        .leftJoin(profileInfo, eq(profileInfo.profileId, profile.id))
        .leftJoin(changelog, eq(changelog.id, profileInfo.latestChangelogId))
        .leftJoin(operator, eq(operator.id, changelog.operatorId))
        .where(
            and(
                ne(profile.id, currentUserId),
                cursor
                    ? isNext
                        ? gt(profileInfo.id, cursor)
                        : lt(profileInfo.id, cursor)
                    : // eslint-disable-next-line no-undefined -- can't use null in Drizzle WHERE queries
                      undefined,
                and(...filterQueries),
            ),
        )
        .orderBy(...sortOrder)
        .limit(pageSize + 1);

    // Check if there is a previous/next page

    const profileCount = shownFields.length;
    const isTooMuch = profileCount > pageSize;

    const hasPrev = isNext ? !initLoad : isTooMuch;
    const hasNext = isNext ? isTooMuch : true;

    // Reverse faculty list if previous page
    if (!isNext) shownFields.reverse();

    // Chop off the extra record if isTooMuch
    if (isTooMuch) shownFields.pop();

    // Get cursors
    const [firstId, , lastId] = shownFields;

    return {
        accountList: shownFields,
        prevCursor: firstId?.id,
        nextCursor: lastId?.id,
        hasPrev,
        hasNext,
    };
}

export interface AccountDTO {
    email: string | null;
    role: string | null;
    id: string;
    logTimestamp: Date | null;
    logOperation: string | null;
    logMaker: string | null;
}

export async function refreshAccountSearchView() {
    // NOTE: Have faith na lang that this doesn't take too long
    await db.refreshMaterializedView(accountSearchView);
}

export async function getAllRoles() {
    const uniqueRows = await db
        .select({
            role: role.role,
        })
        .from(role);

    const uniqueValues = uniqueRows.map(({ role }) => role);
    return uniqueValues;
}

export async function changeRole(operatorId: string, id: string, role: string) {
    // Actual action
    const returnedIds = await db
        .update(profileInfo)
        .set({
            role: role,
        })
        .where(eq(profileInfo.profileId, id))
        .returning();

    if (returnedIds.length === 0) return { success: false };

    // Log!
    const [{ id: tupleId }, _] = returnedIds;

    const logid = await logChange(operatorId, tupleId, 'Changed account role.');

    await db
        .update(profileInfo)
        .set({
            latestChangelogId: logid,
        })
        .where(eq(profileInfo.id, tupleId));

    return { success: true };
}
