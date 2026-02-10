// src/lib/server/db/schema.ts
import { pgTable, serial, text, varchar, timestamp } from 'drizzle-orm/pg-core';

// Task 2 & 6: User Accounts
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: text('email').notNull().unique(), // Must end in @up.edu.ph
    password: text('password').notNull(),    // In prod, this should be a hash
    role: varchar('role', { enum: ['IT', 'Admin'] }).notNull(), // Task 6
    googleId: text('google_id'),
});

// Task 4: Faculty Records
export const faculty = pgTable('faculty', {
    id: serial('id').primaryKey(),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    department: text('department').notNull(),
    lastUpdated: timestamp('last_updated').defaultNow(),
});