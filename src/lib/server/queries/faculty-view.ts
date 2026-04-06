import { and, eq } from 'drizzle-orm';

import {
    adminPosition,
    appointmentStatus,
    course,
    faculty,
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
    facultyAcademicSemester,
    facultyStudyLoad,
    fieldOfInterest,
    office,
    rank,
    research,
    academicSemester,
    student,
} from '../db/schema';
import { db } from '../db';

export async function getFacultyName(facultyid: number) {
    const response = await db
        .select({
            lastName: faculty.lastName,
            firstName: faculty.firstName,
        })
        .from(faculty)
        .where(eq(faculty.id, facultyid));

    if (response.length === 0) return null;

    const [record] = response;
    return record;
}

export async function getFacultyContactNumbers(facultyid: number) {
    return await db
        .select({
            tupleid: facultyContactNumber.id,
            contactNum: facultyContactNumber.contactNumber,
        })
        .from(facultyContactNumber)
        .where(eq(facultyContactNumber.facultyId, facultyid));
}

export async function getFacultyEducationalAttainments(facultyid: number) {
    return await db
        .select({
            tupleid: facultyEducationalAttainment.id,
            degree: facultyEducationalAttainment.degree,
            institution: facultyEducationalAttainment.institution,
            graduationYear: facultyEducationalAttainment.graduationYear,
        })
        .from(facultyEducationalAttainment)
        .where(eq(facultyEducationalAttainment.facultyId, facultyid));
}

export async function getFacultyFieldsOfInterest(facultyid: number) {
    return await db
        .select({
            tupleid: facultyFieldOfInterest.id,
            field: fieldOfInterest.field,
        })
        .from(facultyFieldOfInterest)
        .leftJoin(
            fieldOfInterest,
            eq(fieldOfInterest.id, facultyFieldOfInterest.fieldOfInterestId),
        )
        .where(eq(facultyFieldOfInterest.facultyId, facultyid));
}

export async function getFacultyPromotionHistory(facultyid: number) {
    return await db
        .select({
            tupleid: facultyRank.id,
            rankTitle: rank.title,
            appointmentStatus: facultyRank.appointmentStatus,
            dateOfTenureOrRenewal: facultyRank.dateOfTenureOrRenewal,
        })
        .from(facultyRank)
        .leftJoin(rank, eq(rank.id, facultyRank.rankId))
        .where(eq(facultyRank.facultyId, facultyid));
}

export async function getFacultyHomeAddresses(facultyid: number) {
    return await db
        .select({
            tupleid: facultyHomeAddress.id,
            homeAddress: facultyHomeAddress.homeAddress,
        })
        .from(facultyHomeAddress)
        .where(eq(facultyHomeAddress.facultyId, facultyid));
}

export async function getFacultyEmailAddresses(facultyid: number) {
    return await db
        .select({
            tupleid: facultyEmail.id,
            email: facultyEmail.email,
        })
        .from(facultyEmail)
        .where(eq(facultyEmail.facultyId, facultyid));
}

