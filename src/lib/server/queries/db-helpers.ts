import { and, eq, inArray } from 'drizzle-orm';

import {
    adminposition,
    appuser,
    changelog,
    course,
    faculty,
    facultyadminposition,
    facultyadminwork,
    facultycommmembership,
    facultycontactnumber,
    facultycourse,
    facultyeducationalattainment,
    facultyemail,
    facultyextension,
    facultyfieldofinterest,
    facultyhomeaddress,
    facultymentoring,
    facultyrank,
    facultyresearch,
    facultysemester,
    facultystudyload,
    fieldofinterest,
    office,
    rank,
    research,
    role,
    semester,
    student,
    userinfo,
} from '../db/schema';
import { db } from '../db';

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
        await logChange(makerid, tupleid, 'Deleted record.');
    });

    return { success: true };
}

// Helper function to sequentially process dynamic table operations
async function processDynamicTable(
    tableRef: any,
    idColumn: any,
    data: { create: any[]; update: any[]; delete: number[] },
    mapCreate: (item: any) => any,
    mapUpdate: (item: any) => any,
) {
    if (data.delete.length > 0) await db.delete(tableRef).where(inArray(idColumn, data.delete));

    for (const item of data.update)
        await db.update(tableRef).set(mapUpdate(item)).where(eq(idColumn, item.tupleid));

    if (data.create.length > 0) await db.insert(tableRef).values(data.create.map(mapCreate));
}

