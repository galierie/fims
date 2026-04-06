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
        id: serial().primaryKey().notNull(),
        timestamp: timestamp().defaultNow().notNull(),
        operatorId: text(),
        tupleId: integer(),
        operation: text().notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.operatorId],
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
        id: serial().primaryKey().notNull(),
        lastName: varchar({ length: 100 }).notNull(),
        middleName: varchar({ length: 100 }).notNull(),
        firstName: varchar({ length: 100 }).notNull(),
        suffix: varchar({ length: 50 }),
        maidenName: varchar({ length: 100 }),
        birthDate: date().notNull(),
        status: varchar({ length: 50 }),
        dateOfOriginalAppointment: date().notNull(),
        psiItem: varchar({ length: 50 }).notNull(),
        employeeNumber: varchar({ length: 50 }).notNull(),
        tin: varchar({ length: 50 }).notNull(),
        gsis: varchar({ length: 50 }).notNull(),
        philhealth: varchar({ length: 50 }).notNull(),
        pagibig: varchar({ length: 50 }).notNull(),
        remarks: text(),
        latestChangelogId: integer(),
    },
    (table) => [
        foreignKey({
            columns: [table.latestChangelogId],
            foreignColumns: [changelog.id],
            name: 'faculty_latestchangelogid_fkey',
        }),
        foreignKey({
            columns: [table.status],
            foreignColumns: [status.status],
            name: 'faculty_status_fkey',
        }).onDelete('set null'),
    ],
);

export const facultyContactNumber = pgTable(
    'facultyContactNumber',
    {
        id: serial().primaryKey().notNull(),
        facultyId: integer(),
        contactNumber: varchar({ length: 20 }).notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.facultyId],
            foreignColumns: [faculty.id],
            name: 'facultyContactNumber_facultyId_fkey',
        }).onDelete('cascade'),
    ],
);

export const facultyEducationalAttainment = pgTable(
    'facultyEducationalAttainment',
    {
        id: serial().primaryKey().notNull(),
        facultyId: integer(),
        degree: varchar({ length: 100 }).notNull(),
        institution: varchar({ length: 200 }).notNull(),
        graduationYear: integer(),
    },
    (table) => [
        foreignKey({
            columns: [table.facultyId],
            foreignColumns: [faculty.id],
            name: 'facultyEducationalAttainment_facultyId_fkey',
        }).onDelete('cascade'),
    ],
);

export const fieldOfInterest = pgTable(
    'fieldofinterest',
    {
        id: serial().primaryKey().notNull(),
        field: varchar({ length: 100 }).notNull(),
    },
    (table) => [unique('fieldofinterest_field_key').on(table.field)],
);

export const facultyFieldOfInterest = pgTable(
    'facultyFieldOfInterest',
    {
        id: serial().primaryKey().notNull(),
        facultyId: integer(),
        fieldOfInterestId: integer(),
    },
    (table) => [
        foreignKey({
            columns: [table.facultyId],
            foreignColumns: [faculty.id],
            name: 'facultyFieldOfInterest_facultyId_fkey',
        }).onDelete('cascade'),
        foreignKey({
            columns: [table.fieldOfInterestId],
            foreignColumns: [fieldOfInterest.id],
            name: 'facultyFieldOfInterest_fieldofinterestid_fkey',
        }).onDelete('cascade'),
    ],
);

export const rank = pgTable('rank', {
    id: serial().primaryKey().notNull(),
    title: varchar({ length: 100 }).notNull(),
    salaryGrade: varchar({ length: 10 }).notNull(),
    salaryRate: numeric({ precision: 10, scale: 2 }).notNull(),
});

export const appointmentStatus = pgTable('appointmentstatus', {
    appointmentStatus: varchar({ length: 50 }).primaryKey().notNull(),
});

