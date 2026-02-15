import { expect, test } from "@playwright/test";

test.use({ storageState: 'playwright/.auth/it.json' });

const accountTableHeaders = [
  'Email',
  'Reset Password?',
  'Type',
  'Change Logs',
  'Account Action',
];

const accountDummyRow = [
  'admin@up.edu.ph',
];

const accountTable = [
  ...accountTableHeaders,
  ...accountDummyRow,
];

test('view account list', async ({ page }) => {
  // No redirection since user is logged-in
  await page.goto('/accounts');
  await expect(page).toHaveURL('/accounts');

  // See accounts by checking table headers and a dummy row
  accountTable.forEach(async val => {
    const cell = await page.getByText(val, { exact: true });
    await expect(cell).toBeVisible();
  });
});