export async function updateFacultyProfileRecords(
    facultyid: number,
    basicProfile: any,
    dynamicTables: any,
) {
    try {
        const parseNum = (val: any) => (val ? parseInt(val, 10) || null : null);

        await db.update(faculty).set(basicProfile).where(eq(faculty.facultyid, facultyid));

        await processDynamicTable(
            facultyemail,
            facultyemail.facultyemailid,
            dynamicTables.emails,
            (e) => ({ facultyid, email: e.emails }),
            (e) => ({ email: e.emails }),
        );

        await processDynamicTable(
            facultycontactnumber,
            facultycontactnumber.facultycontactnumberid,
            dynamicTables.contactNumbers,
            (c) => ({ facultyid, contactnumber: c['contact-numbers'] }),
            (c) => ({ contactnumber: c['contact-numbers'] }),
        );

        await processDynamicTable(
            facultyhomeaddress,
            facultyhomeaddress.facultyhomeaddressid,
            dynamicTables.homeAddresses,
            (h) => ({ facultyid, homeaddress: h['home-addresses'] }),
            (h) => ({ homeaddress: h['home-addresses'] }),
        );

        await processDynamicTable(
            facultyeducationalattainment,
            facultyeducationalattainment.facultyeducationalattainmentid,
            dynamicTables.educationalAttainments,
            (ea) => ({
                facultyid,
                degree: ea['educational-attainment-degree'],
                institution: ea['educational-attainment-institution'],
                graduationyear: parseNum(ea['educational-attainment-gradyear']),
            }),
            (ea) => ({
                degree: ea['educational-attainment-degree'],
                institution: ea['educational-attainment-institution'],
                graduationyear: parseNum(ea['educational-attainment-gradyear']),
            }),
        );

        // Process Tables with Foreign Keys (Dropdowns)
        const dbFieldsOfInterest = await db.select().from(fieldofinterest);
        const getFieldId = (fieldName: string) =>
            dbFieldsOfInterest.find((f) => f.field === fieldName)?.fieldofinterestid || null;

        await processDynamicTable(
            facultyfieldofinterest,
            facultyfieldofinterest.facultyfieldofinterestid,
            dynamicTables.fieldsOfInterest,
            (f) => ({ facultyid, fieldofinterestid: getFieldId(f['fields-of-interest']) }),
            (f) => ({ fieldofinterestid: getFieldId(f['fields-of-interest']) }),
        );

        const dbRanks = await db.select().from(rank);
        const getRankId = (rankTitle: string) =>
            dbRanks.find((r) => r.ranktitle === rankTitle)?.rankid || null;

        await processDynamicTable(
            facultyrank,
            facultyrank.facultyrankid,
            dynamicTables.promotionHistory,
            (p) => ({
                facultyid,
                rankid: getRankId(p['promotion-history-rank']),
                appointmentstatus: p['promotion-history-appointment-status'],
                dateoftenureorrenewal: p['promotion-history-date'] || null,
            }),
            (p) => ({
                rankid: getRankId(p['promotion-history-rank']),
                appointmentstatus: p['promotion-history-appointment-status'],
                dateoftenureorrenewal: p['promotion-history-date'] || null,
            }),
        );

        return { success: true };
    } catch {
        return { success: false };
    }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function createFacultyProfileRecords(basicProfile: any, dynamicTables: any) {
    /* eslint-enable @typescript-eslint/no-explicit-any */
    try {
        function parseNum(val: unknown) {
            if (typeof val === 'string') return parseInt(val, 10) || null;
            if (typeof val === 'number') return val;
            return null;
        }

        const [newFaculty] = await db.insert(faculty).values(basicProfile).returning();
        const facultyid = newFaculty.facultyid;

        await processDynamicTable(
            facultyemail,
            facultyemail.facultyemailid,
            dynamicTables.emails,
            (e) => ({ facultyid, email: e.emails }),
            (e) => ({ email: e.emails }),
        );

        await processDynamicTable(
            facultycontactnumber,
            facultycontactnumber.facultycontactnumberid,
            dynamicTables.contactNumbers,
            (c) => ({ facultyid, contactnumber: c['contact-numbers'] }),
            (c) => ({ contactnumber: c['contact-numbers'] }),
        );

        await processDynamicTable(
            facultyhomeaddress,
            facultyhomeaddress.facultyhomeaddressid,
            dynamicTables.homeAddresses,
            (h) => ({ facultyid, homeaddress: h['home-addresses'] }),
            (h) => ({ homeaddress: h['home-addresses'] }),
        );

        await processDynamicTable(
            facultyeducationalattainment,
            facultyeducationalattainment.facultyeducationalattainmentid,
            dynamicTables.educationalAttainments,
            (ea) => ({
                facultyid,
                degree: ea['educational-attainment-degree'],
                institution: ea['educational-attainment-institution'],
                graduationyear: parseNum(ea['educational-attainment-gradyear']),
            }),
            (ea) => ({
                degree: ea['educational-attainment-degree'],
                institution: ea['educational-attainment-institution'],
                graduationyear: parseNum(ea['educational-attainment-gradyear']),
            }),
        );

        const dbFieldsOfInterest = await db.select().from(fieldofinterest);
        function getFieldId(fieldName: string) {
            return dbFieldsOfInterest.find((f) => f.field === fieldName)?.fieldofinterestid ?? null;
        }

        await processDynamicTable(
            facultyfieldofinterest,
            facultyfieldofinterest.facultyfieldofinterestid,
            dynamicTables.fieldsOfInterest,
            (f) => ({ facultyid, fieldofinterestid: getFieldId(f['fields-of-interest']) }),
            (f) => ({ fieldofinterestid: getFieldId(f['fields-of-interest']) }),
        );

        const dbRanks = await db.select().from(rank);
        function getRankId(rankTitle: string) {
            return dbRanks.find((r) => r.ranktitle === rankTitle)?.rankid ?? null;
        }

        await processDynamicTable(
            facultyrank,
            facultyrank.facultyrankid,
            dynamicTables.promotionHistory,
            (p) => ({
                facultyid,
                rankid: getRankId(p['promotion-history-rank']),
                appointmentstatus: p['promotion-history-appointment-status'],
                dateoftenureorrenewal: p['promotion-history-date'] || null,
            }),
            (p) => ({
                rankid: getRankId(p['promotion-history-rank']),
                appointmentstatus: p['promotion-history-appointment-status'],
                dateoftenureorrenewal: p['promotion-history-date'] || null,
            }),
        );

        return { success: true, facultyid };
    } catch {
        return { success: false, facultyid: null };
    }
}

export async function updateSemestralRecords(
    facultyid: number,
    acadYear: number,
    semNum: number,
    basicSemestralData: any,
    dynamicTables: any,
) {
    try {
        const parseNum = (val: any) => (val ? parseFloat(val) || 0 : 0);

        let acadsemesterid: number;
        const existingSemester = await db
            .select()
            .from(semester)
            .where(and(eq(semester.academicyear, acadYear), eq(semester.semester, semNum)))
            .limit(1);

        if (existingSemester.length > 0) {
            acadsemesterid = existingSemester[0].acadsemesterid;
        } else {
            const newSem = await db
                .insert(semester)
                .values({ academicyear: acadYear, semester: semNum })
                .returning();
            acadsemesterid = newSem[0].acadsemesterid;
        }

        let currentrankid = null;
        if (basicSemestralData.currentRankTitle) {
            const rankRes = await db
                .select({ id: facultyrank.facultyrankid })
                .from(facultyrank)
                .leftJoin(rank, eq(rank.rankid, facultyrank.rankid))
                .where(
                    and(
                        eq(facultyrank.facultyid, facultyid),
                        eq(rank.ranktitle, basicSemestralData.currentRankTitle),
                    ),
                )
                .limit(1);
            if (rankRes.length > 0) currentrankid = rankRes[0].id;
        }

        let currenthighesteducationalattainmentid = null;
        if (basicSemestralData.currentHighestDegree) {
            const eduRes = await db
                .select({ id: facultyeducationalattainment.facultyeducationalattainmentid })
                .from(facultyeducationalattainment)
                .where(
                    and(
                        eq(facultyeducationalattainment.facultyid, facultyid),
                        eq(
                            facultyeducationalattainment.degree,
                            basicSemestralData.currentHighestDegree,
                        ),
                    ),
                )
                .limit(1);
            if (eduRes.length > 0) currenthighesteducationalattainmentid = eduRes[0].id;
        }

        // Create/Update Faculty Semester
        let facultysemesterid: number;
        const existingFacSem = await db
            .select()
            .from(facultysemester)
            .where(
                and(
                    eq(facultysemester.facultyid, facultyid),
                    eq(facultysemester.acadsemesterid, acadsemesterid),
                ),
            )
            .limit(1);

        if (existingFacSem.length > 0) {
            facultysemesterid = existingFacSem[0].facultysemesterid;
            await db
                .update(facultysemester)
                .set({
                    currentrankid,
                    currenthighesteducationalattainmentid,
                    remarks: basicSemestralData.remarks,
                })
                .where(eq(facultysemester.facultysemesterid, facultysemesterid));
        } else {
            const newFacSem = await db
                .insert(facultysemester)
                .values({
                    facultyid,
                    acadsemesterid,
                    currentrankid,
                    currenthighesteducationalattainmentid,
                    remarks: basicSemestralData.remarks,
                })
                .returning();
            facultysemesterid = newFacSem[0].facultysemesterid;
        }

        // Fetch foreign key mappings
        const dbAdminPositions = await db.select().from(adminposition);
        const getAdminPosId = (name: string) =>
            dbAdminPositions.find((a) => a.name === name)?.adminpositionid || null;

        const dbOffices = await db.select().from(office);
        const getOfficeId = (name: string) =>
            dbOffices.find((o) => o.name === name)?.officeid || null;

        const dbCourses = await db.select().from(course);
        const getCourseId = (name: string) =>
            dbCourses.find((c) => c.coursename === name)?.courseid || null;

        const dbResearches = await db.select().from(research);
        const getResearchId = (title: string) =>
            dbResearches.find((r) => r.title === title)?.researchid || null;

        // Find or Create Student for Mentoring
        const resolveStudent = async (last: string, first: string, middle: string) => {
            if (!last || !first) return null;
            const [existing] = await db
                .select()
                .from(student)
                .where(
                    and(
                        eq(student.lastname, last),
                        eq(student.firstname, first),
                        eq(student.middlename, middle || ''),
                    ),
                )
                .limit(1);

            if (existing) return existing.studentnumber;

            const [newStudent] = await db
                .insert(student)
                .values({ lastname: last, firstname: first, middlename: middle || '' })
                .returning();
            return newStudent.studentnumber;
        };

        // Prepare student IDs before processing the table
        for (const item of [...dynamicTables.mentees.create, ...dynamicTables.mentees.update])
            item.resolvedStudentId = await resolveStudent(
                item['mentee-lastname'],
                item['mentee-firstname'],
                item['mentee-middlename'],
            );

        // Process dynamic tables

        // Admin
        await processDynamicTable(
            facultyadminposition,
            facultyadminposition.facultyadminpositionid,
            dynamicTables.adminPositions,
            (a) => ({
                facultysemesterid,
                adminpositionid: getAdminPosId(a['administrative-position-title']),
                officeid: getOfficeId(a['administrative-position-office']),
                startdate: a['administrative-position-start-date'] || null,
                enddate: a['administrative-position-end-date'] || null,
                administrativeloadcredit: parseNum(a['administrative-position-load-credit']),
            }),
            (a) => ({
                adminpositionid: getAdminPosId(a['administrative-position-title']),
                officeid: getOfficeId(a['administrative-position-office']),
                startdate: a['administrative-position-start-date'] || null,
                enddate: a['administrative-position-end-date'] || null,
                administrativeloadcredit: parseNum(a['administrative-position-load-credit']),
            }),
        );

        await processDynamicTable(
            facultycommmembership,
            facultycommmembership.facultycommmembershipid,
            dynamicTables.committees,
            (c) => ({
                facultysemesterid,
                membership: c['committee-membership-nature'],
                committee: c['committee-membership-committee'],
                startdate: c['committee-membership-start-date'] || null,
                enddate: c['committee-membership-end-date'] || null,
                administrativeloadcredit: parseNum(c['committee-membership-load-credit']),
            }),
            (c) => ({
                membership: c['committee-membership-nature'],
                committee: c['committee-membership-committee'],
                startdate: c['committee-membership-start-date'] || null,
                enddate: c['committee-membership-end-date'] || null,
                administrativeloadcredit: parseNum(c['committee-membership-load-credit']),
            }),
        );

        await processDynamicTable(
            facultyadminwork,
            facultyadminwork.facultyadminworkid,
            dynamicTables.adminWorks,
            (aw) => ({
                facultysemesterid,
                natureofwork: aw['administrative-work-nature'],
                officeid: getOfficeId(aw['administrative-work-committee']),
                startdate: aw['administrative-work-start-date'] || null,
                enddate: aw['administrative-work-end-date'] || null,
                administrativeloadcredit: parseNum(aw['administrative-work-load-credit']),
            }),
            (aw) => ({
                natureofwork: aw['administrative-work-nature'],
                officeid: getOfficeId(aw['administrative-work-committee']),
                startdate: aw['administrative-work-start-date'] || null,
                enddate: aw['administrative-work-end-date'] || null,
                administrativeloadcredit: parseNum(aw['administrative-work-load-credit']),
            }),
        );

        // Teaching
        await processDynamicTable(
            facultycourse,
            facultycourse.facultycourseid,
            dynamicTables.courses,
            (c) => ({
                facultysemesterid,
                courseid: getCourseId(c['course-title']),
                section: c['course-section'],
                numberofstudents: c['course-num-of-students']
                    ? parseInt(c['course-num-of-students'])
                    : null,
                teachingloadcredit: parseNum(c['course-load-credit']),
                sectionset: parseNum(c['course-section-set']) || null,
            }),
            (c) => ({
                courseid: getCourseId(c['course-title']),
                section: c['course-section'],
                numberofstudents: c['course-num-of-students']
                    ? parseInt(c['course-num-of-students'])
                    : null,
                teachingloadcredit: parseNum(c['course-load-credit']),
                sectionset: parseNum(c['course-section-set']) || null,
            }),
        );

        await processDynamicTable(
            facultymentoring,
            facultymentoring.facultymentoringid,
            dynamicTables.mentees,
            (m) => ({
                facultysemesterid,
                studentnumber: m.resolvedStudentId,
                category: m['mentee-category'],
                startdate: m['mentee-start-date'] || null,
                enddate: m['mentee-end-date'] || null,
                teachingloadcredit: parseNum(m['mentee-load-credit']),
            }),
            (m) => ({
                studentnumber: m.resolvedStudentId,
                category: m['mentee-category'],
                startdate: m['mentee-start-date'] || null,
                enddate: m['mentee-end-date'] || null,
                teachingloadcredit: parseNum(m['mentee-load-credit']),
            }),
        );

        // Research
        await processDynamicTable(
            facultyresearch,
            facultyresearch.facultyresearchid,
            dynamicTables.research,
            (r) => ({
                facultysemesterid,
                researchid: getResearchId(r['research-title']),
                researchloadcredit: parseNum(r['research-load-credit']),
                remarks: r['research-remarks'],
            }),
            (r) => ({
                researchid: getResearchId(r['research-title']),
                researchloadcredit: parseNum(r['research-load-credit']),
                remarks: r['research-remarks'],
            }),
        );

        // Extension
        await processDynamicTable(
            facultyextension,
            facultyextension.facultyextensionid,
            dynamicTables.extension,
            (e) => ({
                facultysemesterid,
                natureofextension: e['extension-nature'],
                agency: e['extension-agency'],
                startdate: e['extension-start-date'] || null,
                enddate: e['extension-end-date'] || null,
                extensionloadcredit: parseNum(e['extension-load-credit']),
            }),
            (e) => ({
                natureofextension: e['extension-nature'],
                agency: e['extension-agency'],
                startdate: e['extension-start-date'] || null,
                enddate: e['extension-end-date'] || null,
                extensionloadcredit: parseNum(e['extension-load-credit']),
            }),
        );

        // Study load
        await processDynamicTable(
            facultystudyload,
            facultystudyload.facultystudyloadid,
            dynamicTables.studyLoad,
            (s) => ({
                facultysemesterid,
                degreeprogram: s['study-load-degree'],
                university: s['study-load-university'],
                studyloadunits: parseNum(s['study-load-units']),
                onfulltimeleavewithpay: s['study-load-on-leave-with-pay'],
                isfacultyfellowshiprecipient: s['study-load-fellowship-recipient'],
                studyloadcredit: parseNum(s['study-load-credit']),
            }),
            (s) => ({
                degreeprogram: s['study-load-degree'],
                university: s['study-load-university'],
                studyloadunits: parseNum(s['study-load-units']),
                onfulltimeleavewithpay: s['study-load-on-leave-with-pay'],
                isfacultyfellowshiprecipient: s['study-load-fellowship-recipient'],
                studyloadcredit: parseNum(s['study-load-credit']),
            }),
        );

        return { success: true };
    } catch {
        return { success: false };
    }
}
