import { expect, test } from "@playwright/test";
import * as consts from '../../test-consts'

test.use({ storageState: 'playwright/.auth/it.json' });

const accountTableHeaders = [
  'Email',
  'Reset Password?',
  'Type',
  'Change Logs',
  'Account Action',
];

const accountDummyRow = [
  consts.AdminAcc,
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
  /* this  has a high chance of failing
  because of some async stuff
  im not exactly sure why
  accountTable.forEach(async val => {
    const cell = await page.getByText(val, { exact: true });
    await expect(cell).toBeVisible();
  });
  */

  for (let field of accountTable) {
    await expect(page.getByText(field, {exact:true})).toBeVisible()
  }
});