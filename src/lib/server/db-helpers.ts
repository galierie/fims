import { and, desc, eq, ilike, inArray, or } from 'drizzle-orm';

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

    if (returnedIds.length === 0) return { success: false };

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

export async function deleteUsersInfo(makerid: string, userids: string[]) {
    if (!userids || userids.length === 0) return { success: false };

    // Actual action
    const returnedIds = await db
        .delete(userinfo)
        .where(inArray(userinfo.userid, userids))
        .returning();

    if (returnedIds.length === 0) return { success: false };

    // Log!
    returnedIds.forEach(async ({ userinfoid: tupleid }) => {
        await logChange(makerid, tupleid, 'Deleted account.');
    });

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
            and(eq(facultysemester.acadsemesterid, latestSemester.acadsemesterid), searchCondition),
        );

    return shownFields;
}

export async function areYouHere(email: string) {
    const you = await db.select().from(appuser).where(eq(appuser.email, email));

    return you.length !== 0;
}

export async function deleteFacultyRecords(makerid: string, ids: number[]) {
    if (!ids || ids.length === 0) return { success: false };

    // Actual action
    const returnedIds = await db.delete(faculty).where(inArray(faculty.facultyid, ids)).returning();

    if (returnedIds.length === 0) return { success: false };

    // Log!
    returnedIds.forEach(async ({ facultyid: tupleid }) => {
        await logChange(makerid, tupleid, 'Deleted account.');
    });

    return { success: true };
}