export async function getFacultyAcademicSemester(facultyid: number, acadYear: number, semNum: number) {
    const currentSemesterArr = await db
        .select({
            id: academicSemester.id,
        })
        .from(academicSemester)
        .where(and(eq(academicSemester.academicYear, acadYear), eq(academicSemester.semesterNumber, semNum)));

    if (currentSemesterArr.length !== 1) return null;
    const [currentSemester] = currentSemesterArr;

    const currentFacultyAcademicSemesterSq = await db
        .select({
            id: facultyAcademicSemester.id,
            currentRankId: facultyAcademicSemester.currentRankId,
            currentHighestEducationalAttainmentId:
                facultyAcademicSemester.currentHighestEducationalAttainmentId,
            remarks: facultyAcademicSemester.remarks,
        })
        .from(facultyAcademicSemester)
        .where(
            and(
                eq(facultyAcademicSemester.facultyId, facultyid),
                eq(facultyAcademicSemester.id, currentSemester.id),
            ),
        )
        .as('current_faculty_semester_sq');

    const tempCurrentFacultyAcademicSemesterArr = await db.select().from(currentFacultyAcademicSemesterSq);
    if (tempCurrentFacultyAcademicSemesterArr.length !== 1) return null;

    const currentFacultyAcademicSemesterArr = await db
        .select({
            id: currentFacultyAcademicSemesterSq.id,
            currentRankTitle: rank.title,
            currentHighestDegree: facultyEducationalAttainment.degree,
            remarks: currentFacultyAcademicSemesterSq.remarks,
        })
        .from(currentFacultyAcademicSemesterSq)
        .leftJoin(
            facultyRank,
            eq(facultyRank.id, currentFacultyAcademicSemesterSq.currentRankId),
        )
        .leftJoin(rank, eq(rank.id, facultyRank.rankId))
        .leftJoin(
            facultyEducationalAttainment,
            eq(
                facultyEducationalAttainment.id,
                currentFacultyAcademicSemesterSq.currentHighestEducationalAttainmentId,
            ),
        );

    if (currentFacultyAcademicSemesterArr.length !== 1) return null;
    const [currentFacultyAcademicSemester] = currentFacultyAcademicSemesterArr;

    return currentFacultyAcademicSemester;
}

export async function getFacultyAdminPositions(facultyAcademicSemesterid: number) {
    return await db
        .select({
            tupleid: facultyAdminPosition.id,
            adminPosition: adminPosition.title,
            office: office.name,
            startDate: facultyAdminPosition.startDate,
            endDate: facultyAdminPosition.endDate,
            administrativeLoadCredit: facultyAdminPosition.administrativeLoadCredit,
        })
        .from(facultyAdminPosition)
        .leftJoin(
            adminPosition,
            eq(adminPosition.id, facultyAdminPosition.adminPositionId),
        )
        .leftJoin(office, eq(office.id, facultyAdminPosition.officeId))
        .where(eq(facultyAdminPosition.facultyAcademicSemesterId, facultyAcademicSemesterid));
}

export type FacultyAdminPositionDTO = Awaited<ReturnType<typeof getFacultyAdminPositions>>;

export async function getFacultyCommittees(facultyAcademicSemesterid: number) {
    return await db
        .select({
            tupleid: facultyCommMembership.id,
            membership: facultyCommMembership.membership,
            committee: facultyCommMembership.committee,
            startDate: facultyCommMembership.startDate,
            endDate: facultyCommMembership.endDate,
            administrativeLoadCredit: facultyCommMembership.administrativeLoadCredit,
        })
        .from(facultyCommMembership)
        .where(eq(facultyCommMembership.facultyAcademicSemesterId, facultyAcademicSemesterid));
}

export type FacultyCommitteesDTO = Awaited<ReturnType<typeof getFacultyCommittees>>;

export async function getFacultyAdminWorks(facultyAcademicSemesterid: number) {
    return await db
        .select({
            tupleid: facultyAdminWork.id,
            natureOfWork: facultyAdminWork.natureOfWork,
            office: office.name,
            startDate: facultyAdminWork.startDate,
            endDate: facultyAdminWork.endDate,
            administrativeLoadCredit: facultyAdminWork.administrativeLoadCredit,
        })
        .from(facultyAdminWork)
        .leftJoin(office, eq(office.id, facultyAdminWork.officeId))
        .where(eq(facultyAdminWork.facultyAcademicSemesterId, facultyAcademicSemesterid));
}

export type FacultyAdminWorksDTO = Awaited<ReturnType<typeof getFacultyAdminWorks>>;

