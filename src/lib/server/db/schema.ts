import {
    boolean,
    date,
    foreignKey,
    index,
    integer,
    numeric,
    pgMaterializedView,
    pgTable,
    serial,
    smallint,
    text,
    timestamp,
    unique,
    varchar,
} from 'drizzle-orm/pg-core';
import { eq, relations, sql } from 'drizzle-orm';

import { appuser } from './auth.schema';
export * from './auth.schema';

export const changelog = pgTable(
    'changelog',
    {
        logid: serial().primaryKey().notNull(),
        timestamp: timestamp().defaultNow().notNull(),
        userid: text(),
        tupleid: integer(),
        operation: text().notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.userid],
            foreignColumns: [appuser.id],
            name: 'changelog_userid_fkey',
        }).onDelete('set null'),
    ],
);

export const status = pgTable('status', {
    status: varchar({ length: 50 }).primaryKey().notNull(),
});

export const faculty = pgTable(
    'faculty',
    {
        facultyid: serial().primaryKey().notNull(),
        lastname: varchar({ length: 100 }).notNull(),
        middlename: varchar({ length: 100 }).notNull(),
        firstname: varchar({ length: 100 }).notNull(),
        suffix: varchar({ length: 50 }),
        birthdate: date().notNull(),
        status: varchar({ length: 50 }).notNull(),
        dateoforiginalappointment: date().notNull(),
        psiitem: varchar({ length: 50 }).notNull(),
        employeenumber: varchar({ length: 50 }).notNull(),
        tin: varchar({ length: 50 }).notNull(),
        gsis: varchar({ length: 50 }).notNull(),
        philhealth: varchar({ length: 50 }).notNull(),
        pagibig: varchar({ length: 50 }).notNull(),
        remarks: text(),
        latestchangelogid: integer(),
    },
    (table) => [
        foreignKey({
            columns: [table.latestchangelogid],
            foreignColumns: [changelog.logid],
            name: 'faculty_latestchangelogid_fkey',
        }),
        foreignKey({
            columns: [table.status],
            foreignColumns: [status.status],
            name: 'faculty_status_fkey',
        }),
    ],
);

export const facultycontactnumber = pgTable(
    'facultycontactnumber',
    {
        facultycontactnumberid: serial().primaryKey().notNull(),
        facultyid: integer(),
        contactnumber: varchar({ length: 20 }).notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.facultyid],
            foreignColumns: [faculty.facultyid],
            name: 'facultycontactnumber_facultyid_fkey',
        }).onDelete('cascade'),
    ],
);

export const facultyeducationalattainment = pgTable(
    'facultyeducationalattainment',
    {
        facultyeducationalattainmentid: serial().primaryKey().notNull(),
        facultyid: integer(),
        degree: varchar({ length: 100 }).notNull(),
        institution: varchar({ length: 200 }).notNull(),
        graduationyear: integer(),
    },
    (table) => [
        foreignKey({
            columns: [table.facultyid],
            foreignColumns: [faculty.facultyid],
            name: 'facultyeducationalattainment_facultyid_fkey',
        }).onDelete('cascade'),
    ],
);

export const fieldofinterest = pgTable(
    'fieldofinterest',
    {
        fieldofinterestid: serial().primaryKey().notNull(),
        field: varchar({ length: 100 }).notNull(),
    },
    (table) => [unique('fieldofinterest_field_key').on(table.field)],
);

export const facultyfieldofinterest = pgTable(
    'facultyfieldofinterest',
    {
        facultyfieldofinterestid: serial().primaryKey().notNull(),
        facultyid: integer(),
        fieldofinterestid: integer(),
    },
    (table) => [
        foreignKey({
            columns: [table.facultyid],
            foreignColumns: [faculty.facultyid],
            name: 'facultyfieldofinterest_facultyid_fkey',
        }).onDelete('cascade'),
        foreignKey({
            columns: [table.fieldofinterestid],
            foreignColumns: [fieldofinterest.fieldofinterestid],
            name: 'facultyfieldofinterest_fieldofinterestid_fkey',
        }).onDelete('cascade'),
    ],
);

