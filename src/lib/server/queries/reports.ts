import { db } from '../db/index';
import {
    faculty,
    facultycourse,
    course,
    semester,
    facultysemester,
    facultyadminposition,
    rank,
    facultyeducationalattainment,
    adminposition,
    facultycommmembership,
    facultyresearch,
    facultyadminwork,
    facultyrank,
    facultyhomeaddress,
    facultyemail,
    fieldofinterest,
    facultyfieldofinterest,
    facultycontactnumber,
    research,
    office,
} from '../db/schema';
import { eq, and, sql, avg, asc, desc, lt, gt, lte, gte, or, between } from 'drizzle-orm';

export async function getFacultyProfileReport(facultyid: number) {
    return await db
        .select({
            lastName: faculty.lastname,
            firstName: faculty.firstname,
            middleName: faculty.middlename,
            homeAddresses: sql<string>`STRING_AGG(${facultyhomeaddress.homeaddress}, E'\n')`,
            contactNumbers: sql<string>`STRING_AGG(${facultycontactnumber.contactnumber}, E'\n')`,
            emailAddresses: sql<string>`STRING_AGG(${facultyemail.email}, E'\n')`,
            birthDate: faculty.birthdate,
            educationalAttainments: sql<string>`STRING_AGG(${facultyeducationalattainment.degree} || ', ' || ${facultyeducationalattainment.institution} || ', ' || ${facultyeducationalattainment.graduationyear}, E'\n' ORDER BY ${desc(facultyeducationalattainment.graduationyear)})`,
            fieldsOfInterest: sql<string>`STRING_AGG(${fieldofinterest.field}, ', ' ORDER BY ${asc(fieldofinterest.field)})`,
            designation: rank.ranktitle,
            salaryGrade: rank.salarygrade,
            salaryRate: rank.salaryrate,
            dateOfOriginalAppointment: faculty.dateoforiginalappointment,
            psiItem: faculty.psiitem,
            employeeNumber: faculty.employeenumber,
            tin: faculty.tin,
            gsis: faculty.gsis,
            philhealth: faculty.philhealth,
            pagIbig: faculty.pagibig,
            remarks: faculty.remarks,
        })
        .from(faculty)
        .leftJoin(facultyhomeaddress, eq(faculty.facultyid, facultyhomeaddress.facultyid))
        .leftJoin(facultycontactnumber, eq(faculty.facultyid, facultycontactnumber.facultyid))
        .leftJoin(facultyemail, eq(faculty.facultyid, facultyemail.facultyid))
        .leftJoin(
            facultyeducationalattainment,
            eq(faculty.facultyid, facultyeducationalattainment.facultyid),
        )
        .leftJoin(facultyfieldofinterest, eq(faculty.facultyid, facultyfieldofinterest.facultyid))
        .leftJoin(
            fieldofinterest,
            eq(facultyfieldofinterest.fieldofinterestid, fieldofinterest.fieldofinterestid),
        )
        .leftJoin(facultyrank, eq(faculty.facultyid, facultyrank.facultyid))
        .leftJoin(rank, eq(facultyrank.rankid, rank.rankid))
        .where(eq(faculty.facultyid, facultyid))
        .groupBy(
            faculty.lastname,
            faculty.firstname,
            faculty.middlename,
            faculty.birthdate,
            faculty.dateoforiginalappointment,
            faculty.psiitem,
            faculty.employeenumber,
            faculty.tin,
            faculty.gsis,
            faculty.philhealth,
            faculty.pagibig,
            faculty.remarks,
            facultyrank.dateoftenureorrenewal,
            rank.ranktitle,
            rank.salarygrade,
            rank.salaryrate,
        )
        .orderBy(desc(facultyrank.dateoftenureorrenewal));
}