export async function getFacultyCoursesTaught(facultyAcademicSemesterid: number) {
    return await db
        .select({
            tupleid: facultyCourse.id,
            title: course.name,
            units: course.units,
            section: facultyCourse.section,
            numberOfStudents: facultyCourse.numberOfStudents,
            teachingLoadCredit: facultyCourse.teachingLoadCredit,
            sectionSET: facultyCourse.sectionSET,
        })
        .from(facultyCourse)
        .leftJoin(course, eq(course.id, facultyCourse.courseId))
        .where(eq(facultyCourse.facultyAcademicSemesterId, facultyAcademicSemesterid));
}

export type FacultyCoursesTaughtDTO = Awaited<ReturnType<typeof getFacultyCoursesTaught>>;

export async function getFacultyMentees(facultyAcademicSemesterid: number) {
    return await db
        .select({
            tupleid: facultyMentoring.id,
            lastName: student.lastName,
            middleName: student.middleName,
            firstName: student.firstName,
            category: facultyMentoring.category,
            startDate: facultyMentoring.startDate,
            endDate: facultyMentoring.endDate,
        })
        .from(facultyMentoring)
        .leftJoin(student, eq(student.id, facultyMentoring.studentId))
        .where(eq(facultyMentoring.facultyAcademicSemesterId, facultyAcademicSemesterid));
}

export type FacultyMenteesDTO = Awaited<ReturnType<typeof getFacultyMentees>>;

export async function getFacultyResearch(facultyAcademicSemesterid: number) {
    return await db
        .select({
            tupleid: facultyResearch.id,
            title: research.title,
            startDate: research.startDate,
            endDate: research.endDate,
            funding: research.funding,
            researchLoadCredit: facultyResearch.researchLoadCredit,
            remarks: facultyResearch.remarks,
        })
        .from(facultyResearch)
        .leftJoin(research, eq(research.id, facultyResearch.researchId))
        .where(eq(facultyResearch.facultyAcademicSemesterId, facultyAcademicSemesterid));
}

export type FacultyResearchDTO = Awaited<ReturnType<typeof getFacultyResearch>>;

export async function getFacultyExtension(facultyAcademicSemesterid: number) {
    return await db
        .select({
            tupleid: facultyExtension.id,
            natureOfExtension: facultyExtension.natureOfExtension,
            agency: facultyExtension.agency,
            startDate: facultyExtension.startDate,
            endDate: facultyExtension.endDate,
            extensionLoadCredit: facultyExtension.extensionLoadCredit,
        })
        .from(facultyExtension)
        .where(eq(facultyExtension.facultyAcademicSemesterId, facultyAcademicSemesterid));
}

export type FacultyExtensionDTO = Awaited<ReturnType<typeof getFacultyExtension>>;

export async function getFacultyStudyLoad(facultyAcademicSemesterid: number) {
    return await db
        .select({
            tupleid: facultyStudyLoad.id,
            degreeProgram: facultyStudyLoad.degreeProgram,
            university: facultyStudyLoad.university,
            studyLoadUnits: facultyStudyLoad.studyLoadUnits,
            onFullTimeLeaveWithPay: facultyStudyLoad.onFullTimeLeaveWithPay,
            isFacultyFellowshipRecipient: facultyStudyLoad.isFacultyFellowshipRecipient,
            studyLoadCredit: facultyStudyLoad.studyLoadCredit,
        })
        .from(facultyStudyLoad)
        .where(eq(facultyStudyLoad.facultyAcademicSemesterId, facultyAcademicSemesterid));
}

export type FacultyStudyLoadDTO = Awaited<ReturnType<typeof getFacultyStudyLoad>>;

export async function getFacultyProfile(facultyid: number) {
    // Personal Information
    const personalInfoArr = await db.select().from(faculty).where(eq(faculty.id, facultyid));
    if (personalInfoArr.length === 0) return null;
    const [personalInfo] = personalInfoArr;

    // Related Information
    const relatedInfo = await Promise.all([
        getFacultyContactNumbers(facultyid), // Contact Numbers
        getFacultyEducationalAttainments(facultyid), // Educational Attainments
        getFacultyFieldsOfInterest(facultyid), // Fields of Interest
        getFacultyPromotionHistory(facultyid), // Promotion History
        getFacultyHomeAddresses(facultyid), // Home Addresses
        getFacultyEmailAddresses(facultyid), // Emails
    ]);

    return {
        ...personalInfo,
        contactNumbers: relatedInfo[0],
        educationalAttainments: relatedInfo[1],
        fieldsOfInterest: relatedInfo[2],
        promotionHistory: relatedInfo[3],
        homeAddresses: relatedInfo[4],
        emailAddresses: relatedInfo[5],
    };
}

