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

import { profile } from './auth.schema';
export * from './auth.schema';

export const changelog = pgTable(
    'changelog',
    {
        id: serial('id').primaryKey().notNull(),
        timestamp: timestamp('timestamp', { mode: 'date' }).defaultNow().notNull(),
        operatorId: text('operator_id'),
        tupleId: integer('tuple_id'),
        operation: text('operation').notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.operatorId],
            foreignColumns: [profile.id],
            name: 'changelog_operator_id_fkey',
        }).onDelete('set null'),
    ],
);

export const status = pgTable('status', {
    status: varchar('status', { length: 50 }).primaryKey().notNull(),
});

export const faculty = pgTable(
    'faculty',
    {
        id: serial('id').primaryKey().notNull(),
        lastName: varchar('last_name', { length: 100 }).notNull(),
        middleName: varchar('middle_name', { length: 100 }).notNull(),
        firstName: varchar('first_name', { length: 100 }).notNull(),
        suffix: varchar('suffix', { length: 50 }),
        maidenName: varchar('maiden_name', { length: 100 }),
        birthDate: date('birth_date', { mode: 'date' }).notNull(),
        isBiologicallyMale: boolean('is_biologically_male').notNull(),
        status: varchar('status', { length: 50 }),
        dateOfOriginalAppointment: date('date_of_original_appointment', { mode: 'date' }).notNull(),
        psiItem: varchar('psi_item', { length: 50 }).notNull(),
        employeeNumber: varchar('employee_number', { length: 50 }).notNull(),
        tin: varchar('tin', { length: 50 }).notNull(),
        gsis: varchar('gsis', { length: 50 }).notNull(),
        philhealth: varchar('philhealth', { length: 50 }).notNull(),
        pagibig: varchar('pagibig', { length: 50 }).notNull(),
        remarks: text('remarks'),
        latestChangelogId: integer('latest_changelog_id'),
    },
    (table) => [
        foreignKey({
            columns: [table.latestChangelogId],
            foreignColumns: [changelog.id],
            name: 'faculty_latest_changelog_id_fkey',
        }).onDelete('set null'),
        foreignKey({
            columns: [table.status],
            foreignColumns: [status.status],
            name: 'faculty_status_fkey',
        }).onDelete('set null'),
    ],
);

export const facultyContactNumber = pgTable(
    'faculty_contact_number',
    {
        id: serial('id').primaryKey().notNull(),
        facultyId: integer('faculty_id').notNull(),
        contactNumber: varchar('contact_number', { length: 20 }).notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.facultyId],
            foreignColumns: [faculty.id],
            name: 'faculty_contact_number_faculty_id_fkey',
        }).onDelete('cascade'),
    ],
);

export const facultyEducationalAttainment = pgTable(
    'faculty_educational_attainment',
    {
        id: serial('id').primaryKey().notNull(),
        facultyId: integer('faculty_id').notNull(),
        degree: varchar('degree', { length: 100 }).notNull(),
        institution: varchar('institution', { length: 200 }).notNull(),
        graduationYear: integer('graduation_year'),
    },
    (table) => [
        foreignKey({
            columns: [table.facultyId],
            foreignColumns: [faculty.id],
            name: 'faculty_educational_attainment_faculty_id_fkey',
        }).onDelete('cascade'),
    ],
);

export const fieldOfInterest = pgTable(
    'field_of_interest',
    {
        id: serial('id').primaryKey().notNull(),
        field: varchar('field', { length: 100 }).notNull(),
    },
    (table) => [unique('field_of_interest_field_key').on(table.field)],
);

export const facultyFieldOfInterest = pgTable(
    'faculty_field_of_interest',
    {
        id: serial('id').primaryKey().notNull(),
        facultyId: integer('faculty_id').notNull(),
        fieldOfInterestId: integer('field_of_interest_id').notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.facultyId],
            foreignColumns: [faculty.id],
            name: 'faculty_field_of_interest_faculty_id_fkey',
        }).onDelete('cascade'),
        foreignKey({
            columns: [table.fieldOfInterestId],
            foreignColumns: [fieldOfInterest.id],
            name: 'faculty_field_of_interest_field_of_interest_id_fkey',
        }).onDelete('cascade'),
    ],
);

export const rank = pgTable('rank', {
    id: serial('id').primaryKey().notNull(),
    title: varchar('title', { length: 100 }).notNull(),
    salaryGrade: varchar('salary_grade', { length: 10 }).notNull(),
    salaryRate: numeric('salary_rate', { precision: 10, scale: 2 }).notNull(),
});

export const appointmentStatus = pgTable('appointment_status', {
    appointmentStatus: varchar('appointment_status', { length: 50 }).primaryKey().notNull(),
});