export async function getFacultyServiceRecordReport(
    facultyid: number,
    fromAcadYear: number,
    fromSemNum: number,
    toAcadYear: number,
    toSemNum: number,
) {
    const existingFacultySemesterSq = db
        // TODO: limit
        .select({
            facultyid: facultysemester.facultyid,
            facultysemesterid: facultysemester.facultysemesterid,
            acadsemesterid: facultysemester.acadsemesterid,
            currentrankid: facultysemester.currentrankid,
            currenthighesteducationalattainmentid:
                facultysemester.currenthighesteducationalattainmentid,
            remarks: facultysemester.remarks,
        })
        .from(facultysemester)
        .innerJoin(semester, eq(facultysemester.acadsemesterid, semester.acadsemesterid))
        .where(
            and(
                eq(facultysemester.facultyid, facultyid),
                or(
                    and(
                        lt(semester.academicyear, toAcadYear),
                        gt(semester.academicyear, fromAcadYear),
                    ),
                    and(eq(semester.academicyear, toAcadYear), lte(semester.semester, toSemNum)),
                    and(
                        eq(semester.academicyear, fromAcadYear),
                        gte(semester.semester, fromSemNum),
                    ),
                ),
            ),
        )
        .as('existing_facultysemester_sq');

    const profileQuery = db
        .select({
            lastName: faculty.lastname,
            firstName: faculty.firstname,
            middleName: faculty.middlename,
            currentAppointment: rank.ranktitle,
            currentAppointmentStatus: facultyrank.appointmentstatus,
            dateOfOriginalAppointment: faculty.dateoforiginalappointment,
            highestEducationalAttainmentDegree: facultyeducationalattainment.degree,
            highestEducationAttainmentInstitution: facultyeducationalattainment.institution,
            highestEducationAttainmentGraduationYear: facultyeducationalattainment.graduationyear,
        })
        .from(faculty)
        .innerJoin(
            existingFacultySemesterSq,
            eq(faculty.facultyid, existingFacultySemesterSq.facultyid),
        )
        .innerJoin(semester, eq(existingFacultySemesterSq.acadsemesterid, semester.acadsemesterid))
        .leftJoin(
            facultyrank,
            eq(existingFacultySemesterSq.currentrankid, facultyrank.facultyrankid),
        )
        .leftJoin(rank, eq(facultyrank.rankid, rank.rankid))
        .leftJoin(
            facultyeducationalattainment,
            eq(
                existingFacultySemesterSq.currenthighesteducationalattainmentid,
                facultyeducationalattainment.facultyeducationalattainmentid,
            ),
        )
        .orderBy(desc(semester.academicyear), desc(semester.semester))
        .limit(1);

    const originalTenureQuery = db
        .select({
            tenureAppointment: rank.ranktitle,
            tenureDateOfAppointment: facultyrank.dateoftenureorrenewal,
        })
        .from(facultyrank)
        .innerJoin(rank, eq(facultyrank.rankid, rank.rankid))
        .innerJoin(faculty, eq(facultyrank.facultyid, faculty.facultyid))
        .where(
            and(eq(faculty.facultyid, facultyid), eq(facultyrank.appointmentstatus, 'Permanent')),
        );

    const adminPositionsQuery = db
        .select({
            adminPosition: adminposition.name,
            office: office.name,
            periods: sql<string>`STRING_AGG(${facultyadminposition.startdate} || ' - ' || ${facultyadminposition.enddate}, '; ' ORDER BY ${asc(facultyadminposition.enddate)}, ${asc(facultyadminposition.startdate)})`,
        })
        .from(facultyadminposition)
        .innerJoin(
            adminposition,
            eq(facultyadminposition.adminpositionid, adminposition.adminpositionid),
        )
        .innerJoin(office, eq(facultyadminposition.officeid, office.officeid))
        .innerJoin(
            existingFacultySemesterSq,
            eq(facultyadminposition.facultysemesterid, existingFacultySemesterSq.facultysemesterid),
        )
        .groupBy(facultyadminposition.facultyadminpositionid, adminposition.name, office.name)
        .orderBy(
            desc(facultyadminposition.enddate),
            desc(facultyadminposition.startdate),
            desc(facultyadminposition.facultyadminpositionid),
        );

    const fieldsOfInterestQuery = db
        .select({
            fields: sql<string>`STRING_AGG(${fieldofinterest.field}, ', ' ORDER BY ${asc(fieldofinterest.field)})`,
        })
        .from(facultyfieldofinterest)
        .innerJoin(
            fieldofinterest,
            eq(facultyfieldofinterest.fieldofinterestid, fieldofinterest.fieldofinterestid),
        )
        .where(eq(facultyfieldofinterest.facultyid, facultyid))
        .groupBy(facultyfieldofinterest.facultyid);

    const currentTeachingLoadQuery = db
        .select({
            acadSemesterId: existingFacultySemesterSq.acadsemesterid,
            currentCoursesTaught: sql<string>`STRING_AGG(${course.coursename}, ', ' ORDER BY ${course.coursename})`,
            teachingLoadCredit:
                sql<number>`COALESCE(sum(${facultycourse.teachingloadcredit}), 0)`.mapWith(Number),
            numOfStudentsPerCourse: sql<string>`STRING_AGG(${facultycourse.numberofstudents}::text, ', ' ORDER BY ${asc(course.coursename)})`,
        })
        .from(existingFacultySemesterSq)
        .leftJoin(
            facultycourse,
            eq(existingFacultySemesterSq.facultysemesterid, facultycourse.facultysemesterid),
        )
        .leftJoin(course, eq(facultycourse.courseid, course.courseid))
        .groupBy(existingFacultySemesterSq.acadsemesterid);

    const currentAdministrativeLoadQuery = db
        .select({
            acadSemesterId: existingFacultySemesterSq.acadsemesterid,
            administrativeLoadCredit:
                sql<number>`COALESCE(sum(${facultyadminposition.administrativeloadcredit}), 0) + COALESCE(sum(${facultycommmembership.administrativeloadcredit}), 0) + COALESCE(sum(${facultyadminwork.administrativeloadcredit}), 0)`.mapWith(
                    Number,
                ),
            currentAdminPositions: sql<string>`STRING_AGG(${adminposition.name}, ', ' ORDER BY ${asc(adminposition.name)})`,
        })
        .from(existingFacultySemesterSq)
        .leftJoin(
            facultyadminposition,
            eq(existingFacultySemesterSq.facultysemesterid, facultyadminposition.facultysemesterid),
        )
        .leftJoin(
            adminposition,
            eq(facultyadminposition.adminpositionid, adminposition.adminpositionid),
        )
        .leftJoin(
            facultycommmembership,
            eq(
                existingFacultySemesterSq.facultysemesterid,
                facultycommmembership.facultysemesterid,
            ),
        )
        .leftJoin(
            facultyadminwork,
            eq(existingFacultySemesterSq.facultysemesterid, facultyadminwork.facultysemesterid),
        )
        .groupBy(existingFacultySemesterSq.acadsemesterid);

    const currentResearchLoadQuery = db
        .select({
            acadSemesterId: existingFacultySemesterSq.acadsemesterid,
            researchLoadCredit:
                sql<number>`COALESCE(sum(${facultyresearch.researchloadcredit}), 0)`.mapWith(
                    Number,
                ),
            researchTitles: sql<string>`STRING_AGG(${research.title}, ', ' ORDER BY ${asc(research.title)})`,
            researchPeriods: sql<string>`STRING_AGG(${research.startdate} || ' - ' || ${research.enddate}, ', ' ORDER BY ${asc(research.title)})`,
            researchFundings: sql<string>`STRING_AGG(${research.funding}, ', ' ORDER BY ${asc(research.title)})`,
        })
        .from(existingFacultySemesterSq)
        .leftJoin(
            facultyresearch,
            eq(existingFacultySemesterSq.facultysemesterid, facultyresearch.facultysemesterid),
        )
        .leftJoin(research, eq(facultyresearch.researchid, research.researchid))
        .groupBy(existingFacultySemesterSq.acadsemesterid);

    const semestralRecordsQuery = db
        .select({
            acadSemesterId: existingFacultySemesterSq.acadsemesterid,
            acadYear: semester.academicyear,
            semNum: semester.semester,
            remarks: existingFacultySemesterSq.remarks,
        })
        .from(existingFacultySemesterSq)
        .innerJoin(semester, eq(existingFacultySemesterSq.acadsemesterid, semester.acadsemesterid))
        .orderBy(desc(semester.academicyear), asc(semester.semester));

    const [
        profile,
        originalTenure,
        adminPositions,
        fieldsOfInterest,
        semestralRecords,
        currentTeachingLoad,
        currentAdministrativeLoad,
        currentResearchLoad,
    ] = await Promise.all([
        profileQuery,
        originalTenureQuery,
        adminPositionsQuery,
        fieldsOfInterestQuery,
        semestralRecordsQuery,
        currentTeachingLoadQuery,
        currentAdministrativeLoadQuery,
        currentResearchLoadQuery,
    ]);

    return {
        profile,
        originalTenure,
        adminPositions,
        fieldsOfInterest,
        semestralRecords,
        currentTeachingLoad,
        currentAdministrativeLoad,
        currentResearchLoad,
    };
}

