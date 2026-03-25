import { db } from '../db/index'; 
import { faculty, facultycourse, course, semester, facultysemester, facultyadminposition, rank, facultyeducationalattainment, adminposition, facultycommmembership, facultyresearch, facultyadminwork, facultyrank } from '../db/schema';
import { eq, and, sql, avg, asc } from 'drizzle-orm';

export async function getFacultyLoadingReport(facultyid: number, acadYear: number) {
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
            administrativeLoadCredit: sql<number>`COALESCE(sum(${facultyadminposition.administrativeloadcredit}), 0) + COALESCE(sum(${facultycommmembership.administrativeloadcredit}), 0) + COALESCE(sum(${facultyadminwork.administrativeloadcredit}), 0)`.mapWith(Number),
            teachingLoadCredit: sql<number>`COALESCE(sum(${facultycourse.teachingloadcredit}), 0)`.mapWith(Number),
            researchLoadCredit: sql<number>`COALESCE(sum(${facultyresearch.researchloadcredit}), 0)`.mapWith(Number),
        })
        .from(faculty)
        .innerJoin(facultysemester, eq(faculty.facultyid, facultysemester.facultyid))
        .innerJoin(semester, eq(facultysemester.acadsemesterid, semester.acadsemesterid))
        .leftJoin(facultyrank, eq(facultysemester.currentrankid, facultyrank.facultyrankid))
        .leftJoin(rank, eq(facultyrank.rankid, rank.rankid))
        .leftJoin(facultyeducationalattainment, eq(facultysemester.currenthighesteducationalattainmentid, facultyeducationalattainment.facultyeducationalattainmentid))
        .leftJoin(facultycourse, eq(facultysemester.facultysemesterid, facultycourse.facultysemesterid))
        .leftJoin(course, eq(facultycourse.courseid, course.courseid))
        .leftJoin(facultyadminposition, eq(facultysemester.facultysemesterid, facultyadminposition.facultysemesterid))
        .leftJoin(adminposition, eq(facultyadminposition.adminpositionid, adminposition.adminpositionid))
        .leftJoin(facultycommmembership, eq(facultysemester.facultysemesterid, facultycommmembership.facultysemesterid))
        .leftJoin(facultyadminwork, eq(facultysemester.facultysemesterid, facultyadminwork.facultysemesterid))
        .leftJoin(facultyresearch, eq(facultysemester.facultysemesterid, facultyresearch.facultysemesterid))
        .where(and(eq(faculty.facultyid, facultyid), eq(semester.academicyear, acadYear)))
        .groupBy(faculty.lastname, faculty.firstname, faculty.middlename, rank.ranktitle, facultyeducationalattainment.degree);
}

export async function getSubjectsByFacultyReport(facultyid: number, acadYear: number, semNum: number) {
    return await db
        .select({
            lastName: faculty.lastname,
            firstName: faculty.firstname,
            middleName: faculty.middlename,
            coursesTaught: sql<string>`STRING_AGG(${course.coursename}, ', ' ORDER BY ${course.coursename})`,
        })
        .from(facultycourse)
        .innerJoin(course, eq(facultycourse.courseid, course.courseid))
        .innerJoin(facultysemester, eq(facultycourse.facultysemesterid, facultysemester.facultysemesterid))
        .innerJoin(faculty, eq(facultysemester.facultyid, faculty.facultyid))
        .innerJoin(semester, eq(facultysemester.acadsemesterid, semester.acadsemesterid))
        .where(and(eq(faculty.facultyid, facultyid), eq(semester.academicyear, acadYear), eq(semester.semester, semNum)))
        .groupBy(faculty.lastname, faculty.firstname, faculty.middlename);
}

// TASK 7: Faculty (By Subject Taught - The "Curriculum" View)
export async function getFacultyBySubjectReport(acadYear: number, semNum: number) {
    return await db
        .select({
            courseCode: course.coursename,
            section: facultycourse.section,
            facultyName: sql<string>`${faculty.lastname} || ', ' || ${faculty.firstname}`,
            students: facultycourse.numberofstudents
        })
        .from(facultycourse)
        .innerJoin(course, eq(facultycourse.courseid, course.courseid))
        .innerJoin(facultysemester, eq(facultycourse.facultysemesterid, facultysemester.facultysemesterid))
        .innerJoin(faculty, eq(facultysemester.facultyid, faculty.facultyid))
        .innerJoin(semester, eq(facultysemester.acadsemesterid, semester.acadsemesterid))
        .where(and(eq(semester.academicyear, acadYear), eq(semester.semester, semNum)))
        .orderBy(course.coursename, facultycourse.section); // Sort by subject/section
}

// TASK 8: Faculty SET Average
export async function getFacultySETReport(acadYear: number, semNum: number) {
    return await db
        .select({
            name: sql<string>`${faculty.lastname} || ', ' || ${faculty.firstname}`,
            averageSET: avg(facultycourse.sectionset)
        })
        .from(faculty)
        .innerJoin(facultysemester, eq(faculty.facultyid, facultysemester.facultyid))
        .innerJoin(semester, eq(facultysemester.acadsemesterid, semester.acadsemesterid))
        .innerJoin(facultycourse, eq(facultysemester.facultysemesterid, facultycourse.facultysemesterid))
        .where(and(eq(semester.academicyear, acadYear), eq(semester.semester, semNum)))
        .groupBy(faculty.facultyid, faculty.lastname, faculty.firstname);
}