export const rank = pgTable('rank', {
    rankid: serial().primaryKey().notNull(),
    ranktitle: varchar({ length: 100 }).notNull(),
    salarygrade: varchar({ length: 10 }).notNull(),
    salaryrate: numeric({ precision: 10, scale: 2 }).notNull(),
});

export const facultyrank = pgTable(
    'facultyrank',
    {
        facultyrankid: serial().primaryKey().notNull(),
        facultyid: integer(),
        rankid: integer(),
        appointmentstatus: varchar({ length: 50 }).notNull(),
        dateoftenureorrenewal: date().notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.facultyid],
            foreignColumns: [faculty.facultyid],
            name: 'facultyrank_facultyid_fkey',
        }).onDelete('cascade'),
        foreignKey({
            columns: [table.rankid],
            foreignColumns: [rank.rankid],
            name: 'facultyrank_rankid_fkey',
        }),
    ],
);

export const facultyhomeaddress = pgTable(
    'facultyhomeaddress',
    {
        facultyhomeaddressid: serial().primaryKey().notNull(),
        facultyid: integer(),
        homeaddress: text().notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.facultyid],
            foreignColumns: [faculty.facultyid],
            name: 'facultyhomeaddress_facultyid_fkey',
        }).onDelete('cascade'),
    ],
);

export const facultyemail = pgTable(
    'facultyemail',
    {
        facultyemailid: serial().primaryKey().notNull(),
        facultyid: integer(),
        email: varchar({ length: 100 }).notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.facultyid],
            foreignColumns: [faculty.facultyid],
            name: 'facultyemail_facultyid_fkey',
        }).onDelete('cascade'),
    ],
);

export const semester = pgTable('semester', {
    acadsemesterid: serial().primaryKey().notNull(),
    semester: smallint().notNull(),
    academicyear: integer().notNull(),
});

export const facultysemester = pgTable(
    'facultysemester',
    {
        facultysemesterid: serial().primaryKey().notNull(),
        facultyid: integer(),
        acadsemesterid: integer(),
        currentrankid: integer(),
        currenthighesteducationalattainmentid: integer(),
    },
    (table) => [
        foreignKey({
            columns: [table.facultyid],
            foreignColumns: [faculty.facultyid],
            name: 'facultysemester_facultyid_fkey',
        }).onDelete('cascade'),
        foreignKey({
            columns: [table.acadsemesterid],
            foreignColumns: [semester.acadsemesterid],
            name: 'facultysemester_acadsemesterid_fkey',
        }),
        foreignKey({
            columns: [table.currentrankid],
            foreignColumns: [facultyrank.facultyrankid],
            name: 'facultysemester_currentrankid_fkey',
        }),
        foreignKey({
            columns: [table.currenthighesteducationalattainmentid],
            foreignColumns: [facultyeducationalattainment.facultyeducationalattainmentid],
            name: 'facultysemester_currenthighesteducationalattainmentid_fkey',
        }),
    ],
);

export const adminposition = pgTable('adminposition', {
    adminpositionid: serial().primaryKey().notNull(),
    name: varchar({ length: 100 }).notNull(),
});

export const office = pgTable('office', {
    officeid: serial().primaryKey().notNull(),
    name: varchar({ length: 100 }).notNull(),
});

export const facultyadminposition = pgTable(
    'facultyadminposition',
    {
        facultyadminpositionid: serial().primaryKey().notNull(),
        facultysemesterid: integer(),
        adminpositionid: integer(),
        officeid: integer(),
        startdate: date().notNull(),
        enddate: date().notNull(),
        administrativeloadcredit: numeric({ precision: 5, scale: 2 }).notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.facultysemesterid],
            foreignColumns: [facultysemester.facultysemesterid],
            name: 'facultyadminposition_facultysemesterid_fkey',
        }).onDelete('set null'),
        foreignKey({
            columns: [table.adminpositionid],
            foreignColumns: [adminposition.adminpositionid],
            name: 'facultyadminposition_adminpositionid_fkey',
        }),
        foreignKey({
            columns: [table.officeid],
            foreignColumns: [office.officeid],
            name: 'facultyadminposition_officeid_fkey',
        }),
    ],
);

