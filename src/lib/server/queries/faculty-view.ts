import { and, eq } from 'drizzle-orm';

import {
    adminposition,
    appointmentstatus,
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
    semester,
    student,
} from '../db/schema';
import { db } from '../db';

export async function getFacultyName(facultyid: number) {
    const response = await db
        .select({
            lastName: faculty.lastname,
            firstName: faculty.firstname,
        })
        .from(faculty)
        .where(eq(faculty.facultyid, facultyid));

    if (response.length === 0) return null;

    const [record] = response;
    return record;
}

export async function getFacultyContactNumbers(facultyid: number) {
    return await db
        .select({
            tupleid: facultycontactnumber.facultycontactnumberid,
            contactNum: facultycontactnumber.contactnumber,
        })
        .from(facultycontactnumber)
        .where(eq(facultycontactnumber.facultyid, facultyid));
}

export async function getFacultyEducationalAttainments(facultyid: number) {
    return await db
        .select({
            tupleid: facultyeducationalattainment.facultyeducationalattainmentid,
            degree: facultyeducationalattainment.degree,
            institution: facultyeducationalattainment.institution,
            graduationYear: facultyeducationalattainment.graduationyear,
        })
        .from(facultyeducationalattainment)
        .where(eq(facultyeducationalattainment.facultyid, facultyid));
}

export async function getFacultyFieldsOfInterest(facultyid: number) {
    return await db
        .select({
            tupleid: facultyfieldofinterest.facultyfieldofinterestid,
            field: fieldofinterest.field,
        })
        .from(facultyfieldofinterest)
        .leftJoin(
            fieldofinterest,
            eq(fieldofinterest.fieldofinterestid, facultyfieldofinterest.fieldofinterestid),
        )
        .where(eq(facultyfieldofinterest.facultyid, facultyid));
}

export async function getFacultyPromotionHistory(facultyid: number) {
    return await db
        .select({
            tupleid: facultyrank.facultyrankid,
            rankTitle: rank.ranktitle,
            appointmentStatus: facultyrank.appointmentstatus,
            dateOfTenureOrRenewal: facultyrank.dateoftenureorrenewal,
        })
        .from(facultyrank)
        .leftJoin(rank, eq(rank.rankid, facultyrank.rankid))
        .where(eq(facultyrank.facultyid, facultyid));
}

export async function getFacultyHomeAddresses(facultyid: number) {
    return await db
        .select({
            tupleid: facultyhomeaddress.facultyhomeaddressid,
            homeAddress: facultyhomeaddress.homeaddress,
        })
        .from(facultyhomeaddress)
        .where(eq(facultyhomeaddress.facultyid, facultyid));
}

export async function getFacultyEmailAddresses(facultyid: number) {
    return await db
        .select({
            tupleid: facultyemail.facultyemailid,
            email: facultyemail.email,
        })
        .from(facultyemail)
        .where(eq(facultyemail.facultyid, facultyid));
}

export async function getFacultySemester(facultyid: number, acadYear: number, semNum: number) {
    const currentSemesterArr = await db
        .select({
            acadsemesterid: semester.acadsemesterid,
        })
        .from(semester)
        .where(and(eq(semester.academicyear, acadYear), eq(semester.semester, semNum)));

    if (currentSemesterArr.length !== 1) return null;
    const [currentSemester] = currentSemesterArr;

    const currentFacultySemesterSq = await db
        .select({
            facultysemesterid: facultysemester.facultysemesterid,
            currentrankid: facultysemester.currentrankid,
            currenthighesteducationalattainmentid:
                facultysemester.currenthighesteducationalattainmentid,
            remarks: facultysemester.remarks,
        })
        .from(facultysemester)
        .where(
            and(
                eq(facultysemester.facultyid, facultyid),
                eq(facultysemester.acadsemesterid, currentSemester.acadsemesterid),
            ),
        )
        .as('current_faculty_semester_sq');

    const currentFacultySemesterArr = await db.select().from(currentFacultySemesterSq);
    if (currentFacultySemesterArr.length !== 1) return null;

    const currentFacultySemester = await db
        .select({
            facultysemesterid: currentFacultySemesterSq.facultysemesterid,
            currentRankTitle: rank.ranktitle,
            currentHighestDegree: facultyeducationalattainment.degree,
            remarks: currentFacultySemesterSq.remarks,
        })
        .from(currentFacultySemesterSq)
        .leftJoin(
            facultyrank,
            eq(facultyrank.facultyrankid, currentFacultySemesterSq.currentrankid),
        )
        .leftJoin(rank, eq(rank.rankid, facultyrank.rankid))
        .leftJoin(
            facultyeducationalattainment,
            eq(
                facultyeducationalattainment.facultyeducationalattainmentid,
                currentFacultySemesterSq.currenthighesteducationalattainmentid,
            ),
        );

    if (currentFacultySemester.length !== 1) return null;
    const [facultySemester] = currentFacultySemester;

    return facultySemester;
}

