import { expect, test } from '@playwright/test';

const facultyRecordTableHeaders = ['Full Name', 'Status', 'Rank', 'Administrative Position'];

const facultyRecordDummyRow = ['Dela Cruz, Juan', 'Active', 'Professor 7', 'Department Chair'];

const facultyRecordTable = [...facultyRecordTableHeaders, ...facultyRecordDummyRow];

test.describe('view faculty records as it', () => {
    test.use({ storageState: 'playwright/.auth/it.json' });

    test('it', async ({ page }) => {
        // No redirection since user is logged-in
        await page.goto('/');
        await expect(page).toHaveURL('/');

        // Check faculty records by checking table headers and a dummy row
        for (const val of facultyRecordTable) await expect(page.getByText(val)).toBeVisible();

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

        // Check faculty records by checking table headers and a dummy row
        for (const val of facultyRecordTable) await expect(page.getByText(val)).toBeVisible();
    });
});