export const facultycommmembership = pgTable(
    'facultycommmembership',
    {
        facultycommmembershipid: serial().primaryKey().notNull(),
        facultysemesterid: integer(),
        membership: varchar({ length: 100 }).notNull(),
        committee: varchar({ length: 150 }).notNull(),
        startdate: date().notNull(),
        enddate: date().notNull(),
        administrativeloadcredit: numeric({ precision: 5, scale: 2 }).notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.facultysemesterid],
            foreignColumns: [facultysemester.facultysemesterid],
            name: 'facultycommmembership_facultysemesterid_fkey',
        }).onDelete('set null'),
    ],
);

export const facultyadminwork = pgTable(
    'facultyadminwork',
    {
        facultyadminworkid: serial().primaryKey().notNull(),
        facultysemesterid: integer(),
        natureofwork: varchar({ length: 200 }).notNull(),
        officeid: integer(),
        startdate: date().notNull(),
        enddate: date().notNull(),
        administrativeloadcredit: numeric({ precision: 5, scale: 2 }).notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.facultysemesterid],
            foreignColumns: [facultysemester.facultysemesterid],
            name: 'facultyadminwork_facultysemesterid_fkey',
        }).onDelete('set null'),
        foreignKey({
            columns: [table.officeid],
            foreignColumns: [office.officeid],
            name: 'facultyadminwork_officeid_fkey',
        }),
    ],
);

export const course = pgTable('course', {
    courseid: serial().primaryKey().notNull(),
    coursename: varchar({ length: 100 }).notNull(),
    units: integer().notNull(),
});

export const facultycourse = pgTable(
    'facultycourse',
    {
        facultycourseid: serial().primaryKey().notNull(),
        facultysemesterid: integer(),
        courseid: integer(),
        section: varchar({ length: 50 }),
        numberofstudents: integer(),
        teachingloadcredit: numeric({ precision: 5, scale: 2 }).notNull(),
        sectionset: numeric({ precision: 4, scale: 3 }),
    },
    (table) => [
        foreignKey({
            columns: [table.facultysemesterid],
            foreignColumns: [facultysemester.facultysemesterid],
            name: 'facultycourse_facultysemesterid_fkey',
        }).onDelete('set null'),
        foreignKey({
            columns: [table.courseid],
            foreignColumns: [course.courseid],
            name: 'facultycourse_courseid_fkey',
        }),
    ],
);

export const student = pgTable('student', {
    studentnumber: serial().primaryKey().notNull(),
    lastname: varchar({ length: 100 }).notNull(),
    middlename: varchar({ length: 100 }).notNull(),
    firstname: varchar({ length: 100 }).notNull(),
});

export const facultymentoring = pgTable(
    'facultymentoring',
    {
        facultymentoringid: serial().primaryKey().notNull(),
        facultysemesterid: integer(),
        studentnumber: integer(),
        category: varchar({ length: 50 }),
        startdate: date().notNull(),
        enddate: date().notNull(),
        teachingloadcredit: numeric({ precision: 5, scale: 2 }).notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.facultysemesterid],
            foreignColumns: [facultysemester.facultysemesterid],
            name: 'facultymentoring_facultysemesterid_fkey',
        }).onDelete('set null'),
        foreignKey({
            columns: [table.studentnumber],
            foreignColumns: [student.studentnumber],
            name: 'facultymentoring_studentnumber_fkey',
        }),
    ],
);

export const research = pgTable('research', {
    researchid: serial().primaryKey().notNull(),
    title: varchar({ length: 200 }).notNull(),
    startdate: date().notNull(),
    enddate: date().notNull(),
    funding: text(),
});