export type FacultyProfileRecordDTO = Awaited<ReturnType<typeof getFacultyProfile>>;

export async function getFacultySemestralRecords(
    facultyid: number,
    acadYear: number,
    semNum: number,
) {
    // Semestral Details
    const facultyAcademicSemester = await getFacultyAcademicSemester(facultyid, acadYear, semNum);
    if (facultyAcademicSemester === null) return null;

    const { id } = facultyAcademicSemester;

    // Related Information
    const relatedInfo = await Promise.all([
        // Administrative
        getFacultyAdminPositions(id), // Admin Positions
        getFacultyCommittees(id), // Committee Memberships
        getFacultyAdminWorks(id), // Admin Works

        // Teaching
        getFacultyCoursesTaught(id), // Courses Taught
        getFacultyMentees(id), // Mentees

        getFacultyResearch(id), // Research

        getFacultyExtension(id), // Extension

        getFacultyStudyLoad(id), // Study Load
    ]);

    return {
        ...facultyAcademicSemester,
        adminPositions: relatedInfo[0],
        committees: relatedInfo[1],
        adminWorks: relatedInfo[2],

        coursesTaught: relatedInfo[3],
        mentees: relatedInfo[4],

        researchWork: relatedInfo[5],

        extensionWork: relatedInfo[6],

        studyLoad: relatedInfo[7],
    };
}

export type FacultySemestralRecordDTO = Awaited<ReturnType<typeof getFacultySemestralRecords>>;

export async function getAllFacultyAcademicSemesters(facultyid: number) {
    return await db
        .select({
            acadYear: academicSemester.academicYear,
            semNum: academicSemester.semesterNumber,
        })
        .from(facultyAcademicSemester)
        .leftJoin(academicSemester, eq(academicSemester.id, facultyAcademicSemester.academicSemesterId))
        .where(eq(facultyAcademicSemester.facultyId, facultyid));
}

// TODO: Limit semester.semester values
export function getAllSemesterms() {
    return ['Midyear', '1st Semester', '2nd Semester'];
}

export async function getAllFieldsOfInterest() {
    const fields = await db
        .select({
            field: fieldOfInterest.field,
        })
        .from(fieldOfInterest);

    return fields.map(({ field }) => field);
}

export async function getAllRanks() {
    return await db
        .select({
            title: rank.title,
            salaryGrade: rank.salaryGrade,
            salaryRate: rank.salaryRate,
        })
        .from(rank);
}

export async function getAllAppointmentStatuses() {
    const appointmentStatuses = await db
        .select({
            appointmentStatus: appointmentStatus.appointmentStatus,
        })
        .from(appointmentStatus);

    return appointmentStatuses.map(({ appointmentStatus }) => appointmentStatus);
}

export async function getAllAdminPositions() {
    const adminPositions = await db
        .select({
            adminPosition: adminPosition.title,
        })
        .from(adminPosition);

    return adminPositions.map(({ adminPosition }) => adminPosition);
}

export async function getAllOffices() {
    const offices = await db
        .select({
            officeName: office.name,
        })
        .from(office);

    return offices.map(({ officeName }) => officeName);
}

export async function getAllResearches() {
    return await db
        .select({
            title: research.title,
            startDate: research.startDate,
            endDate: research.endDate,
            funding: research.funding,
        })
        .from(research);
}

export async function getAllCourses() {
    return await db
        .select({
            title: course.name,
            units: course.units,
        })
        .from(course);
}
