import { drizzle as neonDrizzle } from 'drizzle-orm/neon-http';
import { drizzle as pgDrizzle } from 'drizzle-orm/node-postgres';
import { error } from '@sveltejs/kit';
import { expect, test } from '@playwright/test';
import { neon } from '@neondatabase/serverless';
import { Pool as PgPool } from 'pg';
import { sql } from 'drizzle-orm';

import * as schema from '$lib/server/db/schema';

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

test.describe('batch delete faculty records as it', () => {
    test.use({ storageState: 'playwright/.auth/it.json' });

    test('make faculty records', async () => {
        // delete all entries in the table muna
        await testDb.delete(schema.faculty);
        await testDb.delete(schema.facultyrank);
        await testDb.delete(schema.facultysemester);
        await testDb.delete(schema.facultyadminposition);

        // faculty
        await testDb.insert(schema.faculty).values([
            {
                facultyid: 1,
                lastname: 'Galinato',
                middlename: 'D',
                firstname: 'Eriene',
                birthdate: new Date().toISOString(),
                status: 'Active',
                dateoforiginalappointment: new Date().toISOString(),
                psiitem: '',
                employeenumber: '',
                tin: '',
                gsis: '',
                philhealth: '',
                pagibig: '',
            },
            {
                facultyid: 2,
                lastname: 'Camingao',
                middlename: 'B',
                firstname: 'Ericsson Jake',
                birthdate: new Date().toISOString(),
                status: 'On Leave',
                dateoforiginalappointment: new Date().toISOString(),
                psiitem: '',
                employeenumber: '',
                tin: '',
                gsis: '',
                philhealth: '',
                pagibig: '',
            },
            {
                facultyid: 3,
                lastname: 'Dela Cruz',
                middlename: 'O',
                firstname: 'Gabrielle Zach',
                birthdate: new Date().toISOString(),
                status: 'Sabbatical',
                dateoforiginalappointment: new Date().toISOString(),
                psiitem: '',
                employeenumber: '',
                tin: '',
                gsis: '',
                philhealth: '',
                pagibig: '',
            },
            {
                facultyid: 4,
                lastname: 'Mandario',
                middlename: 'S',
                firstname: 'Maricris',
                birthdate: new Date().toISOString(),
                status: 'Active',
                dateoforiginalappointment: new Date().toISOString(),
                psiitem: '',
                employeenumber: '',
                tin: '',
                gsis: '',
                philhealth: '',
                pagibig: '',
            },
        ]);

        // facultyrank
        await testDb.insert(schema.facultyrank).values([
            {
                facultyrankid: 1,
                facultyid: 1,
                rankid: 26,
                appointmentstatus: 'Tenured',
                dateoftenureorrenewal: new Date().toISOString(),
            },
            {
                facultyrankid: 2,
                facultyid: 2,
                rankid: 20,
                appointmentstatus: 'For Renewal',
                dateoftenureorrenewal: new Date().toISOString(),
            },
            {
                facultyrankid: 3,
                facultyid: 3,
                rankid: 6,
                appointmentstatus: 'For Renewal',
                dateoftenureorrenewal: new Date().toISOString(),
            },
            {
                facultyrankid: 4,
                facultyid: 4,
                rankid: 1,
                appointmentstatus: 'Tenured',
                dateoftenureorrenewal: new Date().toISOString(),
            },
        ]);

        // facultysemester
        await testDb.insert(schema.facultysemester).values([
            {
                facultysemesterid: 1,
                facultyid: 1,
                acadsemesterid: 1,
                currentrankid: 1,
            },
            {
                facultysemesterid: 2,
                facultyid: 2,
                acadsemesterid: 1,
                currentrankid: 2,
            },
            {
                facultysemesterid: 3,
                facultyid: 3,
                acadsemesterid: 1,
                currentrankid: 3,
            },
            {
                facultysemesterid: 4,
                facultyid: 4,
                acadsemesterid: 1,
                currentrankid: 4,
            },
        ]);

        // facultyadminposition
        await testDb.insert(schema.facultyadminposition).values([
            {
                facultyadminpositionid: 1,
                facultysemesterid: 1,
                adminpositionid: 1,
                officeid: 1,
                startdate: new Date().toISOString(),
                enddate: new Date().toISOString(),
                administrativeloadcredit: '5',
            },
        ]);

        // Refresh faculty record search view
        await testDb.execute(sql`REFRESH MATERIALIZED VIEW faculty_record_search_view`);
    });

    test('check selection', async ({ page }) => {
        // No redirection since user is logged-in
        page.goto('/');
        await expect(page).toHaveURL('/');

        // Select an account
        const checkbox1 = await page.getByRole('checkbox').first();
        expect(checkbox1).not.toBeChecked();
        await checkbox1.check();
        expect(checkbox1).toBeChecked();

        // See if the buttons are showing
        const selectAllBtn = await page.getByRole('button', { name: 'Select All', exact: true });
        expect(selectAllBtn).toBeVisible();

        const deselectSelectionBtn = await page.getByRole('button', {
            name: 'Deselect Selection',
            exact: true,
        });
        expect(deselectSelectionBtn).toBeVisible();

        const exportReportsBtn = await page.getByRole('button', {
            name: 'Export Reports',
            exact: true,
        });
        expect(exportReportsBtn).toBeVisible();

        const deleteRecordsBtn = await page.getByRole('button', {
            name: 'Delete Record',
            exact: true,
        });
        expect(deleteRecordsBtn).toBeVisible();

        // Select All
        await selectAllBtn.click();

        const checkbox2 = await page.getByRole('checkbox').nth(1);
        expect(checkbox2).toBeChecked();

        const checkbox3 = await page.getByRole('checkbox').nth(2);
        expect(checkbox3).toBeChecked();

        const checkbox4 = await page.getByRole('checkbox').nth(3);
        expect(checkbox4).toBeChecked();

        // Unselect one checkbox
        await checkbox1.click();
        expect(checkbox1).not.toBeChecked();

        // Deselect Selection
        await deselectSelectionBtn.click();
        expect(checkbox1).not.toBeChecked();
        expect(checkbox2).not.toBeChecked();
        expect(checkbox3).not.toBeChecked();
        expect(checkbox4).not.toBeChecked();

        expect(selectAllBtn).not.toBeVisible();
        expect(deselectSelectionBtn).not.toBeVisible();
        expect(deleteRecordsBtn).not.toBeVisible();
    });

    test('cancelled deletion', async ({ page }) => {
        // No redirection since user is logged-in
        page.goto('/');
        await expect(page).toHaveURL('/');

        // Select Faculty Records
        const checkbox1 = await page.getByRole('checkbox').first();
        expect(checkbox1).not.toBeChecked();
        await checkbox1.check();
        expect(checkbox1).toBeChecked();

        const selectAllBtn = await page.getByRole('button', { name: 'Select All', exact: true });
        expect(selectAllBtn).toBeVisible();
        await selectAllBtn.click();

        const checkbox2 = await page.getByRole('checkbox').nth(1);
        expect(checkbox2).toBeChecked();

        const checkbox3 = await page.getByRole('checkbox').nth(2);
        expect(checkbox3).toBeChecked();

        const checkbox4 = await page.getByRole('checkbox').nth(3);
        expect(checkbox4).toBeChecked();

        // Delete Faculty Records
        const deleteRecordsBtn = await page.getByRole('button', {
            name: 'Delete Records',
            exact: true,
        });
        expect(deleteRecordsBtn).toBeVisible();
        await deleteRecordsBtn.click();

        // Don't confirm
        await page.getByRole('button', { name: 'Cancel', exact: true }).click();

        // The new records should still be visible
        const cell = page.getByText('Galinato, Eriene');
        await expect(cell).toBeVisible();

        const cell1 = page.getByText('Camingao, Ericsson Jake');
        await expect(cell1).toBeVisible();

        const cell2 = page.getByText('Dela Cruz, Gabrielle Zach');
        await expect(cell2).toBeVisible();

        const cell3 = page.getByText('Mandario, Maricris');
        await expect(cell3).toBeVisible();

        // Deselect Selection
        const deselectSelectionBtn = await page.getByRole('button', {
            name: 'Deselect Selection',
            exact: true,
        });
        expect(deselectSelectionBtn).toBeVisible();

        await deselectSelectionBtn.click();
        expect(checkbox1).not.toBeChecked();
        expect(checkbox2).not.toBeChecked();
        expect(checkbox3).not.toBeChecked();
        expect(checkbox4).not.toBeChecked();

        expect(selectAllBtn).not.toBeVisible();
        expect(deselectSelectionBtn).not.toBeVisible();
        expect(deleteRecordsBtn).not.toBeVisible();
    });

    test('deleted', async ({ page }) => {
        // No redirection since user is logged-in
        page.goto('/');
        await expect(page).toHaveURL('/');

        // Select Faculty Records
        const checkbox1 = await page.getByRole('checkbox').first();
        expect(checkbox1).not.toBeChecked();
        await checkbox1.check();
        expect(checkbox1).toBeChecked();

        const selectAllBtn = await page.getByRole('button', { name: 'Select All', exact: true });
        expect(selectAllBtn).toBeVisible();
        await selectAllBtn.click();

        const checkbox2 = await page.getByRole('checkbox').nth(1);
        expect(checkbox2).toBeChecked();

        const checkbox3 = await page.getByRole('checkbox').nth(2);
        expect(checkbox3).toBeChecked();

        const checkbox4 = await page.getByRole('checkbox').nth(3);
        expect(checkbox4).toBeChecked();

        const cell = page.getByText('Galinato, Eriene');
        const cell1 = page.getByText('Camingao, Ericsson Jake');
        const cell2 = page.getByText('Dela Cruz, Gabrielle Zach');
        const cell3 = page.getByText('Mandario, Maricris');

        // Delete Faculty Records
        const deleteRecordsBtn = await page.getByRole('button', {
            name: 'Delete Records',
            exact: true,
        });
        expect(deleteRecordsBtn).toBeVisible();
        await deleteRecordsBtn.click();

        // Confirm
        await page.getByRole('button', { name: 'Delete', exact: true }).last().click();

        // Check message
        const afterDeleteMessage = await page.getByText('Deleted records.');
        await expect(afterDeleteMessage).toBeVisible();

        // The new records should still be visible
        await expect(cell).not.toBeVisible();
        await expect(cell1).not.toBeVisible();
        await expect(cell2).not.toBeVisible();
        await expect(cell3).not.toBeVisible();
    });
});

