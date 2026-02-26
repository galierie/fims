import { expect, test } from '@playwright/test';
import { drizzle as neonDrizzle } from 'drizzle-orm/neon-http';
import { drizzle as pgDrizzle } from 'drizzle-orm/node-postgres';
import { error } from '@sveltejs/kit';
import { neon } from '@neondatabase/serverless';
import { Pool as PgPool } from 'pg';

import * as schema from '$lib/server/db/schema';

// Database stuff
function initializeDbClient() {
    switch (process.env.MODE!) {
        case 'LOCAL': {
            return pgDrizzle(new PgPool({ connectionString: process.env.DATABASE_URL! }), { schema });
        }
        case 'NEON': {
            return neonDrizzle(neon(process.env.DATABASE_URL!), { schema });
        }
        default:
            throw error(500, { message: 'Cannot initialize database client.' });
    }
}

const testDb = initializeDbClient();

// Actual tests

const facultyRecordTableHeaders = ['Status', 'Rank', 'Administrative Position'];

test.describe('view faculty records as it', () => {
    test.use({ storageState: 'playwright/.auth/it.json' });

    test('it', async ({ page }) => {
        // No redirection since user is logged-in
        await page.goto('/');
        await expect(page).toHaveURL('/');

        // Check faculty records by checking table headers
        const fullNameCell = await page.getByText('Full Name', { exact: true });
        await expect(fullNameCell).toBeVisible();

        for (const val of facultyRecordTableHeaders) {
            const tableHeader = page.getByText(val).nth(1);
            await expect(tableHeader).toBeVisible();
        }

        // Check faculty record change logs by checking the table header alone
        const changeLogCell = await page.getByText('Change Logs', { exact: true });
        await expect(changeLogCell).toBeVisible();
    });
});

test.describe('view faculty records as admin', () => {
    test.use({ storageState: 'playwright/.auth/admin.json' });

    test('admin', async ({ page }) => {
        // No redirection since user is logged-in
        await page.goto('/');
        await expect(page).toHaveURL('/');

        // Check faculty records by checking table headers
        const fullNameCell = await page.getByText('Full Name', { exact: true });
        await expect(fullNameCell).toBeVisible();

        for (const val of facultyRecordTableHeaders) {
            const tableHeader = page.getByText(val).nth(1);
            await expect(tableHeader).toBeVisible();
        }
    });
});