export async function getFacultyLoadingReport(facultyid: number, acadYear: number, semNum: number) {
    return await db
        .select({
            lastName: faculty.lastname,
            firstName: faculty.firstname,
            middleName: faculty.middlename,
            designation: rank.ranktitle,
            degree: facultyeducationalattainment.degree,
            coursesTaught: sql<string>`STRING_AGG(${course.coursename}, ', ' ORDER BY ${course.coursename})`,
            teachingLoadUnits: sql<number>`COALESCE(sum(${course.units}), 0)`.mapWith(Number),
            adminPosition: sql<string>`STRING_AGG(${adminposition.name}, ', ' ORDER BY ${adminposition.name})`,
            administrativeLoadCredit:
                sql<number>`COALESCE(sum(${facultyadminposition.administrativeloadcredit}), 0) + COALESCE(sum(${facultycommmembership.administrativeloadcredit}), 0) + COALESCE(sum(${facultyadminwork.administrativeloadcredit}), 0)`.mapWith(
                    Number,
                ),
            teachingLoadCredit:
                sql<number>`COALESCE(sum(${facultycourse.teachingloadcredit}), 0)`.mapWith(Number),
            researchLoadCredit:
                sql<number>`COALESCE(sum(${facultyresearch.researchloadcredit}), 0)`.mapWith(
                    Number,
                ),
        })
        .from(faculty)
        .innerJoin(facultysemester, eq(faculty.facultyid, facultysemester.facultyid))
        .innerJoin(semester, eq(facultysemester.acadsemesterid, semester.acadsemesterid))
        .leftJoin(facultyrank, eq(facultysemester.currentrankid, facultyrank.facultyrankid))
        .leftJoin(rank, eq(facultyrank.rankid, rank.rankid))
        .leftJoin(
            facultyeducationalattainment,
            eq(
                facultysemester.currenthighesteducationalattainmentid,
                facultyeducationalattainment.facultyeducationalattainmentid,
            ),
        )
        .leftJoin(
            facultycourse,
            eq(facultysemester.facultysemesterid, facultycourse.facultysemesterid),
        )
        .leftJoin(course, eq(facultycourse.courseid, course.courseid))
        .leftJoin(
            facultyadminposition,
            eq(facultysemester.facultysemesterid, facultyadminposition.facultysemesterid),
        )
        .leftJoin(
            adminposition,
            eq(facultyadminposition.adminpositionid, adminposition.adminpositionid),
        )
        .leftJoin(
            facultycommmembership,
            eq(facultysemester.facultysemesterid, facultycommmembership.facultysemesterid),
        )
        .leftJoin(
            facultyadminwork,
            eq(facultysemester.facultysemesterid, facultyadminwork.facultysemesterid),
        )
        .leftJoin(
            facultyresearch,
            eq(facultysemester.facultysemesterid, facultyresearch.facultysemesterid),
        )
        .where(
            and(
                eq(faculty.facultyid, facultyid),
                eq(semester.academicyear, acadYear),
                eq(semester.semester, semNum),
            ),
        )
        .groupBy(
            faculty.lastname,
            faculty.firstname,
            faculty.middlename,
            rank.ranktitle,
            facultyeducationalattainment.degree,
        );
}