export const facultyRank = pgTable(
    'facultyRank',
    {
        id: serial().primaryKey().notNull(),
        facultyId: integer(),
        rankId: integer(),
        appointmentStatus: varchar({ length: 50 }).notNull(),
        dateOfTenureOrRenewal: date().notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.facultyId],
            foreignColumns: [faculty.id],
            name: 'facultyRank_facultyId_fkey',
        }).onDelete('cascade'),
        foreignKey({
            columns: [table.rankId],
            foreignColumns: [rank.id],
            name: 'facultyRank_rankid_fkey',
        }),
        foreignKey({
            columns: [table.appointmentStatus],
            foreignColumns: [appointmentStatus.appointmentStatus],
            name: 'facultyRank_appointmentstatus_fkey',
        }),
    ],
);

export const facultyHomeAddress = pgTable(
    'facultyHomeAddress',
    {
        id: serial().primaryKey().notNull(),
        facultyId: integer(),
        homeAddress: text().notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.facultyId],
            foreignColumns: [faculty.id],
            name: 'facultyHomeAddress_facultyId_fkey',
        }).onDelete('cascade'),
    ],
);

export const facultyEmail = pgTable(
    'facultyEmail',
    {
        id: serial().primaryKey().notNull(),
        facultyId: integer(),
        email: varchar({ length: 100 }).notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.facultyId],
            foreignColumns: [faculty.id],
            name: 'facultyEmail_facultyId_fkey',
        }).onDelete('cascade'),
    ],
);

export const academicSemester = pgTable('semester', {
    id: serial().primaryKey().notNull(),
    semesterNumber: smallint().notNull(),
    academicYear: integer().notNull(),
});

export const facultyAcademicSemester = pgTable(
    'facultyAcademicSemester',
    {
        id: serial().primaryKey().notNull(),
        facultyId: integer(),
        academicSemesterId: integer(),
        currentRankId: integer(),
        currentHighestEducationalAttainmentId: integer(),
        remarks: text(),
    },
    (table) => [
        foreignKey({
            columns: [table.facultyId],
            foreignColumns: [faculty.id],
            name: 'facultyAcademicSemester_facultyId_fkey',
        }).onDelete('cascade'),
        foreignKey({
            columns: [table.academicSemesterId],
            foreignColumns: [academicSemester.id],
            name: 'facultyAcademicSemester_acadsemesterid_fkey',
        }),
        foreignKey({
            columns: [table.currentRankId],
            foreignColumns: [facultyRank.id],
            name: 'facultyAcademicSemester_currentrankid_fkey',
        }),
        foreignKey({
            columns: [table.currentHighestEducationalAttainmentId],
            foreignColumns: [facultyEducationalAttainment.id],
            name: 'facultyAcademicSemester_currenthighestEducationalAttainmentid_fkey',
        }),
    ],
);

export const adminPosition = pgTable('adminposition', {
    id: serial().primaryKey().notNull(),
    title: varchar({ length: 100 }).notNull(),
});

export const office = pgTable('office', {
    id: serial().primaryKey().notNull(),
    name: varchar({ length: 100 }).notNull(),
});

export const facultyAdminPosition = pgTable(
    'facultyAdminPosition',
    {
        id: serial().primaryKey().notNull(),
        facultyAcademicSemesterId: integer(),
        adminPositionId: integer(),
        officeId: integer(),
        startDate: date().notNull(),
        endDate: date().notNull(),
        administrativeLoadCredit: numeric({ precision: 5, scale: 2 }).notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.facultyAcademicSemesterId],
            foreignColumns: [facultyAcademicSemester.id],
            name: 'facultyAdminPosition_facultyAcademicSemesterid_fkey',
        }).onDelete('set null'),
        foreignKey({
            columns: [table.adminPositionId],
            foreignColumns: [adminPosition.id],
            name: 'facultyAdminPosition_adminpositionid_fkey',
        }),
        foreignKey({
            columns: [table.officeId],
            foreignColumns: [office.id],
            name: 'facultyAdminPosition_officeid_fkey',
        }),
    ],
);

export const facultyCommMembership = pgTable(
    'facultyCommMembership',
    {
        id: serial().primaryKey().notNull(),
        facultyAcademicSemesterId: integer(),
        membership: varchar({ length: 100 }).notNull(),
        committee: varchar({ length: 150 }).notNull(),
        startDate: date().notNull(),
        endDate: date().notNull(),
        administrativeLoadCredit: numeric({ precision: 5, scale: 2 }).notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.facultyAcademicSemesterId],
            foreignColumns: [facultyAcademicSemester.id],
            name: 'facultyCommMembership_facultyAcademicSemesterid_fkey',
        }).onDelete('set null'),
    ],
);

