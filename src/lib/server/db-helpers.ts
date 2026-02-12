import { desc, eq, ne } from 'drizzle-orm';

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
            timestamp: new Date().toISOString(),
            userid: makerid,
            tupleid,
            operation,
        })
        .returning({ id: changelog.logid });

    const [{ id: logid }, _] = logids;

    return logid;
}

export async function makeUser(makerid: string, id: string, role: string) {
    // Actual action
    const returnedIds = await db
        .insert(userinfo)
        .values({
            userid: id,
            role,
        })
        .returning({ id: userinfo.userinfoid });

    // Log!
    const [{ id: tupleid }, _] = returnedIds;

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

export async function getFacultyRecordList() {
    const [currentSemester] = await db
        .select({
            acadsemesterid: semester.acadsemesterid,
        })
        .from(semester)
        .orderBy(desc(semester.academicyear))
        .limit(1);

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
        .from(rank)
        .rightJoin(facultyrank, eq(facultyrank.rankid, rank.rankid))
        .rightJoin(facultysemester, eq(facultysemester.currentrankid, facultyrank.facultyrankid))
        .rightJoin(faculty, eq(faculty.facultyid, facultysemester.facultyid))
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
        .where(eq(facultysemester.acadsemesterid, currentSemester.acadsemesterid));

    return shownFields;
}

export async function getAccountList(currentUserId: string) {
    const userSq = db
        .select({
            userid: appuser.id,
            email: appuser.email,
            role: userinfo.role,
            latestchangelogid: userinfo.latestchangelogid,
        })
        .from(appuser)
        .leftJoin(userinfo, eq(userinfo.userid, appuser.id))
        .where(ne(appuser.id, currentUserId))
        .as('user_sq');

    const changelogSq = db
        .select({
            logid: changelog.logid,
            timestamp: changelog.timestamp,
            maker: appuser.email,
            operation: changelog.operation,
        })
        .from(changelog)
        .leftJoin(appuser, eq(appuser.id, changelog.userid))
        .as('changelog_sq');

    const shownFields = await db
        .select({
            userid: userSq.userid,
            email: userSq.email,
            role: userSq.role,
            logTimestamp: changelogSq.timestamp,
            logMaker: changelogSq.maker,
            logOperation: changelogSq.operation,
        })
        .from(userSq)
        .leftJoin(changelogSq, eq(changelogSq.logid, userSq.latestchangelogid));

    return shownFields;
}

export async function areYouHere(email: string) {
    const you = await db.select().from(appuser).where(eq(appuser.email, email));

    return you.length !== 0;
}