export const facultyRank = pgTable(
    'faculty_rank',
    {
        id: serial('id').primaryKey().notNull(),
        facultyId: integer('faculty_id').notNull(),
        rankId: integer('rank_id'),
        appointmentStatus: varchar('appointment_status', { length: 50 }),
        dateOfTenureOrRenewal: date('date_of_tenure_or_renewal', { mode: 'date' }).notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.facultyId],
            foreignColumns: [faculty.id],
            name: 'faculty_rank_faculty_id_fkey',
        }).onDelete('cascade'),
        foreignKey({
            columns: [table.rankId],
            foreignColumns: [rank.id],
            name: 'faculty_rank_rank_id_fkey',
        }).onDelete('set null'),
        foreignKey({
            columns: [table.appointmentStatus],
            foreignColumns: [appointmentStatus.appointmentStatus],
            name: 'faculty_rank_appointment_status_fkey',
        }).onDelete('set null'),
    ],
);

export const facultyHomeAddress = pgTable(
    'faculty_home_address',
    {
        id: serial('id').primaryKey().notNull(),
        facultyId: integer('faculty_id').notNull(),
        homeAddress: text('home_address').notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.facultyId],
            foreignColumns: [faculty.id],
            name: 'faculty_home_address_faculty_id_fkey',
        }).onDelete('cascade'),
    ],
);

export const facultyEmail = pgTable(
    'faculty_email',
    {
        id: serial('id').primaryKey().notNull(),
        facultyId: integer('faculty_id').notNull(),
        email: varchar('email', { length: 100 }).notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.facultyId],
            foreignColumns: [faculty.id],
            name: 'faculty_email_faculty_id_fkey',
        }).onDelete('cascade'),
    ],
);

export const academicSemester = pgTable('academic_semester', {
    id: serial('id').primaryKey().notNull(),
    semesterNumber: smallint('semester_number').notNull(),
    academicYear: integer('academic_year').notNull(),
});

export const facultyAcademicSemester = pgTable(
    'faculty_academic_semester',
    {
        id: serial('id').primaryKey().notNull(),
        facultyId: integer('faculty_id').notNull(),
        academicSemesterId: integer('academic_semester_id'),
        currentRankId: integer('current_rank_id'),
        currentHighestEducationalAttainmentId: integer('current_highest_educational_attainment_id'),
        remarks: text('remarks'),
    },
    (table) => [
        foreignKey({
            columns: [table.facultyId],
            foreignColumns: [faculty.id],
            name: 'faculty_academic_semester_faculty_id_fkey',
        }).onDelete('cascade'),
        foreignKey({
            columns: [table.academicSemesterId],
            foreignColumns: [academicSemester.id],
            name: 'faculty_academic_semester_academic_semester_id_fkey',
        }).onDelete('set null'),
        foreignKey({
            columns: [table.currentRankId],
            foreignColumns: [facultyRank.id],
            name: 'faculty_academic_semester_current_rank_id_fkey',
        }).onDelete('set null'),
        foreignKey({
            columns: [table.currentHighestEducationalAttainmentId],
            foreignColumns: [facultyEducationalAttainment.id],
            name: 'faculty_academic_semester_current_highest_educational_attainment_id_fkey',
        }).onDelete('set null'),
    ],
);

export const adminPosition = pgTable('admin_position', {
    id: serial('id').primaryKey().notNull(),
    title: varchar('title', { length: 100 }).notNull(),
});

export const office = pgTable('office', {
    id: serial('id').primaryKey().notNull(),
    name: varchar('name', { length: 100 }).notNull(),
});

export const facultyAdminPosition = pgTable(
    'faculty_admin_position',
    {
        id: serial('id').primaryKey().notNull(),
        facultyAcademicSemesterId: integer('faculty_academic_semester_id'),
        adminPositionId: integer('admin_position_id'),
        officeId: integer('office_id'),
        startDate: date('start_date', { mode: 'date' }).notNull(),
        endDate: date('end_date', { mode: 'date' }).notNull(),
        administrativeLoadCredit: numeric('administrative_load_credit', { precision: 5, scale: 2 }).notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.facultyAcademicSemesterId],
            foreignColumns: [facultyAcademicSemester.id],
            name: 'faculty_admin_position_faculty_academic_semester_id_fkey',
        }).onDelete('set null'),
        foreignKey({
            columns: [table.adminPositionId],
            foreignColumns: [adminPosition.id],
            name: 'faculty_admin_position_admin_position_id_fkey',
        }).onDelete('set null'),
        foreignKey({
            columns: [table.officeId],
            foreignColumns: [office.id],
            name: 'faculty_admin_position_office_id_fkey',
        }).onDelete('set null'),
    ],
);