export const facultyAdminWork = pgTable(
    'facultyAdminWork',
    {
        id: serial().primaryKey().notNull(),
        facultyAcademicSemesterId: integer(),
        natureOfWork: varchar({ length: 200 }).notNull(),
        officeId: integer(),
        startDate: date().notNull(),
        endDate: date().notNull(),
        administrativeLoadCredit: numeric({ precision: 5, scale: 2 }).notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.facultyAcademicSemesterId],
            foreignColumns: [facultyAcademicSemester.id],
            name: 'facultyAdminWork_facultyAcademicSemesterid_fkey',
        }).onDelete('set null'),
        foreignKey({
            columns: [table.officeId],
            foreignColumns: [office.id],
            name: 'facultyAdminWork_officeid_fkey',
        }),
    ],
);

export const course = pgTable('course', {
    id: serial().primaryKey().notNull(),
    name: varchar({ length: 100 }).notNull(),
    units: integer().notNull(),
});

export const facultyCourse = pgTable(
    'facultyCourse',
    {
        id: serial().primaryKey().notNull(),
        facultyAcademicSemesterId: integer(),
        courseId: integer(),
        section: varchar({ length: 50 }),
        numberOfStudents: integer(),
        teachingLoadCredit: numeric({ precision: 5, scale: 2 }).notNull(),
        sectionSET: numeric({ precision: 4, scale: 3 }),
    },
    (table) => [
        foreignKey({
            columns: [table.facultyAcademicSemesterId],
            foreignColumns: [facultyAcademicSemester.id],
            name: 'facultyCourse_facultyAcademicSemesterid_fkey',
        }).onDelete('set null'),
        foreignKey({
            columns: [table.courseId],
            foreignColumns: [course.id],
            name: 'facultyCourse_courseid_fkey',
        }),
    ],
);

export const student = pgTable('student', {
    id: serial().primaryKey().notNull(),
    lastName: varchar({ length: 100 }).notNull(),
    middleName: varchar({ length: 100 }).notNull(),
    firstName: varchar({ length: 100 }).notNull(),
});

export const facultyMentoring = pgTable(
    'facultyMentoring',
    {
        id: serial().primaryKey().notNull(),
        facultyAcademicSemesterId: integer(),
        studentId: integer(),
        category: varchar({ length: 50 }),
        startDate: date().notNull(),
        endDate: date().notNull(),
        teachingLoadCredit: numeric({ precision: 5, scale: 2 }).notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.facultyAcademicSemesterId],
            foreignColumns: [facultyAcademicSemester.id],
            name: 'facultyMentoring_facultyAcademicSemesterid_fkey',
        }).onDelete('set null'),
        foreignKey({
            columns: [table.studentId],
            foreignColumns: [student.id],
            name: 'facultyMentoring_studentnumber_fkey',
        }),
    ],
);

export const research = pgTable('research', {
    id: serial().primaryKey().notNull(),
    title: varchar({ length: 200 }).notNull(),
    startDate: date().notNull(),
    endDate: date().notNull(),
    funding: text(),
});

export const facultyResearch = pgTable(
    'facultyResearch',
    {
        id: serial().primaryKey().notNull(),
        facultyAcademicSemesterId: integer(),
        researchId: integer(),
        researchLoadCredit: numeric({ precision: 5, scale: 2 }).notNull(),
        remarks: text(),
    },
    (table) => [
        foreignKey({
            columns: [table.facultyAcademicSemesterId],
            foreignColumns: [facultyAcademicSemester.id],
            name: 'facultyResearch_facultyAcademicSemesterid_fkey',
        }).onDelete('set null'),
        foreignKey({
            columns: [table.researchId],
            foreignColumns: [research.id],
            name: 'facultyResearch_researchid_fkey',
        }),
    ],
);

