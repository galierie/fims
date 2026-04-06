import { db } from '../db/index';
import {
    faculty,
    facultyCourse,
    course,
    academicSemester,
    facultyAcademicSemester,
    facultyAdminPosition,
    rank,
    facultyEducationalAttainment,
    adminPosition,
    facultyCommMembership,
    facultyResearch,
    facultyAdminWork,
    facultyRank,
    facultyHomeAddress,
    facultyEmail,
    fieldOfInterest,
    facultyFieldOfInterest,
    facultyContactNumber,
    research,
    office,
} from '../db/schema';
import { eq, and, sql, avg, asc, desc, lt, gt, lte, gte, or, between } from 'drizzle-orm';

export async function getFacultyProfileReport(facultyid: number) {
    return await db
        .select({
            lastName: faculty.lastName,
            firstName: faculty.firstName,
            middleName: faculty.middleName,
            homeAddresses: sql<string>`STRING_AGG(${facultyHomeAddress.homeAddress}, E'\n')`,
            contactNumbers: sql<string>`STRING_AGG(${facultyContactNumber.contactNumber}, E'\n')`,
            emailAddresses: sql<string>`STRING_AGG(${facultyEmail.email}, E'\n')`,
            birthDate: faculty.birthDate,
            educationalAttainments: sql<string>`STRING_AGG(${facultyEducationalAttainment.degree} || ', ' || ${facultyEducationalAttainment.institution} || ', ' || ${facultyEducationalAttainment.graduationYear}, E'\n' ORDER BY ${desc(facultyEducationalAttainment.graduationYear)})`,
            fieldsOfInterest: sql<string>`STRING_AGG(${fieldOfInterest.field}, ', ' ORDER BY ${asc(fieldOfInterest.field)})`,
            designation: rank.title,
            salaryGrade: rank.salaryGrade,
            salaryRate: rank.salaryRate,
            dateOfOriginalAppointment: faculty.dateOfOriginalAppointment,
            psiItem: faculty.psiItem,
            employeeNumber: faculty.employeeNumber,
            tin: faculty.tin,
            gsis: faculty.gsis,
            philhealth: faculty.philhealth,
            pagIbig: faculty.pagibig,
            remarks: faculty.remarks,
        })
        .from(faculty)
        .leftJoin(facultyHomeAddress, eq(faculty.id, facultyHomeAddress.facultyId))
        .leftJoin(facultyContactNumber, eq(faculty.id, facultyContactNumber.facultyId))
        .leftJoin(facultyEmail, eq(faculty.id, facultyEmail.facultyId))
        .leftJoin(
            facultyEducationalAttainment,
            eq(faculty.id, facultyEducationalAttainment.facultyId),
        )
        .leftJoin(facultyFieldOfInterest, eq(faculty.id, facultyFieldOfInterest.facultyId))
        .leftJoin(
            fieldOfInterest,
            eq(facultyFieldOfInterest.fieldOfInterestId, fieldOfInterest.id),
        )
        .leftJoin(facultyRank, eq(faculty.id, facultyRank.facultyId))
        .leftJoin(rank, eq(facultyRank.rankId, rank.id))
        .where(eq(faculty.id, facultyid))
        .groupBy(
            faculty.lastName,
            faculty.firstName,
            faculty.middleName,
            faculty.birthDate,
            faculty.dateOfOriginalAppointment,
            faculty.psiItem,
            faculty.employeeNumber,
            faculty.tin,
            faculty.gsis,
            faculty.philhealth,
            faculty.pagibig,
            faculty.remarks,
            facultyRank.dateOfTenureOrRenewal,
            rank.title,
            rank.salaryGrade,
            rank.salaryRate,
        )
        .orderBy(desc(facultyRank.dateOfTenureOrRenewal));
}

