import { and, asc, desc, eq, gt, lt, ne, or, type SQL, type SQLWrapper } from 'drizzle-orm';

import type { FilterColumn } from '$lib/types/filter';

import { db } from './db';

import {
    appuser,
    changelog,
    role,
    userinfo,
} from './db/schema';

const pageSize = 50;

export async function getAccountList(
    currentUserId: string,
    filterMap: FilterColumn[],
    cursor?: number,
    isNext: boolean = true,
    initLoad: boolean = false,
) {
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
            userid: appuser.id,
            userinfoid: userinfo.userinfoid,
            email: appuser.email,
            role: userinfo.role,
            latestchangelogid: userinfo.latestchangelogid,
        })
        .from(appuser)
        .leftJoin(userinfo, eq(userinfo.userid, appuser.id))
        .where(
            and(
                ne(appuser.id, currentUserId),
                cursor
                    ? isNext
                        ? gt(userinfo.userinfoid, cursor)
                        : lt(userinfo.userinfoid, cursor)
                    : // eslint-disable-next-line no-undefined -- can't use null in Drizzle WHERE queries
                      undefined,
                and(...filterQueries),
            ),
        )
        .orderBy(isNext ? asc(userinfo.userinfoid) : desc(userinfo.userinfoid))
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
        .orderBy(isNext ? asc(userCountSq.userinfoid) : desc(userCountSq.userinfoid))
        .limit(pageSize)
        .as('user_sq');

    // Get cursors
    let [firstId] = await db
        .select({
            value: userSq.userinfoid,
        })
        .from(userSq)
        .orderBy(asc(userSq.userinfoid))
        .limit(1);

    let [lastId] = await db
        .select({
            value: userSq.userinfoid,
        })
        .from(userSq)
        .orderBy(desc(userSq.userinfoid))
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
        .leftJoin(changelog, eq(changelog.logid, userSq.latestchangelogid))
        .leftJoin(appuser, eq(appuser.id, changelog.userid));

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

export async function getAllRoles() {
    const uniqueRows = await db
        .select({
            role: role.role,
        })
        .from(role);

    const uniqueValues = uniqueRows.map(({ role }) => role);
    return uniqueValues;
}
