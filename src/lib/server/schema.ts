// note: will probably port this out if it ever gets too long

import {
  serial, 
  pgTable, 
  smallint, 
  varchar,
  text,
  timestamp} from "drizzle-orm/pg-core"

export const roles = pgTable("role", {
  role: varchar({length: 255}).primaryKey().notNull(),
  can_add_faculty: smallint().notNull(),
  can_modify_faculty: smallint().notNull(),
  can_add_account: smallint().notNull(),
  can_modify_account: smallint().notNull(),
  can_view_change_logs: smallint().notNull(),
});

export const accounts = pgTable("users", {
  id: serial().primaryKey().notNull(),
  email: varchar({length: 255}).notNull().unique(),
  password: varchar({length: 255}).notNull(),
  role: varchar({length: 50}).references(() => roles.role).notNull(),
  google_id: text()
});

export const faculty = pgTable("faculty", {
  id: serial().primaryKey().notNull(),
  first_name: text().notNull(),
  last_name: text().notNull(),
  department: text(),
  last_updated: timestamp(),
})