export const facultyresearch = pgTable(
    'facultyresearch',
    {
        facultyresearchid: serial().primaryKey().notNull(),
        facultysemesterid: integer(),
        researchid: integer(),
        researchloadcredit: numeric({ precision: 5, scale: 2 }).notNull(),
        remarks: text(),
    },
    (table) => [
        foreignKey({
            columns: [table.facultysemesterid],
            foreignColumns: [facultysemester.facultysemesterid],
            name: 'facultyresearch_facultysemesterid_fkey',
        }).onDelete('set null'),
        foreignKey({
            columns: [table.researchid],
            foreignColumns: [research.researchid],
            name: 'facultyresearch_researchid_fkey',
        }),
    ],
);

export const facultyextension = pgTable(
    'facultyextension',
    {
        facultyextensionid: serial().primaryKey().notNull(),
        facultysemesterid: integer(),
        natureofextension: varchar({ length: 200 }).notNull(),
        agency: varchar({ length: 150 }).notNull(),
        startdate: date().notNull(),
        enddate: date().notNull(),
        extensionloadcredit: numeric({ precision: 5, scale: 2 }).notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.facultysemesterid],
            foreignColumns: [facultysemester.facultysemesterid],
            name: 'facultyextension_facultysemesterid_fkey',
        }).onDelete('set null'),
    ],
);

export const facultystudyload = pgTable(
    'facultystudyload',
    {
        facultystudyloadid: serial().primaryKey().notNull(),
        facultysemesterid: integer(),
        degreeprogram: varchar({ length: 200 }).notNull(),
        university: varchar({ length: 150 }).notNull(),
        studyloadunits: numeric({ precision: 5, scale: 2 }).notNull(),
        onfulltimeleavewithpay: boolean().notNull(),
        isfacultyfellowshiprecipient: boolean().notNull(),
        studyloadcredit: numeric({ precision: 5, scale: 2 }).notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.facultysemesterid],
            foreignColumns: [facultysemester.facultysemesterid],
            name: 'facultystudyload_facultysemesterid_fkey',
        }).onDelete('set null'),
    ],
);

export const role = pgTable('role', {
    role: varchar({ length: 50 }).primaryKey().notNull(),
    canaddfaculty: boolean().notNull(),
    canmodifyfaculty: boolean().notNull(),
    canaddaccount: boolean().notNull(),
    canmodifyaccount: boolean().notNull(),
    canviewchangelogs: boolean().notNull(),
});

export const userinfo = pgTable(
    'userinfo',
    {
        userinfoid: serial().primaryKey().notNull(),
        userid: text(),
        role: varchar({ length: 50 }).notNull(),
        latestchangelogid: integer(),
    },
    (table) => [
        foreignKey({
            columns: [table.userid],
            foreignColumns: [appuser.id],
            name: 'userinfo_userid_fkey',
        }).onDelete('cascade'),
        foreignKey({
            columns: [table.role],
            foreignColumns: [role.role],
            name: 'userinfo_role_fkey',
        }),
        foreignKey({
            columns: [table.latestchangelogid],
            foreignColumns: [changelog.logid],
            name: 'userinfo_latestchangelogid_fkey',
        }),
    ],
);

export const changelogRelations = relations(changelog, ({ one }) => ({
    faculty: one(faculty, {
        fields: [changelog.logid],
        references: [faculty.latestchangelogid],
    }),
    appuser: one(appuser, {
        fields: [changelog.userid],
        references: [appuser.id],
    }),
    userinfo: one(userinfo, {
        fields: [changelog.logid],
        references: [userinfo.latestchangelogid],
    }),
}));

export const statusRelations = relations(status, ({ many }) => ({
    facultyMembers: many(faculty),
}));

