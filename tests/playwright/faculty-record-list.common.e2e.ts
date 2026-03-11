import { drizzle as neonDrizzle } from 'drizzle-orm/neon-http';
import { drizzle as pgDrizzle } from 'drizzle-orm/node-postgres';
import { error } from '@sveltejs/kit';
import { expect, test } from '@playwright/test';
import { neon } from '@neondatabase/serverless';
import { Pool as PgPool } from 'pg';
import { sql } from 'drizzle-orm';

import * as schema from '$lib/server/db/schema';
import * as testConsts from '../test-consts';

// Database stuff
function initializeDbClient() {
    switch (process.env.MODE!) {
        case 'LOCAL': {
            return pgDrizzle(new PgPool({ connectionString: process.env.DATABASE_URL! }), {
                schema,
            });
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

test('seed', async () => {
    await testConsts.seed();
})

test.describe('view faculty records as it', () => {
    test.use({ storageState: 'playwright/.auth/it.json' });
    test.describe.configure({mode: 'parallel'});

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
    test.describe.configure({mode: 'parallel'});

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

test.describe('viewing and searching records as it', () => {
    test.use({ storageState: 'playwright/.auth/it.json' }); 
    test.describe.configure({mode: 'parallel'});

    test('partial search', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveURL('/');

        const searchBar = page.getByRole('textbox', { name: 'Search', exact: true });
        const searchButton = page.getByRole('button', { name: 'Search', exact: true });

        await expect(searchBar).toBeVisible();
        await expect(searchButton).toBeVisible();

        // Search for a record
        await searchBar.fill('ato'); //should test case sensitivity
        await searchButton.click();

        await expect(page.getByText('Galinato, Eriene')).toBeVisible();
        await expect(page.getByText('Camingao, Ericsson Jake')).not.toBeVisible();
        await expect(page.getByText('Dela Cruz, Gabrielle Zach')).not.toBeVisible();
        await expect(page.getByText('Mandario, Maricris')).not.toBeVisible();
    });

    test('no records searched', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveURL('/');

        const searchBar = page.getByRole('textbox', { name: 'Search', exact: true });
        const searchButton = page.getByRole('button', { name: 'Search', exact: true });

        await expect(searchBar).toBeVisible();
        await expect(searchButton).toBeVisible();

        await searchBar.fill('random nonsense');
        await searchButton.click();

        await expect(page.getByText('Galinato, Eriene')).not.toBeVisible();
        await expect(page.getByText('Camingao, Ericsson Jake')).not.toBeVisible();
        await expect(page.getByText('Dela Cruz, Gabrielle Zach')).not.toBeVisible();
        await expect(page.getByText('Mandario, Maricris')).not.toBeVisible();
    });

    test('viewing expected record', async ({ page }) => {
        await page.goto('/');

        const recordEntry = page.getByText('Mandario, Maricris').locator('..');
        await expect(recordEntry).toBeVisible();
        await recordEntry.click();

        await expect(page).toHaveURL(/faculty/u); //in faculty route
        await expect(page.getByText('Mandario, Maricris')).toBeVisible(); //correct record is shown

        const backButton = page.getByRole('link', {
            name: 'Back to List of Faculty Records',
            exact: true,
        });
        await backButton.click();

        await expect(page).toHaveURL('/');
        await expect(page.getByText('Mandario, Maricris')).toBeVisible();
    });
    test('check selection', async ({ page }) => {
        // No redirection since user is logged-in
        page.goto('/');
        await expect(page).toHaveURL('/');

        // Select an account
        const checkbox0 = await page.getByRole('checkbox').first();
        await expect(checkbox0).not.toBeChecked();
        await checkbox0.check();
        await expect(checkbox0).toBeChecked();

        // See if the buttons are showing
        const selectAllBtn = await page.getByRole('button', { name: 'Select All', exact: true });
        await expect(selectAllBtn).toBeVisible();

        const deselectSelectionBtn = await page.getByRole('button', {
            name: 'Deselect Selection',
            exact: true,
        });
        await expect(deselectSelectionBtn).toBeVisible();

        const exportReportsBtn = await page.getByRole('button', {
            name: 'Export Reports',
            exact: true,
        });
        await expect(exportReportsBtn).toBeVisible();

        const deleteRecordsBtn = await page.getByRole('button', {
            name: 'Delete Record',
            exact: true,
        });
        await expect(deleteRecordsBtn).toBeVisible();

        // Select All
        await selectAllBtn.click();

        const checkbox1 = await page.getByRole('checkbox').nth(1);
        await expect(checkbox1).toBeChecked();

        const checkbox2 = await page.getByRole('checkbox').nth(2);
        await expect(checkbox2).toBeChecked();

        // Unselect one checkbox
        await checkbox0.click();
        await expect(checkbox0).not.toBeChecked();

        // Deselect Selection
        await deselectSelectionBtn.click();
        await expect(checkbox0).not.toBeChecked();
        await expect(checkbox1).not.toBeChecked();
        await expect(checkbox2).not.toBeChecked();

        await expect(selectAllBtn).not.toBeVisible();
        await expect(deselectSelectionBtn).not.toBeVisible();
        await expect(deleteRecordsBtn).not.toBeVisible();
    });
})

test.describe('viewing and searching records as admin', async() => {
    test.use({ storageState: 'playwright/.auth/admin.json' }); 
    test.describe.configure({mode: 'parallel'});

    test('partial search', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveURL('/');

        const searchBar = page.getByRole('textbox', { name: 'Search', exact: true });
        const searchButton = page.getByRole('button', { name: 'Search', exact: true });

        await expect(searchBar).toBeVisible();
        await expect(searchButton).toBeVisible();

        // Search for a record
        await searchBar.fill('ato'); //should test case sensitivity
        await searchButton.click();

        await expect(page.getByText('Galinato, Eriene')).toBeVisible();
        await expect(page.getByText('Camingao, Ericsson Jake')).not.toBeVisible();
        await expect(page.getByText('Dela Cruz, Gabrielle Zach')).not.toBeVisible();
        await expect(page.getByText('Mandario, Maricris')).not.toBeVisible();
    });

    test('no records searched', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveURL('/');

        const searchBar = page.getByRole('textbox', { name: 'Search', exact: true });
        const searchButton = page.getByRole('button', { name: 'Search', exact: true });

        await expect(searchBar).toBeVisible();
        await expect(searchButton).toBeVisible();

        await searchBar.fill('random nonsense');
        await searchButton.click();

        await expect(page.getByText('Galinato, Eriene')).not.toBeVisible();
        await expect(page.getByText('Camingao, Ericsson Jake')).not.toBeVisible();
        await expect(page.getByText('Dela Cruz, Gabrielle Zach')).not.toBeVisible();
        await expect(page.getByText('Mandario, Maricris')).not.toBeVisible();
    });

    test('viewing expected record', async ({ page }) => {
        await page.goto('/');

        const recordEntry = page.getByText('Mandario, Maricris').locator('..');
        await expect(recordEntry).toBeVisible();
        await recordEntry.click();

        await expect(page).toHaveURL(/faculty/u); //in faculty route
        await expect(page.getByText('Mandario, Maricris')).toBeVisible(); //correct record is shown

        const backButton = page.getByRole('link', {
            name: 'Back to List of Faculty Records',
            exact: true,
        });
        await backButton.click();

        await expect(page).toHaveURL('/');
        await expect(page.getByText('Mandario, Maricris')).toBeVisible();
    });

    test('check selection', async ({ page }) => {
        // No redirection since user is logged-in
        page.goto('/');
        await expect(page).toHaveURL('/');

        // Select an account
        const checkbox1 = await page.getByRole('checkbox').first();
        await expect(checkbox1).not.toBeChecked();
        await checkbox1.check();
        await expect(checkbox1).toBeChecked();

        // See if the buttons are showing
        const selectAllBtn = await page.getByRole('button', { name: 'Select All', exact: true });
        await expect(selectAllBtn).toBeVisible();

        const deselectSelectionBtn = await page.getByRole('button', {
            name: 'Deselect Selection',
            exact: true,
        });
        await expect(deselectSelectionBtn).toBeVisible();

        const exportReportsBtn = await page.getByRole('button', {
            name: 'Export Reports',
            exact: true,
        });
        await expect(exportReportsBtn).toBeVisible();

        const deleteRecordsBtn = await page.getByRole('button', {
            name: 'Delete Record',
            exact: true,
        });
        await expect(deleteRecordsBtn).toBeVisible();

        // Select All
        await selectAllBtn.click();

        const checkbox2 = await page.getByRole('checkbox').nth(1);
        await expect(checkbox2).toBeChecked();

        const checkbox3 = await page.getByRole('checkbox').nth(2);
        await expect(checkbox3).toBeChecked();

        // Unselect one checkbox
        await checkbox1.click();
        await expect(checkbox1).not.toBeChecked();

        // Deselect Selection
        await deselectSelectionBtn.click();
        await expect(checkbox1).not.toBeChecked();
        await expect(checkbox2).not.toBeChecked();
        await expect(checkbox3).not.toBeChecked();

        await expect(selectAllBtn).not.toBeVisible();
        await expect(deselectSelectionBtn).not.toBeVisible();
        await expect(deleteRecordsBtn).not.toBeVisible();
    });
})

