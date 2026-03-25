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

export async function getFacultyBySubjectReport(acadYear: number, semNum: number) {
    return await db
        .select({
            courseTaught: course.coursename,
            faculty: sql<string>`STRING_AGG(${faculty.firstname} || ' ' || ${faculty.lastname}, ', ' ORDER BY ${asc(faculty.lastname)}, ${asc(faculty.firstname)})`,
        })
        .from(facultycourse)
        .innerJoin(course, eq(facultycourse.courseid, course.courseid))
        .innerJoin(facultysemester, eq(facultycourse.facultysemesterid, facultysemester.facultysemesterid))
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

    const [midyearCoursesQuery, firstSemCoursesQuery, secondSemCoursesQuery] = [0,1,2].map(semNum => {
        return db
            .select({
                courseName: course.coursename,
                section: facultycourse.section,
                sectionSET: facultycourse.sectionset,
            })
            .from(facultycourse)
            .innerJoin(course, eq(facultycourse.courseid, course.courseid))
            .innerJoin(facultysemester, eq(facultycourse.facultysemesterid, facultysemester.facultysemesterid))
            .innerJoin(semester, eq(facultysemester.acadsemesterid, semester.acadsemesterid))
            .where(and(eq(facultysemester.facultyid, facultyid), eq(semester.academicyear, acadYear), eq(semester.semester, semNum)));
    });

    const [[facultyInfo,], firstSemCourses, secondSemCourses, midyearCourses] = await Promise.all([
        facultyInfoQuery,
        firstSemCoursesQuery,
        secondSemCoursesQuery,
        midyearCoursesQuery,
    ]);

    return { facultyInfo, semestralCoursesInfo: [firstSemCourses, secondSemCourses, midyearCourses] };
}