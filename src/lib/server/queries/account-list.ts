import { and, asc, desc, eq, gt, ilike, lt, ne, or, type SQL, type SQLWrapper } from 'drizzle-orm';

import type { FilterColumn } from '$lib/types/filter';

import { accountSearchView, appuser, changelog, role, profileInfo } from '../db/schema';
import { db } from '../db';

const pageSize = 50;

export async function getAccountList(
    currentUserId: string,
    searchTerm: string | null,
    filterMap: FilterColumn[],
    cursor?: number,
    isNext: boolean = true,
    initLoad: boolean = false,
) {
    // Search in search table all appusers affected
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

    // Get accounts from database
    const userCountSq = await db
        .select({
            userid: searchSq.id,
            profileInfoId: profileInfo.id,
            email: appuser.email,
            role: profileInfo.role,
            latestChangelogId: profileInfo.latestChangelogId,
        })
        .from(appuser)
        .rightJoin(searchSq, eq(searchSq.id, appuser.id))
        .leftJoin(profileInfo, eq(profileInfo.profileId, appuser.id))
        .where(
            and(
                ne(appuser.id, currentUserId),
                cursor
                    ? isNext
                        ? gt(profileInfo.id, cursor)
                        : lt(profileInfo.id, cursor)
                    : // eslint-disable-next-line no-undefined -- can't use null in Drizzle WHERE queries
                      undefined,
                and(...filterQueries),
            ),
        )
        .orderBy(isNext ? asc(profileInfo.id) : desc(profileInfo.id))
        .limit(pageSize + 1)
        .as('usercount_sq');

    // Check if there is a previous/next page
    let hasPrev = !initLoad;
    let hasNext = true;

    const userCount = (await db.select().from(userCountSq)).length;

    if (isNext) hasNext = userCount > pageSize;
    else hasPrev = userCount > pageSize;

    // Chop off the extra record
    const userSq = await db
        .select()
        .from(userCountSq)
        .orderBy(isNext ? asc(userCountSq.profileInfoId) : desc(userCountSq.profileInfoId))
        .limit(pageSize)
        .as('user_sq');

    // Get cursors
    let [firstId] = await db
        .select({
            value: userSq.profileInfoId,
        })
        .from(userSq)
        .orderBy(asc(userSq.profileInfoId))
        .limit(1);

    let [lastId] = await db
        .select({
            value: userSq.profileInfoId,
        })
        .from(userSq)
        .orderBy(desc(userSq.profileInfoId))
        .limit(1);

    // Get changelogs
    const shownFields = await db
        .select({
            userid: userSq.userid,
            email: userSq.email,
            role: userSq.role,
            logTimestamp: changelog.timestamp,
            logMaker: appuser.email,
            logOperation: changelog.operation,
        })
        .from(userSq)
        .leftJoin(changelog, eq(changelog.id, userSq.latestChangelogId))
        .leftJoin(appuser, eq(appuser.id, changelog.operatorId));

    // Reverse account list and cursors if previous page
    if (!isNext) {
        [lastId, firstId] = [firstId, lastId];
        shownFields.reverse();
    }

    return {
        accountList: shownFields,
        prevCursor: firstId?.value,
        nextCursor: lastId?.value,
        hasPrev,
        hasNext,
    };
}

export interface AccountDTO {
    email: string | null;
    role: string | null;
    userid: string;
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