export async function getSubjectsByFacultyReport(
    facultyid: number,
    acadYear: number,
    semNum: number,
) {
    return await db
        .select({
            lastName: faculty.lastname,
            firstName: faculty.firstname,
            middleName: faculty.middlename,
            coursesTaught: sql<string>`STRING_AGG(${course.coursename}, ', ' ORDER BY ${course.coursename})`,
        })
        .from(facultycourse)
        .innerJoin(course, eq(facultycourse.courseid, course.courseid))
        .innerJoin(
            facultysemester,
            eq(facultycourse.facultysemesterid, facultysemester.facultysemesterid),
        )
        .innerJoin(faculty, eq(facultysemester.facultyid, faculty.facultyid))
        .innerJoin(semester, eq(facultysemester.acadsemesterid, semester.acadsemesterid))
        .where(
            and(
                eq(faculty.facultyid, facultyid),
                eq(semester.academicyear, acadYear),
                eq(semester.semester, semNum),
            ),
        )
        .groupBy(faculty.lastname, faculty.firstname, faculty.middlename);
}

export async function getFacultyBySubjectReport(acadYear: number, semNum: number) {
    return await db
        .select({
            courseTaught: course.coursename,
            faculty: sql<string>`STRING_AGG(${faculty.firstname} || ' ' || ${faculty.lastname}, ', ' ORDER BY ${asc(faculty.lastname)}, ${asc(faculty.firstname)})`,
        })
        .from(facultycourse)
        .innerJoin(course, eq(facultycourse.courseid, course.courseid))
        .innerJoin(
            facultysemester,
            eq(facultycourse.facultysemesterid, facultysemester.facultysemesterid),
        )
        .innerJoin(faculty, eq(facultysemester.facultyid, faculty.facultyid))
        .innerJoin(semester, eq(facultysemester.acadsemesterid, semester.acadsemesterid))
        .where(and(eq(semester.academicyear, acadYear), eq(semester.semester, semNum)))
        .groupBy(course.coursename);
}

