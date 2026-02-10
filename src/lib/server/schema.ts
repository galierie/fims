// note: will probably port this out if it ever gets too long

import {
  serial, 
  pgTable, 
  smallint, 
  varchar,
  text,
  timestamp} from "drizzle-orm/pg-core"

export const accountRoles = pgTable("accountRole", {
  accountRole: varchar({length: 255}).primaryKey().notNull(),
  canAddFaculty: smallint().notNull(),
  canModifyFaculty: smallint().notNull(),
  canAddAccount: smallint().notNull(),
  canModifyAccount: smallint().notNull(),
  canViewChangeLogs: smallint().notNull(),
});

export const accounts = pgTable("users", {
  accountId: serial().primaryKey().notNull(),
  email: varchar({length: 255}).notNull().unique(),
  password: varchar({length: 255}).notNull(),
  role: varchar({length: 50}).references(() => accountRoles.accountRole).notNull(),
  google_id: text()
});

export const faculty = pgTable("faculty", {
  id: serial().primaryKey().notNull(),
  first_name: text().notNull(),
  last_name: text().notNull(),
  department: text(),
  last_updated: timestamp(),
})