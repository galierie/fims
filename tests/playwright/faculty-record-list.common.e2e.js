import { expect, test } from "@playwright/test";
import { expectedRankPrefixes } from "../test-consts";
import { expectedStatuses } from "../test-consts";

const facultyRecordTableHeaders = [
  'Full Name',
  'Status',
  'Rank',
  'Administrative Position',
];

const facultyRecordDummyRow = [
  'Dela Cruz, Juan',
  'Active', 
  //'Professor 7',
  //'Department Chair',
];

const facultyRecordTable = [
  ...facultyRecordTableHeaders,
  ...facultyRecordDummyRow,
];

test.describe('view faculty records as admin', async () => {
  test.use({ storageState: 'playwright/.auth/admin.json' });

  test('admin', async ({ page }) => {
    // No redirection since user is logged-in
    await page.goto('/');
    await expect(page).toHaveURL('/');

    // Check faculty records by checking table headers and a dummy row
    /* see account-list.e2e
    facultyRecordTable.forEach(async val => {
      const cell = await page.getByText(val, { exact: true })
      await expect(cell).toBeVisible();
    });
    */
    for (let field of facultyRecordTable) {
      await expect(page.getByText(field, {exact:true}).last()).toBeVisible()
    }
  });
});

test.describe('view faculty records as it', async () => {
  test.use({ storageState: 'playwright/.auth/it.json' });

  test('it', async ({ page }) => {
    // No redirection since user is logged-in
    await page.goto('/');
    await expect(page).toHaveURL('/');

    // Check faculty records by checking table headers and a dummy row
    /* see account-list.e2e
    facultyRecordTable.forEach(async val => {
      const cell = await page.getByText(val, { exact: true });
      await expect(cell).toBeVisible();
    });
    */
    for (let field of facultyRecordTable) {
      await expect(page.getByText(field, {exact:true}).last()).toBeVisible()
    }

    // Check faculty record change logs by checking the table header alone
    const changeLogCell = await page.getByText('Change Logs', { exact: true });
    await expect(changeLogCell).toBeVisible();
  });
});

// test.describe('view faculty records common', async () => {
//   test.use({ storageState: 'playwright/.auth/it.json'});

//   test('check filter displays', async ({page}) => {
//     const statusFilter = page.getByRole("button", {name: 'Status:'});

//     await statusFilter.click()
//     for (let status of expectedStatuses) {
//       await expect(page.getByText(status)).toBeVisible();
//     }

//     /* see search-functions record-search.e2e
//     await rankFilter.click()
//     for (let prefix of expectedRankPrefixes) {
//       await expect(page.getByText(`${prefix} 1`)).toBeVisible();
//     }
//     */
//   });
// });
