import {
    boolean,
    date,
    foreignKey,
    integer,
    numeric,
    pgTable,
    serial,
    smallint,
    text,
    timestamp,
    unique,
    varchar,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

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
            name: 'changelog_accountid_fkey',
        }).onDelete('set null'),
    ],
);

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

export const rank = pgTable('Rank', {
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
        }).onDelete('set null'),
        foreignKey({
            columns: [table.rankid],
            foreignColumns: [rank.rankid],
            name: 'facultyrank_rankid_fkey',
        }),
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

export const course = pgTable('course', {
    courseid: serial().primaryKey().notNull(),
    coursename: varchar({ length: 100 }).notNull(),
    units: integer().notNull(),
});

export const research = pgTable('research', {
    researchid: serial().primaryKey().notNull(),
    title: varchar({ length: 200 }).notNull(),
});

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

export const facultyteaching = pgTable(
    'facultyteaching',
    {
        facultyteachingid: serial().primaryKey().notNull(),
        facultyid: integer(),
        acadsemesterid: integer(),
        courseid: integer(),
        section: varchar({ length: 50 }),
        numberofstudents: integer(),
        teachingloadcredit: numeric({ precision: 5, scale: 2 }).notNull(),
        sectionset: numeric({ precision: 4, scale: 3 }),
    },
    (table) => [
        foreignKey({
            columns: [table.facultyid],
            foreignColumns: [faculty.facultyid],
            name: 'facultyteaching_facultyid_fkey',
        }).onDelete('set null'),
        foreignKey({
            columns: [table.acadsemesterid],
            foreignColumns: [semester.acadsemesterid],
            name: 'facultyteaching_acadsemesterid_fkey',
        }),
        foreignKey({
            columns: [table.courseid],
            foreignColumns: [course.courseid],
            name: 'facultyteaching_courseid_fkey',
        }),
    ],
);

export const facultyresearch = pgTable(
    'facultyresearch',
    {
        facultyresearchid: serial().primaryKey().notNull(),
        facultyid: integer(),
        acadsemesterid: integer(),
        researchid: integer(),
        startdate: date().notNull(),
        enddate: date(),
        funding: numeric({ precision: 10, scale: 2 }).notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.facultyid],
            foreignColumns: [faculty.facultyid],
            name: 'facultyresearch_facultyid_fkey',
        }).onDelete('cascade'),
        foreignKey({
            columns: [table.acadsemesterid],
            foreignColumns: [semester.acadsemesterid],
            name: 'facultyresearch_acadsemesterid_fkey',
        }),
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
        extensionid: serial().primaryKey().notNull(),
        facultyid: integer(),
        extensiontype: varchar({ length: 50 }),
        extensiondata: text(),
    },
    (table) => [
        foreignKey({
            columns: [table.facultyid],
            foreignColumns: [faculty.facultyid],
            name: 'facultyextension_facultyid_fkey',
        }),
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
            name: 'userrole_userid_fkey',
        }).onDelete('cascade'),
        foreignKey({
            columns: [table.role],
            foreignColumns: [role.role],
            name: 'userrole_role_fkey',
        }),
        foreignKey({
            columns: [table.latestchangelogid],
            foreignColumns: [changelog.logid],
            name: 'userchangelog_latestchangelogid_fkey',
        }),
    ],
);

export const facultycontactnumberRelations = relations(facultycontactnumber, ({ one }) => ({
    faculty: one(faculty, {
        fields: [facultycontactnumber.facultyid],
        references: [faculty.facultyid],
    }),
}));

export const facultyRelations = relations(faculty, ({ many, one }) => ({
    facultycontactnumbers: many(facultycontactnumber),
    facultyeducationalattainments: many(facultyeducationalattainment),
    facultyfieldofinterests: many(facultyfieldofinterest),
    facultyranks: many(facultyrank),
    facultyemails: many(facultyemail),
    facultyhomeaddresses: many(facultyhomeaddress),
    facultysemesters: many(facultysemester),
    facultyteachings: many(facultyteaching),
    facultyresearches: many(facultyresearch),
    facultyextensions: many(facultyextension),
    changelog: one(changelog, {
        fields: [faculty.latestchangelogid],
        references: [changelog.logid],
    }),
}));