export const facultyExtension = pgTable(
    'facultyExtension',
    {
        id: serial().primaryKey().notNull(),
        facultyAcademicSemesterId: integer(),
        natureOfExtension: varchar({ length: 200 }).notNull(),
        agency: varchar({ length: 150 }).notNull(),
        startDate: date().notNull(),
        endDate: date().notNull(),
        extensionLoadCredit: numeric({ precision: 5, scale: 2 }).notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.facultyAcademicSemesterId],
            foreignColumns: [facultyAcademicSemester.id],
            name: 'facultyExtension_facultyAcademicSemesterid_fkey',
        }).onDelete('set null'),
    ],
);

export const facultyStudyLoad = pgTable(
    'facultyStudyLoad',
    {
        id: serial().primaryKey().notNull(),
        facultyAcademicSemesterId: integer(),
        degreeProgram: varchar({ length: 200 }).notNull(),
        university: varchar({ length: 150 }).notNull(),
        studyLoadUnits: numeric({ precision: 5, scale: 2 }).notNull(),
        onFullTimeLeaveWithPay: boolean().notNull(),
        isFacultyFellowshipRecipient: boolean().notNull(),
        studyLoadCredit: numeric({ precision: 5, scale: 2 }).notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.facultyAcademicSemesterId],
            foreignColumns: [facultyAcademicSemester.id],
            name: 'facultyStudyLoad_facultyAcademicSemesterid_fkey',
        }).onDelete('set null'),
    ],
);

export const role = pgTable('role', {
    role: varchar({ length: 50 }).primaryKey().notNull(),
    canAddFaculty: boolean().notNull(),
    canModifyFaculty: boolean().notNull(),
    canAddAccount: boolean().notNull(),
    canModifyAccount: boolean().notNull(),
    canViewChangelogs: boolean().notNull(),
});

export const profileInfo = pgTable(
    'userinfo',
    {
        id: serial().primaryKey().notNull(),
        profileId: text(),
        role: varchar({ length: 50 }).notNull(),
        latestChangelogId: integer(),
    },
    (table) => [
        foreignKey({
            columns: [table.profileId],
            foreignColumns: [appuser.id],
            name: 'userinfo_userid_fkey',
        }).onDelete('cascade'),
        foreignKey({
            columns: [table.role],
            foreignColumns: [role.role],
            name: 'userinfo_role_fkey',
        }),
        foreignKey({
            columns: [table.latestChangelogId],
            foreignColumns: [changelog.id],
            name: 'userinfo_latestchangelogid_fkey',
        }),
    ],
);

export const changelogRelations = relations(changelog, ({ one }) => ({
    faculty: one(faculty, {
        fields: [changelog.id],
        references: [faculty.latestChangelogId],
    }),
    appuser: one(appuser, {
        fields: [changelog.operatorId],
        references: [appuser.id],
    }),
    profileInfo: one(profileInfo, {
        fields: [changelog.id],
        references: [profileInfo.latestChangelogId],
    }),
}));

export const statusRelations = relations(status, ({ many }) => ({
    facultyMembers: many(faculty),
}));

export const facultyRelations = relations(faculty, ({ many, one }) => ({
    changelog: one(changelog, {
        fields: [faculty.latestChangelogId],
        references: [changelog.id],
    }),
    status: one(status, {
        fields: [faculty.status],
        references: [status.status],
    }),
    facultyContactNumbers: many(facultyContactNumber),
    facultyEducationalAttainments: many(facultyEducationalAttainment),
    facultyFieldOfInterests: many(facultyFieldOfInterest),
    facultyRanks: many(facultyRank),
    facultyHomeAddresses: many(facultyHomeAddress),
    facultyEmails: many(facultyEmail),
    facultyAcademicSemesters: many(facultyAcademicSemester),
}));

export const facultyContactNumberRelations = relations(facultyContactNumber, ({ one }) => ({
    faculty: one(faculty, {
        fields: [facultyContactNumber.facultyId],
        references: [faculty.id],
    }),
}));

