import { expect, test } from '@playwright/test';

test.use({ storageState: 'playwright/.auth/it.json' });

const accountTableHeaders = ['Email', 'Reset Password?', 'Type', 'Change Logs', 'Account Action'];

const accountDummyRow = [process.env.ADMIN_EMAIL!];

const accountTable = [...accountTableHeaders, ...accountDummyRow];

test('view account list', async ({ page }) => {
    // No redirection since user is logged-in
    await page.goto('/accounts');
    await expect(page).toHaveURL('/accounts');

    // See accounts by checking table headers and a dummy row
    for (const val of accountTable)
        await expect(page.getByText(val, { exact: true })).toBeVisible();
});