export const facultyRelations = relations(faculty, ({ many, one }) => ({
    changelog: one(changelog, {
        fields: [faculty.latestchangelogid],
        references: [changelog.logid],
    }),
    status: one(status, {
        fields: [faculty.status],
        references: [status.status],
    }),
    facultycontactnumbers: many(facultycontactnumber),
    facultyeducationalattainments: many(facultyeducationalattainment),
    facultyfieldofinterests: many(facultyfieldofinterest),
    facultyranks: many(facultyrank),
    facultyhomeaddresses: many(facultyhomeaddress),
    facultyemails: many(facultyemail),
    facultysemesters: many(facultysemester),
}));

export const facultycontactnumberRelations = relations(facultycontactnumber, ({ one }) => ({
    faculty: one(faculty, {
        fields: [facultycontactnumber.facultyid],
        references: [faculty.facultyid],
    }),
}));

export const facultyeducationalattainmentRelations = relations(
    facultyeducationalattainment,
    ({ many, one }) => ({
        faculty: one(faculty, {
            fields: [facultyeducationalattainment.facultyid],
            references: [faculty.facultyid],
        }),
        facultysemesters: many(facultysemester),
    }),
);

export const fieldofinterestRelations = relations(fieldofinterest, ({ many }) => ({
    facultyfieldofinterests: many(facultyfieldofinterest),
}));

export const facultyfieldofinterestRelations = relations(facultyfieldofinterest, ({ one }) => ({
    faculty: one(faculty, {
        fields: [facultyfieldofinterest.facultyid],
        references: [faculty.facultyid],
    }),
    fieldofinterest: one(fieldofinterest, {
        fields: [facultyfieldofinterest.fieldofinterestid],
        references: [fieldofinterest.fieldofinterestid],
    }),
}));

export const rankRelations = relations(rank, ({ many }) => ({
    facultyranks: many(facultyrank),
}));

export const facultyrankRelations = relations(facultyrank, ({ many, one }) => ({
    faculty: one(faculty, {
        fields: [facultyrank.facultyid],
        references: [faculty.facultyid],
    }),
    rank: one(rank, {
        fields: [facultyrank.rankid],
        references: [rank.rankid],
    }),
    facultysemesters: many(facultysemester),
}));

export const facultyhomeaddressRelations = relations(facultyhomeaddress, ({ one }) => ({
    faculty: one(faculty, {
        fields: [facultyhomeaddress.facultyid],
        references: [faculty.facultyid],
    }),
}));

export const facultyemailRelations = relations(facultyemail, ({ one }) => ({
    faculty: one(faculty, {
        fields: [facultyemail.facultyid],
        references: [faculty.facultyid],
    }),
}));

export const semesterRelations = relations(semester, ({ many }) => ({
    facultysemesters: many(facultysemester),
}));

export const facultysemesterRelations = relations(facultysemester, ({ many, one }) => ({
    faculty: one(faculty, {
        fields: [facultysemester.facultyid],
        references: [faculty.facultyid],
    }),
    semester: one(semester, {
        fields: [facultysemester.acadsemesterid],
        references: [semester.acadsemesterid],
    }),
    facultyeducationalattainment: one(facultyeducationalattainment, {
        fields: [facultysemester.currenthighesteducationalattainmentid],
        references: [facultyeducationalattainment.facultyeducationalattainmentid],
    }),
    facultyrank: one(facultyrank, {
        fields: [facultysemester.currentrankid],
        references: [facultyrank.facultyrankid],
    }),
    facultyadminpositions: many(facultyadminposition),
    facultycommmemberships: many(facultycommmembership),
    facultyadminworks: many(facultyadminwork),
    facultycourses: many(facultycourse),
    facultymentorings: many(facultymentoring),
    facultyresearches: many(facultyresearch),
    facultyextensions: many(facultyextension),
    facultystudyload: many(facultystudyload),
}));

export const adminpositionRelations = relations(adminposition, ({ many }) => ({
    facultyadminpositions: many(facultyadminposition),
}));

export const officeRelations = relations(office, ({ many }) => ({
    facultyadminpositions: many(facultyadminposition),
}));