export const facultyEducationalAttainmentRelations = relations(
    facultyEducationalAttainment,
    ({ many, one }) => ({
        faculty: one(faculty, {
            fields: [facultyEducationalAttainment.facultyId],
            references: [faculty.id],
        }),
        facultyAcademicSemesters: many(facultyAcademicSemester),
    }),
);

export const fieldOfInterestRelations = relations(fieldOfInterest, ({ many }) => ({
    facultyFieldOfInterests: many(facultyFieldOfInterest),
}));

export const facultyFieldOfInterestRelations = relations(facultyFieldOfInterest, ({ one }) => ({
    faculty: one(faculty, {
        fields: [facultyFieldOfInterest.facultyId],
        references: [faculty.id],
    }),
    fieldOfInterest: one(fieldOfInterest, {
        fields: [facultyFieldOfInterest.fieldOfInterestId],
        references: [fieldOfInterest.id],
    }),
}));

export const rankRelations = relations(rank, ({ many }) => ({
    facultyRanks: many(facultyRank),
}));

export const appointmentStatusRelations = relations(appointmentStatus, ({ many }) => ({
    facultyRanks: many(facultyRank),
}));

export const facultyRankRelations = relations(facultyRank, ({ many, one }) => ({
    faculty: one(faculty, {
        fields: [facultyRank.facultyId],
        references: [faculty.id],
    }),
    rank: one(rank, {
        fields: [facultyRank.rankId],
        references: [rank.id],
    }),
    appointmentStatus: one(appointmentStatus, {
        fields: [facultyRank.appointmentStatus],
        references: [appointmentStatus.appointmentStatus],
    }),
    facultyAcademicSemesters: many(facultyAcademicSemester),
}));

export const facultyHomeAddressRelations = relations(facultyHomeAddress, ({ one }) => ({
    faculty: one(faculty, {
        fields: [facultyHomeAddress.facultyId],
        references: [faculty.id],
    }),
}));

export const facultyEmailRelations = relations(facultyEmail, ({ one }) => ({
    faculty: one(faculty, {
        fields: [facultyEmail.facultyId],
        references: [faculty.id],
    }),
}));

export const academicSemesterRelations = relations(academicSemester, ({ many }) => ({
    facultyAcademicSemesters: many(facultyAcademicSemester),
}));

export const facultyAcademicSemesterRelations = relations(facultyAcademicSemester, ({ many, one }) => ({
    faculty: one(faculty, {
        fields: [facultyAcademicSemester.facultyId],
        references: [faculty.id],
    }),
    academicSemester: one(academicSemester, {
        fields: [facultyAcademicSemester.academicSemesterId],
        references: [academicSemester.id],
    }),
    facultyEducationalAttainment: one(facultyEducationalAttainment, {
        fields: [facultyAcademicSemester.currentHighestEducationalAttainmentId],
        references: [facultyEducationalAttainment.id],
    }),
    facultyRank: one(facultyRank, {
        fields: [facultyAcademicSemester.currentRankId],
        references: [facultyRank.id],
    }),
    facultyAdminPositions: many(facultyAdminPosition),
    facultyCommMemberships: many(facultyCommMembership),
    facultyAdminWorks: many(facultyAdminWork),
    facultyCourses: many(facultyCourse),
    facultyMentorings: many(facultyMentoring),
    facultyResearches: many(facultyResearch),
    facultyExtensions: many(facultyExtension),
    facultyStudyLoad: many(facultyStudyLoad),
}));

export const adminPositionRelations = relations(adminPosition, ({ many }) => ({
    facultyAdminPositions: many(facultyAdminPosition),
}));

export const officeRelations = relations(office, ({ many }) => ({
    facultyAdminPositions: many(facultyAdminPosition),
}));

export const facultyAdminPositionRelations = relations(facultyAdminPosition, ({ one }) => ({
    facultyAcademicSemester: one(facultyAcademicSemester, {
        fields: [facultyAdminPosition.facultyAcademicSemesterId],
        references: [facultyAcademicSemester.id],
    }),
    adminPosition: one(adminPosition, {
        fields: [facultyAdminPosition.adminPositionId],
        references: [adminPosition.id],
    }),
    office: one(office, {
        fields: [facultyAdminPosition.officeId],
        references: [office.id],
    }),
}));

