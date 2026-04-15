import { and, eq, getTableName, inArray } from 'drizzle-orm';

import {
    academicSemester,
    adminPosition,
    changelog,
    course,
    faculty,
    facultyAcademicSemester,
    facultyAdminPosition,
    facultyAdminWork,
    facultyCommMembership,
    facultyContactNumber,
    facultyCourse,
    facultyEducationalAttainment,
    facultyEmail,
    facultyExtension,
    facultyFieldOfInterest,
    facultyHomeAddress,
    facultyMentoring,
    facultyRank,
    facultyResearch,
    facultyStudyLoad,
    fieldOfInterest,
    office,
    profile,
    profileInfo,
    rank,
    research,
    role,
    student,
} from '../db/schema';
import { db } from '../db';

export async function logChange(operatorId: string, tupleId: number, operation: string) {
    const logids = await db
        .insert(changelog)
        .values({
            operatorId,
            tupleId,
            operation,
            timestamp: new Date(),
        })
        .returning();

    const [{ id }, _] = logids;

    return id;
}

export async function makeProfileInfo(operatorId: string, id: string, role: string) {
    // Actual action
    const returnedIds = await db
        .insert(profileInfo)
        .values({
            profileId: id,
            role,
        })
        .returning();

    if (returnedIds.length === 0) return { success: false };

    // Log!
    const [{ id: tupleId }, _] = returnedIds;

    const logid = await logChange(operatorId, tupleId, 'Made account.');

    await db
        .update(profileInfo)
        .set({
            latestChangelogId: logid,
        })
        .where(eq(profileInfo.id, tupleId));

    return { success: true };
}

export async function deleteProfileInfo(operatorId: string, userids: string[]) {
    if (!userids || userids.length === 0) return { success: false };

    // Actual action
    const returnedIds = await db
        .delete(profileInfo)
        .where(inArray(profileInfo.profileId, userids))
        .returning();

    if (returnedIds.length === 0) return { success: false };

    // Log!
    returnedIds.forEach(async ({ id: tupleId }) => {
        await logChange(operatorId, tupleId, 'Deleted account.');
    });

    return { success: true };
}

export async function getUserRoleAndPermissions(profileId: string) {
    return await db
        .select({
            role: role.role,
            canAddAccount: role.canAddAccount,
            canModifyAccount: role.canModifyAccount,
            canAddFaculty: role.canAddFaculty,
            canModifyFaculty: role.canModifyFaculty,
            canViewChangelogs: role.canViewChangelogs,
        })
        .from(role)
        .innerJoin(profileInfo, eq(profileInfo.role, role.role))
        .where(eq(profileInfo.profileId, profileId))
        .limit(1);
}

export async function areYouHere(email: string) {
    const you = await db.select().from(profile).where(eq(profile.email, email));

    return you.length !== 0;
}

export async function deleteFacultyRecords(operatorId: string, ids: number[]) {
    if (!ids || ids.length === 0) return { success: false };

    // Actual action
    const returnedIds = await db.delete(faculty).where(inArray(faculty.id, ids)).returning();

    if (returnedIds.length === 0) return { success: false };

    // Log!
    returnedIds.forEach(async ({ id: tupleId }) => {
        await logChange(operatorId, tupleId, 'Deleted record.');
    });

    return { success: true };
}

// Helper function to sequentially process dynamic table operations
async function processDynamicTable(
    operatorId: string,
    facultyId: number,
    tableRef: any,
    idColumn: any,
    data: { create: any[]; update: any[]; delete: number[] },
    mapCreate: (item: any) => any,
    mapUpdate: (item: any) => any,
) {
    if (data.delete.length > 0) {
        await Promise.all([
            await db.delete(tableRef).where(inArray(idColumn, data.delete)),
            await logChange(operatorId, facultyId, `Deleted records with IDs ${data.delete.join(', ')} from ${getTableName(tableRef)}.`),
        ]);
    }

    for (const item of data.update)
        await Promise.all([
            await db.update(tableRef).set(mapUpdate(item)).where(eq(idColumn, item.tupleid)),
            await logChange(operatorId, facultyId, `Updated ${item.tupleid} from ${getTableName(tableRef)}.`),
        ]);

    if (data.create.length > 0)
        await Promise.all([
            await db.insert(tableRef).values(data.create.map(mapCreate)),
            await logChange(operatorId, facultyId, `Created tuples in ${getTableName(tableRef)}.`)
        ]);
}