export const facultyCommMembership = pgTable(
    'faculty_comm_membership',
    {
        id: serial('id').primaryKey().notNull(),
        facultyAcademicSemesterId: integer('faculty_academic_semester_id'),
        membership: varchar('membership', { length: 100 }).notNull(),
        committee: varchar('committee', { length: 150 }).notNull(),
        startDate: date('start_date', { mode: 'date' }).notNull(),
        endDate: date('end_date', { mode: 'date' }).notNull(),
        administrativeLoadCredit: numeric('administrative_load_credit', { precision: 5, scale: 2 }).notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.facultyAcademicSemesterId],
            foreignColumns: [facultyAcademicSemester.id],
            name: 'faculty_comm_membership_faculty_academic_semester_id_fkey',
        }).onDelete('set null'),
    ],
);

export const facultyAdminWork = pgTable(
    'faculty_admin_work',
    {
        id: serial('id').primaryKey().notNull(),
        facultyAcademicSemesterId: integer('faculty_academic_semester_id'),
        natureOfWork: varchar('nature_of_work', { length: 200 }).notNull(),
        officeId: integer('office_id'),
        startDate: date('start_date', { mode: 'date' }).notNull(),
        endDate: date('end_date', { mode: 'date' }).notNull(),
        administrativeLoadCredit: numeric('administrative_load_credit', { precision: 5, scale: 2 }).notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.facultyAcademicSemesterId],
            foreignColumns: [facultyAcademicSemester.id],
            name: 'faculty_admin_work_faculty_academic_semester_id_fkey',
        }).onDelete('set null'),
        foreignKey({
            columns: [table.officeId],
            foreignColumns: [office.id],
            name: 'faculty_admin_work_office_id_fkey',
        }).onDelete('set null'),
    ],
);

export const course = pgTable('course', {
    id: serial('id').primaryKey().notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    units: integer('units').notNull(),
});

export const facultyCourse = pgTable(
    'faculty_course',
    {
        id: serial('id').primaryKey().notNull(),
        facultyAcademicSemesterId: integer('faculty_academic_semester_id'),
        courseId: integer('course_id'),
        section: varchar('section', { length: 50 }),
        numberOfStudents: integer('number_of_students'),
        teachingLoadCredit: numeric('teaching_load_credit', { precision: 5, scale: 2 }).notNull(),
        sectionSET: numeric('section_set', { precision: 4, scale: 3 }),
    },
    (table) => [
        foreignKey({
            columns: [table.facultyAcademicSemesterId],
            foreignColumns: [facultyAcademicSemester.id],
            name: 'faculty_course_faculty_academic_semester_id_fkey',
        }).onDelete('set null'),
        foreignKey({
            columns: [table.courseId],
            foreignColumns: [course.id],
            name: 'faculty_course_course_id_fkey',
        }).onDelete('set null'),
    ],
);

export const student = pgTable('student', {
    id: serial('id').primaryKey().notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    middleName: varchar('middle_name', { length: 100 }).notNull(),
    firstName: varchar('first_name', { length: 100 }).notNull(),
});

export const facultyMentoring = pgTable(
    'faculty_mentoring',
    {
        id: serial('id').primaryKey().notNull(),
        facultyAcademicSemesterId: integer('faculty_academic_semester_id'),
        studentId: integer('student_id'),
        category: varchar('category', { length: 50 }),
        startDate: date('start_date', { mode: 'date' }).notNull(),
        endDate: date('end_date', { mode: 'date' }).notNull(),
        remarks: text('remarks'),
    },
    (table) => [
        foreignKey({
            columns: [table.facultyAcademicSemesterId],
            foreignColumns: [facultyAcademicSemester.id],
            name: 'faculty_mentoring_faculty_academic_semester_id_fkey',
        }).onDelete('set null'),
        foreignKey({
            columns: [table.studentId],
            foreignColumns: [student.id],
            name: 'faculty_mentoring_student_id_fkey',
        }).onDelete('set null'),
    ],
);

export const research = pgTable('research', {
    id: serial('id').primaryKey().notNull(),
    title: varchar('title', { length: 200 }).notNull(),
    startDate: date('start_date', { mode: 'date' }).notNull(),
    endDate: date('end_date', { mode: 'date' }).notNull(),
    funding: text('funding'),
});

export const facultyResearch = pgTable(
    'faculty_research',
    {
        id: serial('id').primaryKey().notNull(),
        facultyAcademicSemesterId: integer('faculty_academic_semester_id'),
        researchId: integer('research_id'),
        researchLoadCredit: numeric('research_load_credit', { precision: 5, scale: 2 }).notNull(),
        remarks: text('remarks'),
    },
    (table) => [
        foreignKey({
            columns: [table.facultyAcademicSemesterId],
            foreignColumns: [facultyAcademicSemester.id],
            name: 'faculty_research_faculty_academic_semester_id_fkey',
        }).onDelete('set null'),
        foreignKey({
            columns: [table.researchId],
            foreignColumns: [research.id],
            name: 'faculty_research_research_id_fkey',
        }).onDelete('set null'),
    ],
);