export const facultyadminpositionRelations = relations(facultyadminposition, ({ one }) => ({
    facultysemester: one(facultysemester, {
        fields: [facultyadminposition.facultysemesterid],
        references: [facultysemester.facultysemesterid],
    }),
    adminposition: one(adminposition, {
        fields: [facultyadminposition.adminpositionid],
        references: [adminposition.adminpositionid],
    }),
    office: one(office, {
        fields: [facultyadminposition.officeid],
        references: [office.officeid],
    }),
}));

export const facultycommmembershipRelations = relations(facultycommmembership, ({ one }) => ({
    facultysemester: one(facultysemester, {
        fields: [facultycommmembership.facultysemesterid],
        references: [facultysemester.facultysemesterid],
    }),
}));

export const facultyadminworkRelations = relations(facultyadminwork, ({ one }) => ({
    facultysemester: one(facultysemester, {
        fields: [facultyadminwork.facultysemesterid],
        references: [facultysemester.facultysemesterid],
    }),
    office: one(office, {
        fields: [facultyadminwork.officeid],
        references: [office.officeid],
    }),
}));

export const courseRelations = relations(course, ({ many }) => ({
    facultycourses: many(facultycourse),
}));

export const facultycourseRelations = relations(facultycourse, ({ one }) => ({
    facultysemester: one(facultysemester, {
        fields: [facultycourse.facultysemesterid],
        references: [facultysemester.facultysemesterid],
    }),
    course: one(course, {
        fields: [facultycourse.courseid],
        references: [course.courseid],
    }),
}));

export const studentRelations = relations(student, ({ many }) => ({
    facultymentoring: many(facultymentoring),
}));

export const facultymentoringRelations = relations(facultymentoring, ({ one }) => ({
    facultysemester: one(facultysemester, {
        fields: [facultymentoring.facultysemesterid],
        references: [facultysemester.facultysemesterid],
    }),
    student: one(student, {
        fields: [facultymentoring.studentnumber],
        references: [student.studentnumber],
    }),
}));

export const researchRelations = relations(research, ({ many }) => ({
    facultyresearches: many(facultyresearch),
}));

export const facultyresearchRelations = relations(facultyresearch, ({ one }) => ({
    facultysemester: one(facultysemester, {
        fields: [facultyresearch.facultysemesterid],
        references: [facultysemester.facultysemesterid],
    }),
    research: one(research, {
        fields: [facultyresearch.researchid],
        references: [research.researchid],
    }),
}));

export const facultyextensionRelations = relations(facultyextension, ({ one }) => ({
    facultysemester: one(facultysemester, {
        fields: [facultyextension.facultysemesterid],
        references: [facultysemester.facultysemesterid],
    }),
}));

export const facultystudyloadRelations = relations(facultystudyload, ({ one }) => ({
    facultysemester: one(facultysemester, {
        fields: [facultystudyload.facultysemesterid],
        references: [facultysemester.facultysemesterid],
    }),
}));

export const roleRelations = relations(role, ({ one }) => ({
    userinfo: one(userinfo, {
        fields: [role.role],
        references: [userinfo.role],
    }),
}));

export const userinfoRelations = relations(userinfo, ({ one }) => ({
    user: one(appuser, {
        fields: [userinfo.userid],
        references: [appuser.id],
    }),
    role: one(role, {
        fields: [userinfo.role],
        references: [role.role],
    }),
    changelog: one(changelog, {
        fields: [userinfo.latestchangelogid],
        references: [changelog.logid],
    }),
}));