export const facultyCommMembershipRelations = relations(facultyCommMembership, ({ one }) => ({
    facultyAcademicSemester: one(facultyAcademicSemester, {
        fields: [facultyCommMembership.facultyAcademicSemesterId],
        references: [facultyAcademicSemester.id],
    }),
}));

export const facultyAdminWorkRelations = relations(facultyAdminWork, ({ one }) => ({
    facultyAcademicSemester: one(facultyAcademicSemester, {
        fields: [facultyAdminWork.facultyAcademicSemesterId],
        references: [facultyAcademicSemester.id],
    }),
    office: one(office, {
        fields: [facultyAdminWork.officeId],
        references: [office.id],
    }),
}));

export const courseRelations = relations(course, ({ many }) => ({
    facultyCourses: many(facultyCourse),
}));

export const facultyCourseRelations = relations(facultyCourse, ({ one }) => ({
    facultyAcademicSemester: one(facultyAcademicSemester, {
        fields: [facultyCourse.facultyAcademicSemesterId],
        references: [facultyAcademicSemester.id],
    }),
    course: one(course, {
        fields: [facultyCourse.courseId],
        references: [course.id],
    }),
}));

export const studentRelations = relations(student, ({ many }) => ({
    facultyMentoring: many(facultyMentoring),
}));

export const facultyMentoringRelations = relations(facultyMentoring, ({ one }) => ({
    facultyAcademicSemester: one(facultyAcademicSemester, {
        fields: [facultyMentoring.facultyAcademicSemesterId],
        references: [facultyAcademicSemester.id],
    }),
    student: one(student, {
        fields: [facultyMentoring.studentId],
        references: [student.id],
    }),
}));

export const researchRelations = relations(research, ({ many }) => ({
    facultyResearches: many(facultyResearch),
}));

export const facultyResearchRelations = relations(facultyResearch, ({ one }) => ({
    facultyAcademicSemester: one(facultyAcademicSemester, {
        fields: [facultyResearch.facultyAcademicSemesterId],
        references: [facultyAcademicSemester.id],
    }),
    research: one(research, {
        fields: [facultyResearch.researchId],
        references: [research.id],
    }),
}));

export const facultyExtensionRelations = relations(facultyExtension, ({ one }) => ({
    facultyAcademicSemester: one(facultyAcademicSemester, {
        fields: [facultyExtension.facultyAcademicSemesterId],
        references: [facultyAcademicSemester.id],
    }),
}));

export const facultyStudyLoadRelations = relations(facultyStudyLoad, ({ one }) => ({
    facultyAcademicSemester: one(facultyAcademicSemester, {
        fields: [facultyStudyLoad.facultyAcademicSemesterId],
        references: [facultyAcademicSemester.id],
    }),
}));

export const roleRelations = relations(role, ({ one }) => ({
    profileInfo: one(profileInfo, {
        fields: [role.role],
        references: [profileInfo.role],
    }),
}));

export const profileInfoRelations = relations(profileInfo, ({ one }) => ({
    user: one(appuser, {
        fields: [profileInfo.profileId],
        references: [appuser.id],
    }),
    role: one(role, {
        fields: [profileInfo.role],
        references: [role.role],
    }),
    changelog: one(changelog, {
        fields: [profileInfo.latestChangelogId],
        references: [changelog.id],
    }),
}));

export const accountSearchView = pgMaterializedView('account_search_view').as((qb) => {
    const changelogSq = qb
        .select({
            id: changelog.id,
            timestamp: changelog.timestamp,
            operator: appuser.email,
            operation: changelog.operation,
        })
        .from(changelog)
        .leftJoin(appuser, eq(appuser.id, changelog.id))
        .as('changelog_sq');

    const searchcontentQuery = sql<string>`
            coalesce(${appuser.email}, '')
            || ' ' || coalesce(${profileInfo.role}, '')
            || ' ' || coalesce(${changelogSq.timestamp}::text, '')
            || ' ' || coalesce(${changelogSq.operator}, '')
            || ' ' || coalesce(${changelogSq.operation}, '')
        `;

    const view = qb
        .select({
            id: appuser.id,
            searchcontent: searchcontentQuery.as('search_content'),
        })
        .from(appuser)
        .leftJoin(profileInfo, eq(profileInfo.profileId, appuser.id))
        .leftJoin(changelogSq, eq(changelogSq.id, profileInfo.latestChangelogId));

    index('account_search_idx').using('gin', sql`${searchcontentQuery} gin_trgm_ops`);

    return view;
});

