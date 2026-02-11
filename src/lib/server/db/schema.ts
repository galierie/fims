import { pgTable, serial, varchar, date, smallint, text, foreignKey, integer, unique, numeric, timestamp, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const faculty = pgTable("faculty", {
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
	istenured: smallint(),
	tenureposition: varchar({ length: 100 }),
	dateoftenure: date(),
	remarks: text(),
});

export const facultycontactnumber = pgTable("facultycontactnumber", {
	facultycontactnumberid: serial().primaryKey().notNull(),
	facultyid: integer(),
	contactnumber: varchar({ length: 20 }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.facultyid],
			foreignColumns: [faculty.facultyid],
			name: "facultycontactnumber_facultyid_fkey"
		}).onDelete("cascade"),
]);

export const facultyeducationalattainment = pgTable("facultyeducationalattainment", {
	facultyeducationalattainmentid: serial().primaryKey().notNull(),
	facultyid: integer(),
	degree: varchar({ length: 100 }).notNull(),
	institution: varchar({ length: 200 }).notNull(),
	graduationyear: integer(),
}, (table) => [
	foreignKey({
			columns: [table.facultyid],
			foreignColumns: [faculty.facultyid],
			name: "facultyeducationalattainment_facultyid_fkey"
		}).onDelete("cascade"),
]);

export const facultyfieldofinterest = pgTable("facultyfieldofinterest", {
	facultyfieldofinterestid: serial().primaryKey().notNull(),
	facultyid: integer(),
	fieldofinterestid: integer(),
}, (table) => [
	foreignKey({
			columns: [table.facultyid],
			foreignColumns: [faculty.facultyid],
			name: "facultyfieldofinterest_facultyid_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.fieldofinterestid],
			foreignColumns: [fieldofinterest.fieldofinterestid],
			name: "facultyfieldofinterest_fieldofinterestid_fkey"
		}).onDelete("cascade"),
]);

export const fieldofinterest = pgTable("fieldofinterest", {
	fieldofinterestid: serial().primaryKey().notNull(),
	fieldname: varchar({ length: 100 }).notNull(),
}, (table) => [
	unique("fieldofinterest_fieldname_key").on(table.fieldname),
]);

export const facultyrank = pgTable("facultyrank", {
	facultyrankid: serial().primaryKey().notNull(),
	facultyid: integer(),
	rankid: integer(),
	dateofappointment: date().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.facultyid],
			foreignColumns: [faculty.facultyid],
			name: "facultyrank_facultyid_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.rankid],
			foreignColumns: [rank.rankid],
			name: "facultyrank_rankid_fkey"
		}),
]);

export const rank = pgTable("Rank", {
	rankid: serial().primaryKey().notNull(),
	ranktitle: varchar({ length: 100 }).notNull(),
	salarygrade: varchar({ length: 10 }).notNull(),
	salaryrate: numeric({ precision: 10, scale:  2 }).notNull(),
});

export const semester = pgTable("semester", {
	acadsemesterid: serial().primaryKey().notNull(),
	semester: smallint().notNull(),
	academicyear: integer().notNull(),
});

export const adminposition = pgTable("adminposition", {
	positionid: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
});

export const course = pgTable("course", {
	courseid: serial().primaryKey().notNull(),
	coursename: varchar({ length: 100 }).notNull(),
	units: integer().notNull(),
});

export const research = pgTable("research", {
	researchid: serial().primaryKey().notNull(),
	title: varchar({ length: 200 }).notNull(),
});

export const facultyhomeaddress = pgTable("facultyhomeaddress", {
	facultyhomeaddressid: serial().primaryKey().notNull(),
	facultyid: integer(),
	homeaddress: text().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.facultyid],
			foreignColumns: [faculty.facultyid],
			name: "facultyhomeaddress_facultyid_fkey"
		}).onDelete("cascade"),
]);

export const facultyadministrative = pgTable("facultyadministrative", {
	facultyadministrativeid: serial().primaryKey().notNull(),
	facultyid: integer(),
	acadsemesterid: integer(),
	positionid: integer(),
	startdate: date().notNull(),
	enddate: date().notNull(),
	administrativeloadcredit: numeric({ precision: 5, scale:  2 }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.facultyid],
			foreignColumns: [faculty.facultyid],
			name: "facultyadministrative_facultyid_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.acadsemesterid],
			foreignColumns: [semester.acadsemesterid],
			name: "facultyadministrative_acadsemesterid_fkey"
		}),
	foreignKey({
			columns: [table.positionid],
			foreignColumns: [adminposition.positionid],
			name: "facultyadministrative_positionid_fkey"
		}),
]);

export const facultyteaching = pgTable("facultyteaching", {
	facultyteachingid: serial().primaryKey().notNull(),
	facultyid: integer(),
	acadsemesterid: integer(),
	courseid: integer(),
	section: varchar({ length: 50 }),
	numberofstudents: integer(),
	teachingloadcredit: numeric({ precision: 5, scale:  2 }).notNull(),
	sectionset: numeric({ precision: 4, scale:  3 }),
}, (table) => [
	foreignKey({
			columns: [table.facultyid],
			foreignColumns: [faculty.facultyid],
			name: "facultyteaching_facultyid_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.acadsemesterid],
			foreignColumns: [semester.acadsemesterid],
			name: "facultyteaching_acadsemesterid_fkey"
		}),
	foreignKey({
			columns: [table.courseid],
			foreignColumns: [course.courseid],
			name: "facultyteaching_courseid_fkey"
		}),
]);

export const facultyresearch = pgTable("facultyresearch", {
	facultyresearchid: serial().primaryKey().notNull(),
	facultyid: integer(),
	acadsemesterid: integer(),
	researchid: integer(),
	startdate: date().notNull(),
	enddate: date(),
	funding: numeric({ precision: 10, scale:  2 }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.facultyid],
			foreignColumns: [faculty.facultyid],
			name: "facultyresearch_facultyid_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.acadsemesterid],
			foreignColumns: [semester.acadsemesterid],
			name: "facultyresearch_acadsemesterid_fkey"
		}),
	foreignKey({
			columns: [table.researchid],
			foreignColumns: [research.researchid],
			name: "facultyresearch_researchid_fkey"
		}),
]);

export const facultyextension = pgTable("facultyextension", {
	extensionid: serial().primaryKey().notNull(),
	facultyid: integer(),
	extensiontype: varchar({ length: 50 }),
	extensiondata: text(),
}, (table) => [
	foreignKey({
			columns: [table.facultyid],
			foreignColumns: [faculty.facultyid],
			name: "facultyextension_facultyid_fkey"
		}),
]);

export const accountrole = pgTable("accountrole", {
	accountrole: varchar({ length: 50 }).primaryKey().notNull(),
	canaddfaculty: boolean().notNull(),
	canmodifyfaculty: boolean().notNull(),
	canaddaccount: boolean().notNull(),
	canmodifyaccount: boolean().notNull(),
	canviewchangelogs: boolean().notNull(),
});

export const account = pgTable("account", {
	accountid: serial().primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	passwordhash: varchar({ length: 255 }).notNull(),
	accountrole: varchar({ length: 50 }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.accountrole],
			foreignColumns: [accountrole.accountrole],
			name: "account_accountrole_fkey"
		}),
	unique("account_email_key").on(table.email),
]);

export const changelog = pgTable("changelog", {
	logid: serial().primaryKey().notNull(),
	timestamp: timestamp({ mode: 'string' }).notNull(),
	accountid: integer(),
	tupleid: integer(),
	operation: smallint().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.accountid],
			foreignColumns: [account.accountid],
			name: "changelog_accountid_fkey"
		}),
]);