export async function getFacultyAdminPositions(facultysemesterid: number) {
    return await db
        .select({
            tupleid: facultyadminposition.facultyadminpositionid,
            adminPosition: adminposition.name,
            office: office.name,
            startDate: facultyadminposition.startdate,
            endDate: facultyadminposition.enddate,
            administrativeLoadCredit: facultyadminposition.administrativeloadcredit,
        })
        .from(facultyadminposition)
        .leftJoin(
            adminposition,
            eq(adminposition.adminpositionid, facultyadminposition.adminpositionid),
        )
        .leftJoin(office, eq(office.officeid, facultyadminposition.officeid))
        .where(eq(facultyadminposition.facultysemesterid, facultysemesterid));
}

export type FacultyAdminPositionDTO = Awaited<ReturnType<typeof getFacultyAdminPositions>>;

export async function getFacultyCommittees(facultysemesterid: number) {
    return await db
        .select({
            tupleid: facultycommmembership.facultycommmembershipid,
            membership: facultycommmembership.membership,
            committee: facultycommmembership.committee,
            startDate: facultycommmembership.startdate,
            endDate: facultycommmembership.enddate,
            administrativeLoadCredit: facultycommmembership.administrativeloadcredit,
        })
        .from(facultycommmembership)
        .where(eq(facultycommmembership.facultysemesterid, facultysemesterid));
}

export type FacultyCommitteesDTO = Awaited<ReturnType<typeof getFacultyCommittees>>;

export async function getFacultyAdminWorks(facultysemesterid: number) {
    return await db
        .select({
            tupleid: facultyadminwork.facultyadminworkid,
            natureOfWork: facultyadminwork.natureofwork,
            office: office.name,
            startDate: facultyadminwork.startdate,
            endDate: facultyadminwork.enddate,
            administrativeLoadCredit: facultyadminwork.administrativeloadcredit,
        })
        .from(facultyadminwork)
        .leftJoin(office, eq(office.officeid, facultyadminwork.officeid))
        .where(eq(facultyadminwork.facultysemesterid, facultysemesterid));
}

export type FacultyAdminWorksDTO = Awaited<ReturnType<typeof getFacultyAdminWorks>>;

export async function getFacultyCoursesTaught(facultysemesterid: number) {
    return await db
        .select({
            tupleid: facultycourse.facultycourseid,
            title: course.coursename,
            units: course.units,
            section: facultycourse.section,
            numberOfStudents: facultycourse.numberofstudents,
            teachingLoadCredit: facultycourse.teachingloadcredit,
            sectionSET: facultycourse.sectionset,
        })
        .from(facultycourse)
        .leftJoin(course, eq(course.courseid, facultycourse.courseid))
        .where(eq(facultycourse.facultysemesterid, facultysemesterid));
}

export type FacultyCoursesTaughtDTO = Awaited<ReturnType<typeof getFacultyCoursesTaught>>;

export async function getFacultyMentees(facultysemesterid: number) {
    return await db
        .select({
            tupleid: facultymentoring.facultymentoringid,
            lastName: student.lastname,
            middleName: student.middlename,
            firstName: student.firstname,
            category: facultymentoring.category,
            startDate: facultymentoring.startdate,
            endDate: facultymentoring.enddate,
            teachingLoadCredit: facultymentoring.teachingloadcredit,
        })
        .from(facultymentoring)
        .leftJoin(student, eq(student.studentnumber, facultymentoring.studentnumber))
        .where(eq(facultymentoring.facultysemesterid, facultysemesterid));
}

export type FacultyMenteesDTO = Awaited<ReturnType<typeof getFacultyMentees>>;