export async function getFacultyServiceRecordReport(
    facultyid: number,
    fromAcadYear: number,
    fromSemNum: number,
    toAcadYear: number,
    toSemNum: number,
) {
    const existingFacultyAcademicSemesterSq = db
        // TODO: limit
        .select({
            facultyId: facultyAcademicSemester.facultyId,
            facultyAcademicSemesterId: facultyAcademicSemester.id,
            academicSemesterId: facultyAcademicSemester.academicSemesterId,
            currentRankId: facultyAcademicSemester.currentRankId,
            currentHighestEducationalAttainmentId:
                facultyAcademicSemester.currentHighestEducationalAttainmentId,
            remarks: facultyAcademicSemester.remarks,
        })
        .from(facultyAcademicSemester)
        .innerJoin(academicSemester, eq(facultyAcademicSemester.academicSemesterId, academicSemester.id))
        .where(
            and(
                eq(facultyAcademicSemester.facultyId, facultyid),
                or(
                    and(
                        lt(academicSemester.academicYear, toAcadYear),
                        gt(academicSemester.academicYear, fromAcadYear),
                    ),
                    and(eq(academicSemester.academicYear, toAcadYear), lte(academicSemester.semesterNumber, toSemNum)),
                    and(
                        eq(academicSemester.academicYear, fromAcadYear),
                        gte(academicSemester.semesterNumber, fromSemNum),
                    ),
                ),
            ),
        )
        .as('existing_facultyAcademicSemester_sq');

    const profileQuery = db
        .select({
            lastName: faculty.lastName,
            firstName: faculty.firstName,
            middleName: faculty.middleName,
            currentAppointment: rank.title,
            currentAppointmentStatus: facultyRank.appointmentStatus,
            dateOfOriginalAppointment: faculty.dateOfOriginalAppointment,
            highestEducationalAttainmentDegree: facultyEducationalAttainment.degree,
            highestEducationAttainmentInstitution: facultyEducationalAttainment.institution,
            highestEducationAttainmentGraduationYear: facultyEducationalAttainment.graduationYear,
        })
        .from(faculty)
        .innerJoin(
            existingFacultyAcademicSemesterSq,
            eq(faculty.id, existingFacultyAcademicSemesterSq.facultyId),
        )
        .innerJoin(academicSemester, eq(existingFacultyAcademicSemesterSq.academicSemesterId, academicSemester.id))
        .leftJoin(
            facultyRank,
            eq(existingFacultyAcademicSemesterSq.currentRankId, facultyRank.id),
        )
        .leftJoin(rank, eq(facultyRank.rankId, rank.id))
        .leftJoin(
            facultyEducationalAttainment,
            eq(
                existingFacultyAcademicSemesterSq.currentHighestEducationalAttainmentId,
                facultyEducationalAttainment.id,
            ),
        )
        .orderBy(desc(academicSemester.academicYear), desc(academicSemester.semesterNumber))
        .limit(1);

    const originalTenureQuery = db
        .select({
            tenureAppointment: rank.title,
            tenureDateOfAppointment: facultyRank.dateOfTenureOrRenewal,
        })
        .from(facultyRank)
        .innerJoin(rank, eq(facultyRank.rankId, rank.id))
        .innerJoin(faculty, eq(facultyRank.facultyId, faculty.id))
        .where(
            and(eq(faculty.id, facultyid), eq(facultyRank.appointmentStatus, 'Permanent')),
        );

    const adminPositionsQuery = db
        .select({
            adminPosition: adminPosition.title,
            office: office.name,
            periods: sql<string>`STRING_AGG(${facultyAdminPosition.startDate} || ' - ' || ${facultyAdminPosition.endDate}, '; ' ORDER BY ${asc(facultyAdminPosition.endDate)}, ${asc(facultyAdminPosition.startDate)})`,
        })
        .from(facultyAdminPosition)
        .innerJoin(
            adminPosition,
            eq(facultyAdminPosition.adminPositionId, adminPosition.id),
        )
        .innerJoin(office, eq(facultyAdminPosition.officeId, office.id))
        .innerJoin(
            existingFacultyAcademicSemesterSq,
            eq(facultyAdminPosition.facultyAcademicSemesterId, existingFacultyAcademicSemesterSq.facultyAcademicSemesterId),
        )
        .groupBy(facultyAdminPosition.id, adminPosition.title, office.name)
        .orderBy(
            desc(facultyAdminPosition.endDate),
            desc(facultyAdminPosition.startDate),
            desc(facultyAdminPosition.id),
        );

    const fieldsOfInterestQuery = db
        .select({
            fields: sql<string>`STRING_AGG(${fieldOfInterest.field}, ', ' ORDER BY ${asc(fieldOfInterest.field)})`,
        })
        .from(facultyFieldOfInterest)
        .innerJoin(
            fieldOfInterest,
            eq(facultyFieldOfInterest.fieldOfInterestId, fieldOfInterest.id),
        )
        .where(eq(facultyFieldOfInterest.facultyId, facultyid))
        .groupBy(facultyFieldOfInterest.facultyId);

    const currentTeachingLoadQuery = db
        .select({
            academicSemesterId: existingFacultyAcademicSemesterSq.academicSemesterId,
            currentCoursesTaught: sql<string>`STRING_AGG(${course.name}, ', ' ORDER BY ${course.name})`,
            teachingLoadCredit:
                sql<number>`COALESCE(sum(${facultyCourse.teachingLoadCredit}), 0)`.mapWith(Number),
            numOfStudentsPerCourse: sql<string>`STRING_AGG(${facultyCourse.numberOfStudents}::text, ', ' ORDER BY ${asc(course.name)})`,
        })
        .from(existingFacultyAcademicSemesterSq)
        .leftJoin(
            facultyCourse,
            eq(existingFacultyAcademicSemesterSq.facultyAcademicSemesterId, facultyCourse.facultyAcademicSemesterId),
        )
        .leftJoin(course, eq(facultyCourse.courseId, course.id))
        .groupBy(existingFacultyAcademicSemesterSq.academicSemesterId);

    const currentAdministrativeLoadQuery = db
        .select({
            academicSemesterId: existingFacultyAcademicSemesterSq.academicSemesterId,
            administrativeLoadCredit:
                sql<number>`COALESCE(sum(${facultyAdminPosition.administrativeLoadCredit}), 0) + COALESCE(sum(${facultyCommMembership.administrativeLoadCredit}), 0) + COALESCE(sum(${facultyAdminWork.administrativeLoadCredit}), 0)`.mapWith(
                    Number,
                ),
            currentAdminPositions: sql<string>`STRING_AGG(${adminPosition.title}, ', ' ORDER BY ${asc(adminPosition.title)})`,
        })
        .from(existingFacultyAcademicSemesterSq)
        .leftJoin(
            facultyAdminPosition,
            eq(existingFacultyAcademicSemesterSq.facultyAcademicSemesterId, facultyAdminPosition.facultyAcademicSemesterId),
        )
        .leftJoin(
            adminPosition,
            eq(facultyAdminPosition.adminPositionId, adminPosition.id),
        )
        .leftJoin(
            facultyCommMembership,
            eq(
                existingFacultyAcademicSemesterSq.facultyAcademicSemesterId,
                facultyCommMembership.facultyAcademicSemesterId,
            ),
        )
        .leftJoin(
            facultyAdminWork,
            eq(existingFacultyAcademicSemesterSq.facultyAcademicSemesterId, facultyAdminWork.facultyAcademicSemesterId),
        )
        .groupBy(existingFacultyAcademicSemesterSq.academicSemesterId);

    const currentResearchLoadQuery = db
        .select({
            academicSemesterId: existingFacultyAcademicSemesterSq.academicSemesterId,
            researchLoadCredit:
                sql<number>`COALESCE(sum(${facultyResearch.researchLoadCredit}), 0)`.mapWith(
                    Number,
                ),
            researchTitles: sql<string>`STRING_AGG(${research.title}, ', ' ORDER BY ${asc(research.title)})`,
            researchPeriods: sql<string>`STRING_AGG(${research.startDate} || ' - ' || ${research.endDate}, ', ' ORDER BY ${asc(research.title)})`,
            researchFundings: sql<string>`STRING_AGG(${research.funding}, ', ' ORDER BY ${asc(research.title)})`,
        })
        .from(existingFacultyAcademicSemesterSq)
        .leftJoin(
            facultyResearch,
            eq(existingFacultyAcademicSemesterSq.facultyAcademicSemesterId, facultyResearch.facultyAcademicSemesterId),
        )
        .leftJoin(research, eq(facultyResearch.researchId, research.id))
        .groupBy(existingFacultyAcademicSemesterSq.academicSemesterId);

    const semestralRecordsQuery = db
        .select({
            academicSemesterId: existingFacultyAcademicSemesterSq.academicSemesterId,
            acadYear: academicSemester.academicYear,
            semNum: academicSemester.semesterNumber,
            remarks: existingFacultyAcademicSemesterSq.remarks,
        })
        .from(existingFacultyAcademicSemesterSq)
        .innerJoin(academicSemester, eq(existingFacultyAcademicSemesterSq.academicSemesterId, academicSemester.id))
        .orderBy(desc(academicSemester.academicYear), asc(academicSemester.semesterNumber));

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
            lastName: faculty.lastName,
            firstName: faculty.firstName,
            middleName: faculty.middleName,
            designation: rank.title,
            degree: facultyEducationalAttainment.degree,
            coursesTaught: sql<string>`STRING_AGG(${course.name}, ', ' ORDER BY ${course.name})`,
            teachingLoadUnits: sql<number>`COALESCE(sum(${course.units}), 0)`.mapWith(Number),
            adminPosition: sql<string>`STRING_AGG(${adminPosition.title}, ', ' ORDER BY ${adminPosition.title})`,
            administrativeLoadCredit:
                sql<number>`COALESCE(sum(${facultyAdminPosition.administrativeLoadCredit}), 0) + COALESCE(sum(${facultyCommMembership.administrativeLoadCredit}), 0) + COALESCE(sum(${facultyAdminWork.administrativeLoadCredit}), 0)`.mapWith(
                    Number,
                ),
            teachingLoadCredit:
                sql<number>`COALESCE(sum(${facultyCourse.teachingLoadCredit}), 0)`.mapWith(Number),
            researchLoadCredit:
                sql<number>`COALESCE(sum(${facultyResearch.researchLoadCredit}), 0)`.mapWith(
                    Number,
                ),
        })
        .from(faculty)
        .innerJoin(facultyAcademicSemester, eq(faculty.id, facultyAcademicSemester.facultyId))
        .innerJoin(academicSemester, eq(facultyAcademicSemester.academicSemesterId, academicSemester.id))
        .leftJoin(facultyRank, eq(facultyAcademicSemester.currentRankId, facultyRank.id))
        .leftJoin(rank, eq(facultyRank.rankId, rank.id))
        .leftJoin(
            facultyEducationalAttainment,
            eq(
                facultyAcademicSemester.currentHighestEducationalAttainmentId,
                facultyEducationalAttainment.id,
            ),
        )
        .leftJoin(
            facultyCourse,
            eq(facultyAcademicSemester.id, facultyCourse.facultyAcademicSemesterId),
        )
        .leftJoin(course, eq(facultyCourse.courseId, course.id))
        .leftJoin(
            facultyAdminPosition,
            eq(facultyAcademicSemester.id, facultyAdminPosition.facultyAcademicSemesterId),
        )
        .leftJoin(
            adminPosition,
            eq(facultyAdminPosition.adminPositionId, adminPosition.id),
        )
        .leftJoin(
            facultyCommMembership,
            eq(facultyAcademicSemester.id, facultyCommMembership.facultyAcademicSemesterId),
        )
        .leftJoin(
            facultyAdminWork,
            eq(facultyAcademicSemester.id, facultyAdminWork.facultyAcademicSemesterId),
        )
        .leftJoin(
            facultyResearch,
            eq(facultyAcademicSemester.id, facultyResearch.facultyAcademicSemesterId),
        )
        .where(
            and(
                eq(faculty.id, facultyid),
                eq(academicSemester.academicYear, acadYear),
                eq(academicSemester.semesterNumber, semNum),
            ),
        )
        .groupBy(
            faculty.lastName,
            faculty.firstName,
            faculty.middleName,
            rank.title,
            facultyEducationalAttainment.degree,
        );
}