test.describe('batch delete faculty records as admin', () => {
    test.use({ storageState: 'playwright/.auth/admin.json' });

    test('make faculty records', async () => {
        // delete all entries in the table muna
        await testDb.delete(schema.faculty);
        await testDb.delete(schema.facultyrank);
        await testDb.delete(schema.facultysemester);
        await testDb.delete(schema.facultyadminposition);

        // faculty
        await testDb.insert(schema.faculty).values([
            {
                facultyid: 1,
                lastname: 'Galinato',
                middlename: 'D',
                firstname: 'Eriene',
                birthdate: new Date().toISOString(),
                status: 'Active',
                dateoforiginalappointment: new Date().toISOString(),
                psiitem: '',
                employeenumber: '',
                tin: '',
                gsis: '',
                philhealth: '',
                pagibig: '',
            },
            {
                facultyid: 2,
                lastname: 'Camingao',
                middlename: 'B',
                firstname: 'Ericsson Jake',
                birthdate: new Date().toISOString(),
                status: 'On Leave',
                dateoforiginalappointment: new Date().toISOString(),
                psiitem: '',
                employeenumber: '',
                tin: '',
                gsis: '',
                philhealth: '',
                pagibig: '',
            },
            {
                facultyid: 3,
                lastname: 'Dela Cruz',
                middlename: 'O',
                firstname: 'Gabrielle Zach',
                birthdate: new Date().toISOString(),
                status: 'Sabbatical',
                dateoforiginalappointment: new Date().toISOString(),
                psiitem: '',
                employeenumber: '',
                tin: '',
                gsis: '',
                philhealth: '',
                pagibig: '',
            },
            {
                facultyid: 4,
                lastname: 'Mandario',
                middlename: 'S',
                firstname: 'Maricris',
                birthdate: new Date().toISOString(),
                status: 'Active',
                dateoforiginalappointment: new Date().toISOString(),
                psiitem: '',
                employeenumber: '',
                tin: '',
                gsis: '',
                philhealth: '',
                pagibig: '',
            },
        ]);

        // facultyrank
        await testDb.insert(schema.facultyrank).values([
            {
                facultyrankid: 1,
                facultyid: 1,
                rankid: 26,
                appointmentstatus: 'Tenured',
                dateoftenureorrenewal: new Date().toISOString(),
            },
            {
                facultyrankid: 2,
                facultyid: 2,
                rankid: 20,
                appointmentstatus: 'For Renewal',
                dateoftenureorrenewal: new Date().toISOString(),
            },
            {
                facultyrankid: 3,
                facultyid: 3,
                rankid: 6,
                appointmentstatus: 'For Renewal',
                dateoftenureorrenewal: new Date().toISOString(),
            },
            {
                facultyrankid: 4,
                facultyid: 4,
                rankid: 1,
                appointmentstatus: 'Tenured',
                dateoftenureorrenewal: new Date().toISOString(),
            },
        ]);

        // facultysemester
        await testDb.insert(schema.facultysemester).values([
            {
                facultysemesterid: 1,
                facultyid: 1,
                acadsemesterid: 1,
                currentrankid: 1,
            },
            {
                facultysemesterid: 2,
                facultyid: 2,
                acadsemesterid: 1,
                currentrankid: 2,
            },
            {
                facultysemesterid: 3,
                facultyid: 3,
                acadsemesterid: 1,
                currentrankid: 3,
            },
            {
                facultysemesterid: 4,
                facultyid: 4,
                acadsemesterid: 1,
                currentrankid: 4,
            },
        ]);

        // facultyadminposition
        await testDb.insert(schema.facultyadminposition).values([
            {
                facultyadminpositionid: 1,
                facultysemesterid: 1,
                adminpositionid: 1,
                officeid: 1,
                startdate: new Date().toISOString(),
                enddate: new Date().toISOString(),
                administrativeloadcredit: '5',
            },
        ]);

        // Refresh faculty record search view
        await testDb.execute(sql`REFRESH MATERIALIZED VIEW faculty_record_search_view`);
    });

    test('check selection', async ({ page }) => {
        // No redirection since user is logged-in
        page.goto('/');
        await expect(page).toHaveURL('/');

        // Select an account
        const checkbox1 = await page.getByRole('checkbox').first();
        expect(checkbox1).not.toBeChecked();
        await checkbox1.check();
        expect(checkbox1).toBeChecked();

        // See if the buttons are showing
        const selectAllBtn = await page.getByRole('button', { name: 'Select All', exact: true });
        expect(selectAllBtn).toBeVisible();

        const deselectSelectionBtn = await page.getByRole('button', {
            name: 'Deselect Selection',
            exact: true,
        });
        expect(deselectSelectionBtn).toBeVisible();

        const exportReportsBtn = await page.getByRole('button', {
            name: 'Export Reports',
            exact: true,
        });
        expect(exportReportsBtn).toBeVisible();

        const deleteRecordsBtn = await page.getByRole('button', {
            name: 'Delete Record',
            exact: true,
        });
        expect(deleteRecordsBtn).toBeVisible();

        // Select All
        await selectAllBtn.click();

        const checkbox2 = await page.getByRole('checkbox').nth(1);
        expect(checkbox2).toBeChecked();

        const checkbox3 = await page.getByRole('checkbox').nth(2);
        expect(checkbox3).toBeChecked();

        const checkbox4 = await page.getByRole('checkbox').nth(3);
        expect(checkbox4).toBeChecked();

        // Unselect one checkbox
        await checkbox1.click();
        expect(checkbox1).not.toBeChecked();

        // Deselect Selection
        await deselectSelectionBtn.click();
        expect(checkbox1).not.toBeChecked();
        expect(checkbox2).not.toBeChecked();
        expect(checkbox3).not.toBeChecked();
        expect(checkbox4).not.toBeChecked();

        expect(selectAllBtn).not.toBeVisible();
        expect(deselectSelectionBtn).not.toBeVisible();
        expect(deleteRecordsBtn).not.toBeVisible();
    });

    test('cancelled deletion', async ({ page }) => {
        // No redirection since user is logged-in
        page.goto('/');
        await expect(page).toHaveURL('/');

        // Select Faculty Records
        const checkbox1 = await page.getByRole('checkbox').first();
        expect(checkbox1).not.toBeChecked();
        await checkbox1.check();
        expect(checkbox1).toBeChecked();

        const selectAllBtn = await page.getByRole('button', { name: 'Select All', exact: true });
        expect(selectAllBtn).toBeVisible();
        await selectAllBtn.click();

        const checkbox2 = await page.getByRole('checkbox').nth(1);
        expect(checkbox2).toBeChecked();

        const checkbox3 = await page.getByRole('checkbox').nth(2);
        expect(checkbox3).toBeChecked();

        const checkbox4 = await page.getByRole('checkbox').nth(3);
        expect(checkbox4).toBeChecked();

        // Delete Faculty Records
        const deleteRecordsBtn = await page.getByRole('button', {
            name: 'Delete Records',
            exact: true,
        });
        expect(deleteRecordsBtn).toBeVisible();
        await deleteRecordsBtn.click();

        // Don't confirm
        await page.getByRole('button', { name: 'Cancel', exact: true }).click();

        // The new records should still be visible
        const cell = page.getByText('Galinato, Eriene');
        await expect(cell).toBeVisible();

        const cell1 = page.getByText('Camingao, Ericsson Jake');
        await expect(cell1).toBeVisible();

        const cell2 = page.getByText('Dela Cruz, Gabrielle Zach');
        await expect(cell2).toBeVisible();

        const cell3 = page.getByText('Mandario, Maricris');
        await expect(cell3).toBeVisible();

        // Deselect Selection
        const deselectSelectionBtn = await page.getByRole('button', {
            name: 'Deselect Selection',
            exact: true,
        });
        expect(deselectSelectionBtn).toBeVisible();

        await deselectSelectionBtn.click();
        expect(checkbox1).not.toBeChecked();
        expect(checkbox2).not.toBeChecked();
        expect(checkbox3).not.toBeChecked();
        expect(checkbox4).not.toBeChecked();

        expect(selectAllBtn).not.toBeVisible();
        expect(deselectSelectionBtn).not.toBeVisible();
        expect(deleteRecordsBtn).not.toBeVisible();
    });

    test('deleted', async ({ page }) => {
        // No redirection since user is logged-in
        page.goto('/');
        await expect(page).toHaveURL('/');

        // Select Faculty Records
        const checkbox1 = await page.getByRole('checkbox').first();
        expect(checkbox1).not.toBeChecked();
        await checkbox1.check();
        expect(checkbox1).toBeChecked();

        const selectAllBtn = await page.getByRole('button', { name: 'Select All', exact: true });
        expect(selectAllBtn).toBeVisible();
        await selectAllBtn.click();

        const checkbox2 = await page.getByRole('checkbox').nth(1);
        expect(checkbox2).toBeChecked();

        const checkbox3 = await page.getByRole('checkbox').nth(2);
        expect(checkbox3).toBeChecked();

        const checkbox4 = await page.getByRole('checkbox').nth(3);
        expect(checkbox4).toBeChecked();

        const cell = page.getByText('Galinato, Eriene');
        const cell1 = page.getByText('Camingao, Ericsson Jake');
        const cell2 = page.getByText('Dela Cruz, Gabrielle Zach');
        const cell3 = page.getByText('Mandario, Maricris');

        // Delete Faculty Records
        const deleteRecordsBtn = await page.getByRole('button', {
            name: 'Delete Records',
            exact: true,
        });
        expect(deleteRecordsBtn).toBeVisible();
        await deleteRecordsBtn.click();

        // Confirm
        await page.getByRole('button', { name: 'Delete', exact: true }).last().click();

        // Check message
        const afterDeleteMessage = await page.getByText('Deleted records.');
        await expect(afterDeleteMessage).toBeVisible();

        // The new records should still be visible
        await expect(cell).not.toBeVisible();
        await expect(cell1).not.toBeVisible();
        await expect(cell2).not.toBeVisible();
        await expect(cell3).not.toBeVisible();
    });
});