export async function getFacultyResearch(facultysemesterid: number) {
    return await db
        .select({
            tupleid: facultyresearch.facultyresearchid,
            title: research.title,
            startDate: research.startdate,
            endDate: research.enddate,
            funding: research.funding,
            researchLoadCredit: facultyresearch.researchloadcredit,
            remarks: facultyresearch.remarks,
        })
        .from(facultyresearch)
        .leftJoin(research, eq(research.researchid, facultyresearch.researchid))
        .where(eq(facultyresearch.facultysemesterid, facultysemesterid));
}

export type FacultyResearchDTO = Awaited<ReturnType<typeof getFacultyResearch>>;

export async function getFacultyExtension(facultysemesterid: number) {
    return await db
        .select({
            tupleid: facultyextension.facultyextensionid,
            natureOfExtension: facultyextension.natureofextension,
            agency: facultyextension.agency,
            startDate: facultyextension.startdate,
            endDate: facultyextension.enddate,
            extensionLoadCredit: facultyextension.extensionloadcredit,
        })
        .from(facultyextension)
        .where(eq(facultyextension.facultysemesterid, facultysemesterid));
}

export type FacultyExtensionDTO = Awaited<ReturnType<typeof getFacultyExtension>>;

export async function getFacultyStudyLoad(facultysemesterid: number) {
    return await db
        .select({
            tupleid: facultystudyload.facultystudyloadid,
            degreeProgram: facultystudyload.degreeprogram,
            university: facultystudyload.university,
            studyLoadUnits: facultystudyload.studyloadunits,
            onFullTimeLeaveWithPay: facultystudyload.onfulltimeleavewithpay,
            isFacultyFellowshipRecipient: facultystudyload.isfacultyfellowshiprecipient,
            studyLoadCredit: facultystudyload.studyloadcredit,
        })
        .from(facultystudyload)
        .where(eq(facultystudyload.facultysemesterid, facultysemesterid));
}

export type FacultyStudyLoadDTO = Awaited<ReturnType<typeof getFacultyStudyLoad>>;

export async function getFacultyProfile(facultyid: number) {
    // Personal Information
    const personalInfoArr = await db.select().from(faculty).where(eq(faculty.facultyid, facultyid));
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
    const facultySemester = await getFacultySemester(facultyid, acadYear, semNum);
    if (facultySemester === null) return null;

    const { facultysemesterid } = facultySemester;

    // Related Information
    const relatedInfo = await Promise.all([
        // Administrative
        getFacultyAdminPositions(facultysemesterid), // Admin Positions
        getFacultyCommittees(facultysemesterid), // Committee Memberships
        getFacultyAdminWorks(facultysemesterid), // Admin Works

        // Teaching
        getFacultyCoursesTaught(facultysemesterid), // Courses Taught
        getFacultyMentees(facultysemesterid), // Mentees

        getFacultyResearch(facultysemesterid), // Research

        getFacultyExtension(facultysemesterid), // Extension

        getFacultyStudyLoad(facultysemesterid), // Study Load
    ]);

    return {
        ...facultySemester,
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

export async function getAllFacultySemesters(facultyid: number) {
    return await db
        .select({
            acadYear: semester.academicyear,
            semNum: semester.semester,
        })
        .from(facultysemester)
        .leftJoin(semester, eq(semester.acadsemesterid, facultysemester.acadsemesterid))
        .where(eq(facultysemester.facultyid, facultyid));
}

// TODO: Limit semester.semester values
export function getAllSemesterms() {
    return ['Midyear', '1st Semester', '2nd Semester'];
}

export async function getAllFieldsOfInterest() {
    const fields = await db
        .select({
            field: fieldofinterest.field,
        })
        .from(fieldofinterest);

    return fields.map(({ field }) => field);
}

export async function getAllRanks() {
    return await db
        .select({
            rankTitle: rank.ranktitle,
            salaryGrade: rank.salarygrade,
            salaryRate: rank.salaryrate,
        })
        .from(rank);
}

export async function getAllAppointmentStatuses() {
    const appointmentStatuses = await db
        .select({
            appointmentstatus: appointmentstatus.appointmentstatus,
        })
        .from(appointmentstatus);

    return appointmentStatuses.map(({ appointmentstatus }) => appointmentstatus);
}

export async function getAllAdminPositions() {
    const adminPositions = await db
        .select({
            adminPosition: adminposition.name,
        })
        .from(adminposition);

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
            startDate: research.startdate,
            endDate: research.enddate,
            funding: research.funding,
        })
        .from(research);
}

export async function getAllCourses() {
    return await db
        .select({
            title: course.coursename,
            units: course.units,
        })
        .from(course);
}