export const accountSearchView = pgMaterializedView('account_search_view').as((qb) => {
    const changelogSq = qb
        .select({
            logid: changelog.logid,
            timestamp: changelog.timestamp,
            maker: appuser.email,
            operation: changelog.operation,
        })
        .from(changelog)
        .leftJoin(appuser, eq(appuser.id, changelog.userid))
        .as('changelog_sq');

    const searchcontentQuery = sql<string>`
            coalesce(${appuser.email}, '')
            || ' ' || coalesce(${userinfo.role}, '')
            || ' ' || coalesce(${changelogSq.timestamp}::text, '')
            || ' ' || coalesce(${changelogSq.maker}, '')
            || ' ' || coalesce(${changelogSq.operation}, '')
        `;

    const view = qb
        .select({
            id: appuser.id,
            searchcontent: searchcontentQuery.as('search_content'),
        })
        .from(appuser)
        .leftJoin(userinfo, eq(userinfo.userid, appuser.id))
        .leftJoin(changelogSq, eq(changelogSq.logid, userinfo.latestchangelogid));

    index('account_search_idx').using('gin', sql`${searchcontentQuery} gin_trgm_ops`);

    return view;
});

export const facultyRecordSearchView = pgMaterializedView('faculty_record_search_view', {
    id: integer(),
    searchcontent: text(),
}).as(sql`
        SELECT
            ${faculty.facultyid} AS id,
            coalesce(${faculty.lastname}, '')
                || ' ' || coalesce(${faculty.middlename}, '')
                || ' ' || coalesce(${faculty.firstname}, '')
                || ' ' || coalesce(${faculty.suffix}, '')
                || ' ' || coalesce(${faculty.birthdate}::text, '')
                || ' ' || coalesce(${status.status}, '') 
                || ' ' || coalesce(${faculty.dateoforiginalappointment}::text, '')
                AS searchcontent
        FROM ${faculty}
            LEFT JOIN ${status} ON ${faculty.status} = ${status.status}
        UNION
        SELECT
            ${facultyeducationalattainment.facultyid} AS id,
            coalesce(${facultyeducationalattainment.degree}, '')
                || ' ' || coalesce(${facultyeducationalattainment.institution}, '')
                || ' ' || coalesce(${facultyeducationalattainment.graduationyear}::text, '')
                AS searchcontent
        FROM ${facultyeducationalattainment}
        UNION
        SELECT
            ${facultyfieldofinterest.facultyid} AS id,
            coalesce(${fieldofinterest.field}, '') AS searchcontent
        FROM ${facultyfieldofinterest}
            LEFT JOIN ${fieldofinterest}
                ON ${facultyfieldofinterest.fieldofinterestid} = ${fieldofinterest.fieldofinterestid}
        UNION
        SELECT
            ${facultyrank.facultyid} AS id,
            coalesce(${rank.ranktitle}, '')
                || ' ' || coalesce(${rank.salarygrade}, '')
                || ' ' || coalesce(${rank.salaryrate}::text, '')
                || ' ' || coalesce(${facultyrank.appointmentstatus}, '')
                || ' ' || coalesce(${facultyrank.dateoftenureorrenewal}::text, '')
                AS searchcontent
        FROM ${facultyrank}
            LEFT JOIN ${rank} ON ${facultyrank.rankid} = ${rank.rankid}
        UNION
        SELECT
            ${facultyemail.facultyid} AS id,
            coalesce(${facultyemail.email}, '') AS searchcontent
        FROM ${facultyemail}
        UNION
        SELECT
            ${facultysemester.facultyid} AS id,
            coalesce(${adminposition.name}, '')
                || ' ' || coalesce(${office.name}, '')
                || ' ' || coalesce(${facultyadminposition.startdate}::text, '')
                || ' ' || coalesce(${facultyadminposition.enddate}::text, '')
                AS searchcontent
        FROM ${facultysemester}
            LEFT JOIN ${facultyadminposition}
                ON ${facultysemester.facultysemesterid} = ${facultyadminposition.facultysemesterid}
            LEFT JOIN ${adminposition} ON ${facultyadminposition.adminpositionid} = ${adminposition.adminpositionid}
            LEFT JOIN ${office} ON ${facultyadminposition.officeid} = ${office.officeid}
        UNION
        SELECT
            ${facultysemester.facultyid} AS id,
            coalesce(${facultycommmembership.membership}, '')
                || ' ' || coalesce(${facultycommmembership.committee}, '')
                || ' ' || coalesce(${facultycommmembership.startdate}::text, '')
                || ' ' || coalesce(${facultycommmembership.enddate}::text, '')
                AS searchcontent
        FROM ${facultysemester}
            LEFT JOIN ${facultycommmembership}
                ON ${facultysemester.facultysemesterid} = ${facultycommmembership.facultysemesterid}
        UNION
        SELECT
            ${facultysemester.facultyid} AS id,
            coalesce(${facultyadminwork.natureofwork}, '')
                || ' ' || coalesce(${office.name}, '')
                || ' ' || coalesce(${facultyadminwork.startdate}::text, '')
                || ' ' || coalesce(${facultyadminwork.enddate}::text, '')
                AS searchcontent
        FROM ${facultysemester}
            LEFT JOIN ${facultyadminwork}
                ON ${facultysemester.facultysemesterid} = ${facultyadminwork.facultysemesterid}
            LEFT JOIN ${office} ON ${facultyadminwork.officeid} = ${office.officeid}
        UNION
        SELECT
            ${facultysemester.facultyid} AS id,
            coalesce(${course.coursename}, '')
                || ' ' || coalesce(${facultycourse.section}, '')
                || ' ' || coalesce(${facultycourse.numberofstudents}::text, '')
                AS searchcontent
        FROM ${facultysemester}
            LEFT JOIN ${facultycourse}
                ON ${facultysemester.facultysemesterid} = ${facultycourse.facultysemesterid}
            LEFT JOIN ${course} ON ${facultycourse.courseid} = ${course.courseid}
        UNION
        SELECT
            ${facultysemester.facultyid} AS id,
            coalesce(${student.studentnumber}::text, '')
                || ' ' || coalesce(${student.lastname}, '')
                || ' ' || coalesce(${student.middlename}, '')
                || ' ' || coalesce(${student.firstname}, '')
                || ' ' || coalesce(${facultymentoring.category}, '')
                || ' ' || coalesce(${facultymentoring.startdate}::text, '')
                || ' ' || coalesce(${facultymentoring.enddate}::text, '')
                AS searchcontent
        FROM ${facultysemester}
            LEFT JOIN ${facultymentoring}
                ON ${facultysemester.facultysemesterid} = ${facultymentoring.facultysemesterid}
            LEFT JOIN ${student} ON ${facultymentoring.studentnumber} = ${student.studentnumber}
        UNION
        SELECT
            ${facultysemester.facultyid} AS id,
            coalesce(${research.title}, '')
                || ' ' || coalesce(${research.startdate}::text, '')
                || ' ' || coalesce(${research.enddate}::text, '')
                || ' ' || coalesce(${research.funding}, '')
                AS searchcontent
        FROM ${facultysemester}
            LEFT JOIN ${facultyresearch}
                ON ${facultysemester.facultysemesterid} = ${facultyresearch.facultysemesterid}
            LEFT JOIN ${research} ON ${facultyresearch.researchid} = ${research.researchid}
        UNION
        SELECT
            ${facultysemester.facultyid} AS id,
            coalesce(${facultyextension.natureofextension}, '')
                || ' ' || coalesce(${facultyextension.agency}, '')
                || ' ' || coalesce(${facultyextension.startdate}::text, '')
                || ' ' || coalesce(${facultyextension.enddate}::text, '')
                AS searchcontent
        FROM ${facultysemester}
            LEFT JOIN ${facultyextension}
                ON ${facultysemester.facultysemesterid} = ${facultyextension.facultysemesterid}
        UNION
        SELECT
            ${facultysemester.facultyid} AS id,
            coalesce(${facultystudyload.degreeprogram}, '')
                || ' ' || coalesce(${facultystudyload.university}, '')
                AS searchcontent
        FROM ${facultysemester}
            LEFT JOIN ${facultystudyload}
                ON ${facultysemester.facultysemesterid} = ${facultystudyload.facultysemesterid}
    `);

index('faculty_record_search_idx').using(
    'gin',
    sql`${facultyRecordSearchView.searchcontent} gin_trgm_ops`,
);