export async function updateFacultyProfileRecords(
    operatorId: string,
    facultyId: number,
    basicProfile: any,
    dynamicTables: any,
) {
    try {
        const parseNum = (val: any) => (val ? parseInt(val, 10) || null : null);

        await db.update(faculty).set(basicProfile).where(eq(faculty.id, facultyId));

        await processDynamicTable(
            operatorId,
            facultyId,
            facultyEmail,
            facultyEmail.id,
            dynamicTables.emails,
            (e) => ({ facultyId, email: e.emails }),
            (e) => ({ email: e.emails }),
        );

        await processDynamicTable(
            operatorId,
            facultyId,
            facultyContactNumber,
            facultyContactNumber.id,
            dynamicTables.contactNumbers,
            (c) => ({ facultyId, contactNumber: c['contact-numbers'] }),
            (c) => ({ contactNumber: c['contact-numbers'] }),
        );

        await processDynamicTable(
            operatorId,
            facultyId,
            facultyHomeAddress,
            facultyHomeAddress.id,
            dynamicTables.homeAddresses,
            (h) => ({ facultyId, homeAddress: h['home-addresses'] }),
            (h) => ({ homeAddress: h['home-addresses'] }),
        );

        await processDynamicTable(
            operatorId,
            facultyId,
            facultyEducationalAttainment,
            facultyEducationalAttainment.id,
            dynamicTables.educationalAttainments,
            (ea) => ({
                facultyId,
                degree: ea['educational-attainment-degree'],
                institution: ea['educational-attainment-institution'],
                graduationYear: parseNum(ea['educational-attainment-gradyear']),
            }),
            (ea) => ({
                degree: ea['educational-attainment-degree'],
                institution: ea['educational-attainment-institution'],
                graduationYear: parseNum(ea['educational-attainment-gradyear']),
            }),
        );

        // Process Tables with Foreign Keys (Dropdowns)
        const dbFieldsOfInterest = await db.select().from(fieldOfInterest);

        const allProvidedFields = [
            ...dynamicTables.fieldsOfInterest.create,
            ...dynamicTables.fieldsOfInterest.update,
        ]
            .map((f) => f['fields-of-interest'])
            .filter((f) => f && f.trim() !== '');

        const existingFieldNames = new Set(dbFieldsOfInterest.map((f) => f.field));
        const newFields = [...new Set(allProvidedFields)].filter((f) => !existingFieldNames.has(f));

        if (newFields.length > 0) {
            const insertedFields = await db
                .insert(fieldOfInterest)
                .values(newFields.map((f) => ({ field: f })))
                .returning();
            dbFieldsOfInterest.push(...insertedFields);
        }

        const getFieldId = (fieldName: string) =>
            dbFieldsOfInterest.find((f) => f.field === fieldName)?.id || null;

        await processDynamicTable(
            operatorId,
            facultyId,
            facultyFieldOfInterest,
            facultyFieldOfInterest.id,
            dynamicTables.fieldsOfInterest,
            (f) => ({ facultyId, fieldOfInterestId: getFieldId(f['fields-of-interest']) }),
            (f) => ({ fieldOfInterestId: getFieldId(f['fields-of-interest']) }),
        );

        const dbRanks = await db.select().from(rank);
        const getRankId = (rankTitle: string) =>
            dbRanks.find((r) => r.title === rankTitle)?.id || null;

        const parseDate = (val: any) =>
            typeof val === 'string' && val.trim() !== '' ? new Date(val) : new Date();

        await processDynamicTable(
            operatorId,
            facultyId,
            facultyRank,
            facultyRank.id,
            dynamicTables.promotionHistory,
            (p) => ({
                facultyId,
                rankId: getRankId(p['promotion-history-rank']),
                appointmentStatus: p['promotion-history-appointment-status'],
                dateOfTenureOrRenewal: parseDate(p['promotion-history-date']),
            }),
            (p) => ({
                rankId: getRankId(p['promotion-history-rank']),
                appointmentStatus: p['promotion-history-appointment-status'],
                dateOfTenureOrRenewal: parseDate(p['promotion-history-date']),
            }),
        );

        return { success: true };
    } catch (error) {
        console.error('DB ERROR IN UPDATE:', error);
        return { success: false };
    }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function createFacultyProfileRecords(operatorId: string, basicProfile: any, dynamicTables: any) {
    /* eslint-enable @typescript-eslint/no-explicit-any */
    try {
        function parseNum(val: unknown) {
            if (typeof val === 'string') return parseInt(val, 10) || null;
            if (typeof val === 'number') return val;
            return null;
        }

        const [newFaculty] = await db.insert(faculty).values(basicProfile).returning();
        const { id: facultyId } = newFaculty;

        await processDynamicTable(
            operatorId,
            facultyId,
            facultyEmail,
            facultyEmail.id,
            dynamicTables.emails,
            (e) => ({ facultyId, email: e.emails }),
            (e) => ({ email: e.emails }),
        );

        await processDynamicTable(
            operatorId,
            facultyId,
            facultyContactNumber,
            facultyContactNumber.id,
            dynamicTables.contactNumbers,
            (c) => ({ facultyId, contactNumber: c['contact-numbers'] }),
            (c) => ({ contactNumber: c['contact-numbers'] }),
        );

        await processDynamicTable(
            operatorId,
            facultyId,
            facultyHomeAddress,
            facultyHomeAddress.id,
            dynamicTables.homeAddresses,
            (h) => ({ facultyId, homeAddress: h['home-addresses'] }),
            (h) => ({ homeAddress: h['home-addresses'] }),
        );

        await processDynamicTable(
            operatorId,
            facultyId,
            facultyEducationalAttainment,
            facultyEducationalAttainment.id,
            dynamicTables.educationalAttainments,
            (ea) => ({
                facultyId,
                degree: ea['educational-attainment-degree'],
                institution: ea['educational-attainment-institution'],
                graduationYear: parseNum(ea['educational-attainment-gradyear']),
            }),
            (ea) => ({
                degree: ea['educational-attainment-degree'],
                institution: ea['educational-attainment-institution'],
                graduationYear: parseNum(ea['educational-attainment-gradyear']),
            }),
        );

        const dbFieldsOfInterest = await db.select().from(fieldOfInterest);

        const allProvidedFields = [
            ...dynamicTables.fieldsOfInterest.create,
            ...dynamicTables.fieldsOfInterest.update,
        ]
            .map((f) => f['fields-of-interest'])
            .filter((f) => f && f.trim() !== '');

        const existingFieldNames = new Set(dbFieldsOfInterest.map((f) => f.field));
        const newFields = [...new Set(allProvidedFields)].filter((f) => !existingFieldNames.has(f));

        if (newFields.length > 0) {
            const insertedFields = await db
                .insert(fieldOfInterest)
                .values(newFields.map((f) => ({ field: f })))
                .returning();
            dbFieldsOfInterest.push(...insertedFields);
        }

        const getFieldId = (fieldName: string) =>
            dbFieldsOfInterest.find((f) => f.field === fieldName)?.id || null;

        await processDynamicTable(
            operatorId,
            facultyId,
            facultyFieldOfInterest,
            facultyFieldOfInterest.id,
            dynamicTables.fieldsOfInterest,
            (f) => ({ facultyId, fieldOfInterestId: getFieldId(f['fields-of-interest']) }),
            (f) => ({ fieldOfInterestId: getFieldId(f['fields-of-interest']) }),
        );

        const dbRanks = await db.select().from(rank);
        function getRankId(rankTitle: string) {
            return dbRanks.find((r) => r.title === rankTitle)?.id ?? null;
        }

        const parseDate = (val: any) =>
            typeof val === 'string' && val.trim() !== '' ? new Date(val) : new Date();

        await processDynamicTable(
            operatorId,
            facultyId,
            facultyRank,
            facultyRank.id,
            dynamicTables.promotionHistory,
            (p) => ({
                facultyId,
                rankId: getRankId(p['promotion-history-rank']),
                appointmentStatus: p['promotion-history-appointment-status'],
                dateOfTenureOrRenewal: parseDate(p['promotion-history-date']),
            }),
            (p) => ({
                rankId: getRankId(p['promotion-history-rank']),
                appointmentStatus: p['promotion-history-appointment-status'],
                dateOfTenureOrRenewal: parseDate(p['promotion-history-date']),
            }),
        );

        return { success: true, facultyId };
    } catch (error) {
        console.error('Database error in CREATE mode', error);
        return { success: false, facultyId: null };
    }
}

export async function updateSemestralRecords(
    operatorId: string,
    facultyId: number,
    acadYear: number,
    semNum: number,
    basicSemestralData: any,
    dynamicTables: any,
) {
    try {
        const parseNumStr = (val: any) => {
            if (val === null || val === undefined || val === '' || val === false) return "0";
            const parsed = parseFloat(val);
            return isNaN(parsed) ? "0" : parsed.toString();
        };

        const parseSetScore = (val: any) => {
            if (val === null || val === undefined || val === '' || val === false) return null;
            const parsed = parseFloat(val);
            return isNaN(parsed) ? null : parsed.toString();
        };

        const parseDate = (val: any) => {
            if (typeof val === 'string' && val.trim() !== '') return new Date(val);
            return null;
        };

        let academicSemesterId: number;
        const existingAcademicSemester = await db
            .select()
            .from(academicSemester)
            .where(
                and(
                    eq(academicSemester.academicYear, acadYear),
                    eq(academicSemester.semesterNumber, semNum),
                ),
            )
            .limit(1);

        if (existingAcademicSemester.length > 0) {
            academicSemesterId = existingAcademicSemester[0].id;
        } else {
            const newSem = await db
                .insert(academicSemester)
                .values({ academicYear: acadYear, semesterNumber: semNum })
                .returning();
            academicSemesterId = newSem[0].id;
        }

        let currentRankId = null;
        if (basicSemestralData.currentRankTitle) {
            const rankRes = await db
                .select({ id: facultyRank.id })
                .from(facultyRank)
                .leftJoin(rank, eq(rank.id, facultyRank.rankId))
                .where(
                    and(
                        eq(facultyRank.facultyId, facultyId),
                        eq(rank.title, basicSemestralData.currentRankTitle),
                    ),
                )
                .limit(1);
            if (rankRes.length > 0) currentRankId = rankRes[0].id;
        }

        let currentHighestEducationalAttainmentId = null;
        if (basicSemestralData.currentHighestDegree) {
            const eduRes = await db
                .select({ id: facultyEducationalAttainment.id })
                .from(facultyEducationalAttainment)
                .where(
                    and(
                        eq(facultyEducationalAttainment.facultyId, facultyId),
                        eq(
                            facultyEducationalAttainment.degree,
                            basicSemestralData.currentHighestDegree,
                        ),
                    ),
                )
                .limit(1);
            if (eduRes.length > 0) currentHighestEducationalAttainmentId = eduRes[0].id;
        }

        // Create/Update Faculty AcademicSemester
        let facultyAcademicSemesterId: number;
        const existingFacSem = await db
            .select()
            .from(facultyAcademicSemester)
            .where(
                and(
                    eq(facultyAcademicSemester.facultyId, facultyId),
                    eq(facultyAcademicSemester.academicSemesterId, academicSemesterId),
                ),
            )
            .limit(1);

        if (existingFacSem.length > 0) {
            facultyAcademicSemesterId = existingFacSem[0].id;
            await db
                .update(facultyAcademicSemester)
                .set({
                    currentRankId,
                    currentHighestEducationalAttainmentId,
                    remarks: basicSemestralData.remarks,
                })
                .where(eq(facultyAcademicSemester.id, facultyAcademicSemesterId));
        } else {
            const newFacSem = await db
                .insert(facultyAcademicSemester)
                .values({
                    facultyId,
                    academicSemesterId,
                    currentRankId,
                    currentHighestEducationalAttainmentId,
                    remarks: basicSemestralData.remarks,
                })
                .returning();
            facultyAcademicSemesterId = newFacSem[0].id;
        }

        // Fetch foreign key mappings
        const dbAdminPositions = await db.select().from(adminPosition);
        const getAdminPosId = (name: string) => {
            if (!name || name === '-') return null;
            return dbAdminPositions.find((a) => a.title.trim().toLowerCase() === name.trim().toLowerCase())?.id || null;
        };

        const dbOffices = await db.select().from(office);
        const getOfficeId = (name: string) => {
            if (!name || name === '-') return null;
            return dbOffices.find((o) => o.name.trim().toLowerCase() === name.trim().toLowerCase())?.id || null;
        };

        const dbCourses = await db.select().from(course);
        const getCourseId = (name: string) => {
            if (!name || name === '-') return null;
            return dbCourses.find((c) => c.name.trim().toLowerCase() === name.trim().toLowerCase())?.id || null;
        };

        const dbResearches = await db.select().from(research);
        const getResearchId = (title: string) => {
            if (!title || title === '-') return null;
            return dbResearches.find((r) => r.title.trim().toLowerCase() === title.trim().toLowerCase())?.id || null;
        };

        // Find or Create Student for Mentoring
        const resolveStudent = async (last: string, first: string, middle: string) => {
            if (!last || !first) return null;
            const [existing] = await db
                .select()
                .from(student)
                .where(
                    and(
                        eq(student.lastName, last),
                        eq(student.firstName, first),
                        eq(student.middleName, middle || ''),
                    ),
                )
                .limit(1);

            if (existing) return existing.id;

            const [newStudent] = await db
                .insert(student)
                .values({ lastName: last, firstName: first, middleName: middle || '' })
                .returning();
            return newStudent.id;
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
            operatorId,
            facultyId,
            facultyAdminPosition,
            facultyAdminPosition.id,
            dynamicTables.adminPositions,
            (a) => ({
                facultyAcademicSemesterId,
                adminPositionId: getAdminPosId(a['administrative-position-title']),
                officeId: getOfficeId(a['administrative-position-office']),
                startDate: parseDate(a['administrative-position-start-date']),
                endDate: parseDate(a['administrative-position-end-date']),
                administrativeLoadCredit: parseNumStr(a['administrative-position-load-credit']),
            }),
            (a) => ({
                adminPositionId: getAdminPosId(a['administrative-position-title']),
                officeId: getOfficeId(a['administrative-position-office']),
                startDate: parseDate(a['administrative-position-start-date']),
                endDate: parseDate(a['administrative-position-end-date']),
                administrativeLoadCredit: parseNumStr(a['administrative-position-load-credit']),
            }),
        );

        await processDynamicTable(
            operatorId,
            facultyId,
            facultyCommMembership,
            facultyCommMembership.id,
            dynamicTables.committees,
            (c) => ({
                facultyAcademicSemesterId,
                membership: c['committee-membership-nature'],
                committee: c['committee-membership-committee'],
                startDate: parseDate(c['committee-membership-start-date']),
                endDate: parseDate(c['committee-membership-end-date']),
                administrativeLoadCredit: parseNumStr(c['committee-membership-load-credit']),
            }),
            (c) => ({
                membership: c['committee-membership-nature'],
                committee: c['committee-membership-committee'],
                startDate: parseDate(c['committee-membership-start-date']),
                endDate: parseDate(c['committee-membership-end-date']),
                administrativeLoadCredit: parseNumStr(c['committee-membership-load-credit']),
            }),
        );

        await processDynamicTable(
            operatorId,
            facultyId,
            facultyAdminWork,
            facultyAdminWork.id,
            dynamicTables.adminWorks,
            (aw) => ({
                facultyAcademicSemesterId,
                natureOfWork: aw['administrative-work-nature'],
                officeId: getOfficeId(aw['administrative-work-committee']),
                startDate: parseDate(aw['administrative-work-start-date']),
                endDate: parseDate(aw['administrative-work-end-date']),
                administrativeLoadCredit: parseNumStr(aw['administrative-work-load-credit']),
            }),
            (aw) => ({
                natureOfWork: aw['administrative-work-nature'],
                officeId: getOfficeId(aw['administrative-work-committee']),
                startDate: parseDate(aw['administrative-work-start-date']),
                endDate: parseDate(aw['administrative-work-end-date']),
                administrativeLoadCredit: parseNumStr(aw['administrative-work-load-credit']),
            }),
        );
        // Teaching
        await processDynamicTable(
            operatorId,
            facultyId,
            facultyCourse,
            facultyCourse.id,
            dynamicTables.courses,
            (c) => ({
                facultyAcademicSemesterId,
                courseId: getCourseId(c['course-title']),
                section: c['course-section'],
                numberOfStudents: c['course-num-of-students']
                    ? parseInt(c['course-num-of-students'], 10)
                    : null,
                teachingLoadCredit: parseNumStr(c['course-load-credit']),
                sectionSET: parseSetScore(c['course-section-set']),
            }),
            (c) => ({
                courseId: getCourseId(c['course-title']),
                section: c['course-section'],
                numberOfStudents: c['course-num-of-students']
                    ? parseInt(c['course-num-of-students'], 10)
                    : null,
                teachingLoadCredit: parseNumStr(c['course-load-credit']),
                sectionSET: parseSetScore(c['course-section-set']),
            }),
        );

        await processDynamicTable(
            operatorId,
            facultyId,
            facultyMentoring,
            facultyMentoring.id,
            dynamicTables.mentees,
            (m) => ({
                facultyAcademicSemesterId,
                studentId: m.resolvedStudentId,
                category: m['mentee-category'],
                startDate: parseDate(m['mentee-start-date']),
                endDate: parseDate(m['mentee-end-date']),
                remarks: m['mentee-remarks'],
            }),
            (m) => ({
                studentId: m.resolvedStudentId,
                category: m['mentee-category'],
                startDate: parseDate(m['mentee-start-date']),
                endDate: parseDate(m['mentee-end-date']),
                remarks: m['mentee-remarks'],
            }),
        );

        // Research
        await processDynamicTable(
            operatorId,
            facultyId,
            facultyResearch,
            facultyResearch.id,
            dynamicTables.research,
            (r) => ({
                facultyAcademicSemesterId,
                researchId: getResearchId(r['research-title']),
                researchLoadCredit: parseNumStr(r['research-load-credit']),
                remarks: r['research-remarks'],
            }),
            (r) => ({
                researchId: getResearchId(r['research-title']),
                researchLoadCredit: parseNumStr(r['research-load-credit']),
                remarks: r['research-remarks'],
            }),
        );

        // Extension
        await processDynamicTable(
            operatorId,
            facultyId,
            facultyExtension,
            facultyExtension.id,
            dynamicTables.extension,
            (e) => ({
                facultyAcademicSemesterId,
                natureOfExtension: e['extension-nature'],
                agency: e['extension-agency'],
                startDate: parseDate(e['extension-start-date']),
                endDate: parseDate(e['extension-end-date']),
                extensionLoadCredit: parseNumStr(e['extension-load-credit']),
            }),
            (e) => ({
                natureOfExtension: e['extension-nature'],
                agency: e['extension-agency'],
                startDate: parseDate(e['extension-start-date']),
                endDate: parseDate(e['extension-end-date']),
                extensionLoadCredit: parseNumStr(e['extension-load-credit']),
            }),
        );

        // Study load
        await processDynamicTable(
            operatorId,
            facultyId,
            facultyStudyLoad,
            facultyStudyLoad.id,
            dynamicTables.studyLoad,
            (s) => ({
                facultyAcademicSemesterId,
                degreeProgram: s['study-load-degree'],
                university: s['study-load-university'],
                studyLoadUnits: parseNumStr(s['study-load-units']),
                onFullTimeLeaveWithPay: s['study-load-on-leave-with-pay'] === true,
                isFacultyFellowshipRecipient: s['study-load-fellowship-recipient'] === true,
                studyLoadCredit: parseNumStr(s['study-load-credit']),
            }),
            (s) => ({
                degreeProgram: s['study-load-degree'],
                university: s['study-load-university'],
                studyLoadUnits: parseNumStr(s['study-load-units']),
                onFullTimeLeaveWithPay: s['study-load-on-leave-with-pay'] === true,
                isFacultyFellowshipRecipient: s['study-load-fellowship-recipient'] === true,
                studyLoadCredit: parseNumStr(s['study-load-credit']),
            }),
        );

        return { success: true };
    } catch (error) {
        console.error("DB UPDATE ERROR in updateSemestralRecords:", error);
        return { success: false };
    }
}
