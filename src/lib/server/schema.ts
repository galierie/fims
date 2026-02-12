// note: will probably port this out if it ever gets too long

import {
  serial, 
  pgTable, 
  smallint, 
  varchar} from "drizzle-orm/pg-core"

export const accountRoles = pgTable("accountRole", {
  accountRole: varchar({length: 255}).primaryKey().notNull(),
  canAddFaculty: smallint().notNull(),
  canModifyFaculty: smallint().notNull(),
  canAddAccount: smallint().notNull(),
  canModifyAccount: smallint().notNull(),
  canViewChangeLogs: smallint().notNull(),
});

export const accounts = pgTable("account", {
  accountId: serial().primaryKey().notNull(),
  email: varchar({length: 255}).notNull().unique(),
  passwordHash: varchar({length: 255}).notNull(),
  // accountRole: varchar({length: 50}).references(() => accountRoles.accountRole).notNull()
});