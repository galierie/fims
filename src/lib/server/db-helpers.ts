import { eq, desc } from 'drizzle-orm';

import { db } from './db';

import { role, userrole, faculty, facultyadminposition, adminposition, semester, rank, facultysemester, facultyrank } from './db/schema';

export async function assignRole(id: string, role: string) {
    await db.insert(userrole).values({
        userid: id,
        role,
    });

    return { success: true };
}

export async function getRole(id: string) {
    const [fetchedUser] = await db.select().from(userrole).where(eq(userrole.userid, id)).limit(1);

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
        })
        .from(rank)
        .rightJoin(
            facultyrank,
            eq(facultyrank.rankid, rank.rankid)
        )
        .rightJoin(
            facultysemester,
            eq(facultysemester.currentrankid, facultyrank.facultyrankid)
        )
        .rightJoin(
            faculty,
            eq(faculty.facultyid, facultysemester.facultyid)
        )
        .leftJoin(
            facultyadminposition,
            eq(facultyadminposition.facultysemesterid, facultysemester.facultysemesterid)
        )
        .leftJoin(
            adminposition,
            eq(adminposition.adminpositionid, facultyadminposition.adminpositionid)
        )
        .where(eq(facultysemester.acadsemesterid, currentSemester.acadsemesterid));
    
    return shownFields;
}