export async function getSubjectsByFacultyReport(
    facultyid: number,
    acadYear: number,
    semNum: number,
) {
    return await db
        .select({
            lastName: faculty.lastName,
            firstName: faculty.firstName,
            middleName: faculty.middleName,
            coursesTaught: sql<string>`STRING_AGG(${course.name}, ', ' ORDER BY ${course.name})`,
        })
        .from(facultyCourse)
        .innerJoin(course, eq(facultyCourse.courseId, course.id))
        .innerJoin(
            facultyAcademicSemester,
            eq(facultyCourse.facultyAcademicSemesterId, facultyAcademicSemester.id),
        )
        .innerJoin(faculty, eq(facultyAcademicSemester.facultyId, faculty.id))
        .innerJoin(academicSemester, eq(facultyAcademicSemester.academicSemesterId, academicSemester.id))
        .where(
            and(
                eq(faculty.id, facultyid),
                eq(academicSemester.academicYear, acadYear),
                eq(academicSemester.semesterNumber, semNum),
            ),
        )
        .groupBy(faculty.lastName, faculty.firstName, faculty.middleName);
}

export async function getFacultyBySubjectReport() {
    return await db
        .select({
            courseTaught: course.name,
            // Use DISTINCT so a faculty member isn't listed twice if they taught it in multiple semesters
            // Use COALESCE to output 'None' if no one is teaching it
            faculty: sql<string>`COALESCE(STRING_AGG(DISTINCT ${faculty.firstName} || ' ' || ${faculty.lastName}, ', '), 'None')`,
        })
        .from(course)
        .leftJoin(facultyCourse, eq(course.id, facultyCourse.courseId))
        .leftJoin(
            facultyAcademicSemester,
            eq(facultyCourse.facultyAcademicSemesterId, facultyAcademicSemester.id),
        )
        .leftJoin(faculty, eq(facultyAcademicSemester.facultyId, faculty.id))
        // No .where() clause needed; we want the whole database
        .groupBy(course.name)
        .orderBy(asc(course.name));
}

export async function getFacultySETReport(facultyid: number, acadYear: number) {
    const facultyInfoQuery = db
        .select({
            lastName: faculty.lastName,
            firstName: faculty.firstName,
            middleName: faculty.middleName,
            status: faculty.status,
        })
        .from(faculty)
        .where(eq(faculty.id, facultyid));

    const [midyearCoursesQuery, firstSemCoursesQuery, secondSemCoursesQuery] = [0, 1, 2].map(
        (semNum) => {
            return db
                .select({
                    courseName: course.name,
                    section: facultyCourse.section,
                    sectionSET: facultyCourse.sectionSET,
                })
                .from(facultyCourse)
                .innerJoin(course, eq(facultyCourse.courseId, course.id))
                .innerJoin(
                    facultyAcademicSemester,
                    eq(facultyCourse.facultyAcademicSemesterId, facultyAcademicSemester.id),
                )
                .innerJoin(academicSemester, eq(facultyAcademicSemester.academicSemesterId, academicSemester.id))
                .where(
                    and(
                        eq(facultyAcademicSemester.facultyId, facultyid),
                        eq(academicSemester.academicYear, acadYear),
                        eq(academicSemester.semesterNumber, semNum),
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