export const facultyRecordSearchView = pgMaterializedView('faculty_record_search_view', {
    id: integer(),
    searchcontent: text(),
}).as(sql`
        SELECT
            ${faculty.id} AS id,
            coalesce(${faculty.lastName}, '')
                || ' ' || coalesce(${faculty.middleName}, '')
                || ' ' || coalesce(${faculty.firstName}, '')
                || ' ' || coalesce(${faculty.suffix}, '')
                || ' ' || coalesce(${faculty.birthDate}::text, '')
                || ' ' || coalesce(${status.status}, '') 
                || ' ' || coalesce(${faculty.dateOfOriginalAppointment}::text, '')
                AS searchcontent
        FROM ${faculty}
            LEFT JOIN ${status} ON ${faculty.status} = ${status.status}
        UNION
        SELECT
            ${facultyEducationalAttainment.facultyId} AS id,
            coalesce(${facultyEducationalAttainment.degree}, '')
                || ' ' || coalesce(${facultyEducationalAttainment.institution}, '')
                || ' ' || coalesce(${facultyEducationalAttainment.graduationYear}::text, '')
                AS searchcontent
        FROM ${facultyEducationalAttainment}
        UNION
        SELECT
            ${facultyFieldOfInterest.facultyId} AS id,
            coalesce(${fieldOfInterest.field}, '') AS searchcontent
        FROM ${facultyFieldOfInterest}
            LEFT JOIN ${fieldOfInterest}
                ON ${facultyFieldOfInterest.fieldOfInterestId} = ${fieldOfInterest.id}
        UNION
        SELECT
            ${facultyRank.facultyId} AS id,
            coalesce(${rank.title}, '')
                || ' ' || coalesce(${rank.salaryGrade}, '')
                || ' ' || coalesce(${rank.salaryRate}::text, '')
                || ' ' || coalesce(${facultyRank.appointmentStatus}, '')
                || ' ' || coalesce(${facultyRank.dateOfTenureOrRenewal}::text, '')
                AS searchcontent
        FROM ${facultyRank}
            LEFT JOIN ${rank} ON ${facultyRank.rankId} = ${rank.id}
        UNION
        SELECT
            ${facultyEmail.facultyId} AS id,
            coalesce(${facultyEmail.email}, '') AS searchcontent
        FROM ${facultyEmail}
        UNION
        SELECT
            ${facultyAcademicSemester.facultyId} AS id,
            coalesce(${adminPosition.title}, '')
                || ' ' || coalesce(${office.name}, '')
                || ' ' || coalesce(${facultyAdminPosition.startDate}::text, '')
                || ' ' || coalesce(${facultyAdminPosition.endDate}::text, '')
                AS searchcontent
        FROM ${facultyAcademicSemester}
            LEFT JOIN ${facultyAdminPosition}
                ON ${facultyAcademicSemester.id} = ${facultyAdminPosition.facultyAcademicSemesterId}
            LEFT JOIN ${adminPosition} ON ${facultyAdminPosition.adminPositionId} = ${adminPosition.id}
            LEFT JOIN ${office} ON ${facultyAdminPosition.officeId} = ${office.id}
        UNION
        SELECT
            ${facultyAcademicSemester.facultyId} AS id,
            coalesce(${facultyCommMembership.membership}, '')
                || ' ' || coalesce(${facultyCommMembership.committee}, '')
                || ' ' || coalesce(${facultyCommMembership.startDate}::text, '')
                || ' ' || coalesce(${facultyCommMembership.endDate}::text, '')
                AS searchcontent
        FROM ${facultyAcademicSemester}
            LEFT JOIN ${facultyCommMembership}
                ON ${facultyAcademicSemester.id} = ${facultyCommMembership.facultyAcademicSemesterId}
        UNION
        SELECT
            ${facultyAcademicSemester.facultyId} AS id,
            coalesce(${facultyAdminWork.natureOfWork}, '')
                || ' ' || coalesce(${office.name}, '')
                || ' ' || coalesce(${facultyAdminWork.startDate}::text, '')
                || ' ' || coalesce(${facultyAdminWork.endDate}::text, '')
                AS searchcontent
        FROM ${facultyAcademicSemester}
            LEFT JOIN ${facultyAdminWork}
                ON ${facultyAcademicSemester.id} = ${facultyAdminWork.facultyAcademicSemesterId}
            LEFT JOIN ${office} ON ${facultyAdminWork.officeId} = ${office.id}
        UNION
        SELECT
            ${facultyAcademicSemester.facultyId} AS id,
            coalesce(${course.name}, '')
                || ' ' || coalesce(${facultyCourse.section}, '')
                || ' ' || coalesce(${facultyCourse.numberOfStudents}::text, '')
                AS searchcontent
        FROM ${facultyAcademicSemester}
            LEFT JOIN ${facultyCourse}
                ON ${facultyAcademicSemester.id} = ${facultyCourse.facultyAcademicSemesterId}
            LEFT JOIN ${course} ON ${facultyCourse.courseId} = ${course.id}
        UNION
        SELECT
            ${facultyAcademicSemester.facultyId} AS id,
            coalesce(${student.id}::text, '')
                || ' ' || coalesce(${student.lastName}, '')
                || ' ' || coalesce(${student.middleName}, '')
                || ' ' || coalesce(${student.firstName}, '')
                || ' ' || coalesce(${facultyMentoring.category}, '')
                || ' ' || coalesce(${facultyMentoring.startDate}::text, '')
                || ' ' || coalesce(${facultyMentoring.endDate}::text, '')
                AS searchcontent
        FROM ${facultyAcademicSemester}
            LEFT JOIN ${facultyMentoring}
                ON ${facultyAcademicSemester.id} = ${facultyMentoring.facultyAcademicSemesterId}
            LEFT JOIN ${student} ON ${facultyMentoring.studentId} = ${student.id}
        UNION
        SELECT
            ${facultyAcademicSemester.facultyId} AS id,
            coalesce(${research.title}, '')
                || ' ' || coalesce(${research.startDate}::text, '')
                || ' ' || coalesce(${research.endDate}::text, '')
                || ' ' || coalesce(${research.funding}, '')
                AS searchcontent
        FROM ${facultyAcademicSemester}
            LEFT JOIN ${facultyResearch}
                ON ${facultyAcademicSemester.id} = ${facultyResearch.facultyAcademicSemesterId}
            LEFT JOIN ${research} ON ${facultyResearch.researchId} = ${research.id}
        UNION
        SELECT
            ${facultyAcademicSemester.facultyId} AS id,
            coalesce(${facultyExtension.natureOfExtension}, '')
                || ' ' || coalesce(${facultyExtension.agency}, '')
                || ' ' || coalesce(${facultyExtension.startDate}::text, '')
                || ' ' || coalesce(${facultyExtension.endDate}::text, '')
                AS searchcontent
        FROM ${facultyAcademicSemester}
            LEFT JOIN ${facultyExtension}
                ON ${facultyAcademicSemester.id} = ${facultyExtension.facultyAcademicSemesterId}
        UNION
        SELECT
            ${facultyAcademicSemester.facultyId} AS id,
            coalesce(${facultyStudyLoad.degreeProgram}, '')
                || ' ' || coalesce(${facultyStudyLoad.university}, '')
                AS searchcontent
        FROM ${facultyAcademicSemester}
            LEFT JOIN ${facultyStudyLoad}
                ON ${facultyAcademicSemester.id} = ${facultyStudyLoad.facultyAcademicSemesterId}
    `);

index('faculty_record_search_idx').using(
    'gin',
    sql`${facultyRecordSearchView.searchcontent} gin_trgm_ops`,
);
