import { and, asc, desc, eq, gt, ilike, inArray, lt, ne, or } from 'drizzle-orm';

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
    role,
    semester,
    userinfo,
} from './db/schema';

export async function logChange(makerid: string, tupleid: number, operation: string) {
    const logids = await db
        .insert(changelog)
        .values({
            userid: makerid,
            tupleid,
            operation,
            timestamp: new Date(),
        })
        .returning();

    const [{ logid }, _] = logids;

    return logid;
}

export async function makeUserInfo(makerid: string, id: string, role: string) {
    // Actual action
    const returnedIds = await db
        .insert(userinfo)
        .values({
            userid: id,
            role,
        })
        .returning();

    // Log!
    const [{ userinfoid: tupleid }, _] = returnedIds;

    const logid = await logChange(makerid, tupleid, 'Made account.');

    await db
        .update(userinfo)
        .set({
            latestchangelogid: logid,
        })
        .where(eq(userinfo.userinfoid, tupleid));

    return { success: true };
}

export async function getRole(id: string) {
    const [fetchedUser] = await db.select().from(userinfo).where(eq(userinfo.userid, id)).limit(1);

    return fetchedUser.role;
}

export async function getPermissions(userRole: string) {
    const [fetchedRole] = await db.select().from(role).where(eq(role.role, userRole)).limit(1);

    return fetchedRole;
}

export async function getFacultyRecordList(searchQuery: string = '') {
    // find the absolute latest semester
    const [latestSemester] = await db
        .select({
            acadsemesterid: semester.acadsemesterid,
        })
        .from(semester)
        .orderBy(desc(semester.academicyear), desc(semester.semester))
        .limit(1);

    // fallback ID in case the semester table is completely empty
    const latestSemesterId = latestSemester?.acadsemesterid ?? -1;

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
                eq(facultysemester.acadsemesterid, latestSemesterId), // Match only the latest semester
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
            and(
                eq(facultysemester.acadsemesterid, latestSemester.acadsemesterid),
                searchCondition,
            ),
        );

    return shownFields;
}

const pageSize = 50;

export async function getAccountList(
    currentUserId: string,
    cursor?: number,
    isNext: boolean = true,
    initLoad: boolean = false,
) {
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
    const appuserSq = await db
        .select({
            userid: appuser.id,
            email: appuser.email,
        })
        .from(appuser)
        .as('appuser_sq');

    const shownFields = await db
        .select({
            userid: userSq.userid,
            email: userSq.email,
            role: userSq.role,
            logTimestamp: changelog.timestamp,
            logMaker: appuserSq.email,
            logOperation: changelog.operation,
        })
        .from(userSq)
        .leftJoin(changelog, eq(changelog.logid, userSq.latestchangelogid))
        .leftJoin(appuserSq, eq(appuserSq.userid, changelog.userid));

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
            role: role.role
        })
        .from(role);
    
    const uniqueValues = uniqueRows.map(({ role }) => role);
    return uniqueValues;
}

export async function areYouHere(email: string) {
    const you = await db.select().from(appuser).where(eq(appuser.email, email));

    return you.length !== 0;
}

export async function deleteFacultyRecords(ids: number[]) {
    if (!ids || ids.length === 0) return { success: false };
    await db.delete(faculty).where(inArray(faculty.facultyid, ids));

    return { success: true };
}