export const facultyeducationalattainmentRelations = relations(
    facultyeducationalattainment,
    ({ one }) => ({
        faculty: one(faculty, {
            fields: [facultyeducationalattainment.facultyid],
            references: [faculty.facultyid],
        }),
        facultysemester: one(facultysemester, {
            fields: [facultyeducationalattainment.facultyeducationalattainmentid],
            references: [facultysemester.currenthighesteducationalattainmentid],
        }),
    }),
);

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

export const fieldofinterestRelations = relations(fieldofinterest, ({ many }) => ({
    facultyfieldofinterests: many(facultyfieldofinterest),
}));

export const facultyrankRelations = relations(facultyrank, ({ one }) => ({
    faculty: one(faculty, {
        fields: [facultyrank.facultyid],
        references: [faculty.facultyid],
    }),
    rank: one(rank, {
        fields: [facultyrank.rankid],
        references: [rank.rankid],
    }),
    facultysemester: one(facultysemester, {
        fields: [facultyrank.facultyrankid],
        references: [facultysemester.currentrankid],
    }),
}));

export const facultyemailRelations = relations(facultyemail, ({ one }) => ({
    faculty: one(faculty, {
        fields: [facultyemail.facultyid],
        references: [faculty.facultyid],
    }),
}));

export const rankRelations = relations(rank, ({ many }) => ({
    facultyranks: many(facultyrank),
}));

export const facultyhomeaddressRelations = relations(facultyhomeaddress, ({ one }) => ({
    faculty: one(faculty, {
        fields: [facultyhomeaddress.facultyid],
        references: [faculty.facultyid],
    }),
}));

export const facultyadminpositionRelations = relations(facultyadminposition, ({ one }) => ({
    facultysemesters: one(facultysemester, {
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

export const semesterRelations = relations(semester, ({ many }) => ({
    facultysemesters: many(facultysemester),
    facultyteachings: many(facultyteaching),
    facultyresearches: many(facultyresearch),
}));

export const facultysemesterRelations = relations(facultysemester, ({ one }) => ({
    faculty: one(faculty, {
        fields: [facultysemester.facultyid],
        references: [faculty.facultyid],
    }),
    semester: one(semester, {
        fields: [facultysemester.acadsemesterid],
        references: [semester.acadsemesterid],
    }),
    facultyrank: one(facultyrank, {
        fields: [facultysemester.currentrankid],
        references: [facultyrank.facultyrankid],
    }),
    facultyeducationalattainment: one(facultyeducationalattainment, {
        fields: [facultysemester.currenthighesteducationalattainmentid],
        references: [facultyeducationalattainment.facultyeducationalattainmentid],
    }),
}));

export const adminpositionRelations = relations(adminposition, ({ many }) => ({
    facultyadminpositions: many(facultyadminposition),
}));

export const facultyteachingRelations = relations(facultyteaching, ({ one }) => ({
    faculty: one(faculty, {
        fields: [facultyteaching.facultyid],
        references: [faculty.facultyid],
    }),
    semester: one(semester, {
        fields: [facultyteaching.acadsemesterid],
        references: [semester.acadsemesterid],
    }),
    course: one(course, {
        fields: [facultyteaching.courseid],
        references: [course.courseid],
    }),
}));

export const courseRelations = relations(course, ({ many }) => ({
    facultyteachings: many(facultyteaching),
}));

export const facultyresearchRelations = relations(facultyresearch, ({ one }) => ({
    faculty: one(faculty, {
        fields: [facultyresearch.facultyid],
        references: [faculty.facultyid],
    }),
    semester: one(semester, {
        fields: [facultyresearch.acadsemesterid],
        references: [semester.acadsemesterid],
    }),
    research: one(research, {
        fields: [facultyresearch.researchid],
        references: [research.researchid],
    }),
}));

export const researchRelations = relations(research, ({ many }) => ({
    facultyresearches: many(facultyresearch),
}));

export const facultyextensionRelations = relations(facultyextension, ({ one }) => ({
    faculty: one(faculty, {
        fields: [facultyextension.facultyid],
        references: [faculty.facultyid],
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

export const roleRelations = relations(role, ({ one }) => ({
    userinfo: one(userinfo, {
        fields: [role.role],
        references: [userinfo.role],
    }),
}));

export const changelogRelations = relations(changelog, ({ one }) => ({
    faculty: one(faculty, {
        fields: [changelog.logid],
        references: [faculty.latestchangelogid],
    }),
    user: one(appuser, {
        fields: [changelog.userid],
        references: [appuser.id],
    }),
    userinfo: one(userinfo, {
        fields: [changelog.logid],
        references: [userinfo.latestchangelogid],
    }),
}));
