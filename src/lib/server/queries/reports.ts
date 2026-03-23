import { db } from '../db/index'; 
import { faculty, facultycourse, course, semester, facultysemester, facultyadminposition } from '../db/schema';
import { eq, and, sql, avg } from 'drizzle-orm';

// TASK 5
export async function getFacultyLoadingReport(acadYear: number, semNum: number) {
    return await db
        .select({
            name: sql<string>`${faculty.lastname} || ', ' || ${faculty.firstname}`,
            teachingLoad: sql<number>`COALESCE(sum(${facultycourse.teachingloadcredit}), 0)`,
            adminLoad: sql<number>`COALESCE(sum(${facultyadminposition.administrativeloadcredit}), 0)`
        })
        .from(faculty)
        .innerJoin(facultysemester, eq(faculty.facultyid, facultysemester.facultyid))
        .innerJoin(semester, eq(facultysemester.acadsemesterid, semester.acadsemesterid))
        .leftJoin(facultycourse, eq(facultysemester.facultysemesterid, facultycourse.facultysemesterid))
        .leftJoin(facultyadminposition, eq(facultysemester.facultysemesterid, facultyadminposition.facultysemesterid))
        .where(and(eq(semester.academicyear, acadYear), eq(semester.semester, semNum)))
        .groupBy(faculty.facultyid, faculty.lastname, faculty.firstname);
}

// TASK 6 & 7
export async function getSubjectsReport(acadYear: number, semNum: number) {
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
        .where(and(eq(semester.academicyear, acadYear), eq(semester.semester, semNum)));
}

// TASK 8 - Match this name to the +server.ts file!
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