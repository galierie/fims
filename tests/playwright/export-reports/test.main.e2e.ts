import { expect, test } from '@playwright/test';

test.describe('export reports', () => {
    test.use({ storageState: 'playwright/.auth/it.json' });
    test.describe.configure({ mode: 'parallel' });

    test.describe('it', () => {
        test('in list, xlsx', async ({ page }) => {
            // No redirection since user is logged-in
            await page.goto('/');
            await expect(page).toHaveURL('/');

            await page.getByRole('button', { name: 'Export Reports' }).first().click();
            await page.getByLabel('By Subject, Faculty Taught').first().setChecked(true);
            await page.getByRole('button', { name: 'Export', exact: true }).first().click();

            const filename = 'By_Subject_Faculty_Taught.xlsx';
            await expect(page.getByText(filename).first()).toBeVisible();
            const downloadPromise = page.waitForEvent('download');
            await page.getByRole('link', { name: 'Download' }).first().click();
            const download = await downloadPromise;
            await expect(download.suggestedFilename()).toBe(filename);
        });

        test('in faculty record, csv', async ({ page }) => {
            // No redirection since user is logged-in
            await page.goto('/');
            await expect(page).toHaveURL('/');

            // Go to faculty profile
            await expect(page.getByText('Galinato, Eriene').first()).toBeVisible();
            await page.getByText('Galinato, Eriene').first().click();
            await page.waitForLoadState('networkidle');
            await expect(page.getByText('Galinato, Eriene').first()).toBeVisible();

            await page.getByRole('button', { name: 'Export Reports' }).first().click();
            await page.getByLabel('Faculty Profile').first().setChecked(true);
            await page.getByLabel('CSV').first().check();
            await page.getByRole('button', { name: 'Export', exact: true }).first().click();

            const filename = 'Galinato_Eriene-Profile.csv';
            await expect(page.getByText(filename).first()).toBeVisible();
            const downloadPromise = page.waitForEvent('download');
            await page.getByRole('link', { name: 'Download' }).first().click();
            const download = await downloadPromise;
            await expect(download.suggestedFilename()).toBe(filename);
        });
    });
});