export async function getFacultySETReport(facultyid: number, acadYear: number) {
    const facultyInfoQuery = db
        .select({
            lastName: faculty.lastname,
            firstName: faculty.firstname,
            middleName: faculty.middlename,
            status: faculty.status,
        })
        .from(faculty)
        .where(eq(faculty.facultyid, facultyid));

    const [midyearCoursesQuery, firstSemCoursesQuery, secondSemCoursesQuery] = [0, 1, 2].map(
        (semNum) => {
            return db
                .select({
                    courseName: course.coursename,
                    section: facultycourse.section,
                    sectionSET: facultycourse.sectionset,
                })
                .from(facultycourse)
                .innerJoin(course, eq(facultycourse.courseid, course.courseid))
                .innerJoin(
                    facultysemester,
                    eq(facultycourse.facultysemesterid, facultysemester.facultysemesterid),
                )
                .innerJoin(semester, eq(facultysemester.acadsemesterid, semester.acadsemesterid))
                .where(
                    and(
                        eq(facultysemester.facultyid, facultyid),
                        eq(semester.academicyear, acadYear),
                        eq(semester.semester, semNum),
                    ),
                );
        },
    );

    const [[facultyInfo], firstSemCourses, secondSemCourses, midyearCourses] = await Promise.all([
        facultyInfoQuery,
        firstSemCoursesQuery,
        secondSemCoursesQuery,
        midyearCoursesQuery,
    ]);

    return {
        facultyInfo,
        semestralCoursesInfo: [firstSemCourses, secondSemCourses, midyearCourses],
    };
}