export const facultyExtension = pgTable(
    'faculty_extension',
    {
        id: serial('id').primaryKey().notNull(),
        facultyAcademicSemesterId: integer('faculty_academic_semester_id'),
        natureOfExtension: varchar('nature_of_extension', { length: 200 }).notNull(),
        agency: varchar('agency', { length: 150 }).notNull(),
        startDate: date('start_date', { mode: 'date' }).notNull(),
        endDate: date('end_date', { mode: 'date' }).notNull(),
        extensionLoadCredit: numeric('extension_load_credit', { precision: 5, scale: 2 }).notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.facultyAcademicSemesterId],
            foreignColumns: [facultyAcademicSemester.id],
            name: 'faculty_extension_faculty_academic_semester_id_fkey',
        }).onDelete('set null'),
    ],
);

export const facultyStudyLoad = pgTable(
    'faculty_study_load',
    {
        id: serial('id').primaryKey().notNull(),
        facultyAcademicSemesterId: integer('faculty_academic_semester_id'),
        degreeProgram: varchar('degree_program', { length: 200 }).notNull(),
        university: varchar('university', { length: 150 }).notNull(),
        studyLoadUnits: numeric('study_load_units', { precision: 5, scale: 2 }).notNull(),
        onFullTimeLeaveWithPay: boolean('on_full_time_leave_with_pay').notNull(),
        isFacultyFellowshipRecipient: boolean('is_faculty_fellowship_recipient').notNull(),
        studyLoadCredit: numeric('study_load_credit', { precision: 5, scale: 2 }).notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.facultyAcademicSemesterId],
            foreignColumns: [facultyAcademicSemester.id],
            name: 'faculty_study_load_faculty_academic_semester_id_fkey',
        }).onDelete('set null'),
    ],
);

export const role = pgTable('role', {
    role: varchar('role', { length: 50 }).primaryKey().notNull(),
    canAddFaculty: boolean('can_add_faculty').notNull(),
    canModifyFaculty: boolean('can_modify_faculty').notNull(),
    canAddAccount: boolean('can_add_account').notNull(),
    canModifyAccount: boolean('can_modify_account').notNull(),
    canViewChangelogs: boolean('can_view_changelogs').notNull(),
});

export const profileInfo = pgTable(
    'profile_info',
    {
        id: serial('id').primaryKey().notNull(),
        profileId: text('profile_id').notNull(),
        role: varchar('role', { length: 50 }).notNull(),
        latestChangelogId: integer('latest_changelog_id'),
    },
    (table) => [
        foreignKey({
            columns: [table.profileId],
            foreignColumns: [profile.id],
            name: 'profile_info_profile_id_fkey',
        }).onDelete('cascade'),
        foreignKey({
            columns: [table.role],
            foreignColumns: [role.role],
            name: 'profile_info_role_fkey',
        }),
        foreignKey({
            columns: [table.latestChangelogId],
            foreignColumns: [changelog.id],
            name: 'profile_info_latest_changelog_id_fkey',
        }),
    ],
);

export const changelogRelations = relations(changelog, ({ one }) => ({
    faculty: one(faculty, {
        fields: [changelog.id],
        references: [faculty.latestChangelogId],
    }),
    profile: one(profile, {
        fields: [changelog.operatorId],
        references: [profile.id],
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
    facultyAdminWorks: many(facultyAdminWork),
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
    facultyMentorings: many(facultyMentoring),
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
    user: one(profile, {
        fields: [profileInfo.profileId],
        references: [profile.id],
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
            operator: profile.email,
            operation: changelog.operation,
        })
        .from(changelog)
        .leftJoin(profile, eq(profile.id, changelog.operatorId))
        .as('changelog_sq');

    const searchcontentQuery = sql<string>`
            coalesce(${profile.email}, '')
            || ' ' || coalesce(${profileInfo.role}, '')
            || ' ' || coalesce(${changelogSq.timestamp}::text, '')
            || ' ' || coalesce(${changelogSq.operator}, '')
            || ' ' || coalesce(${changelogSq.operation}, '')
        `;

    const view = qb
        .select({
            id: profile.id,
            searchcontent: searchcontentQuery.as('search_content'),
        })
        .from(profile)
        .leftJoin(profileInfo, eq(profileInfo.profileId, profile.id))
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
                || ' ' || coalesce(${facultyMentoring.remarks}, '')
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
