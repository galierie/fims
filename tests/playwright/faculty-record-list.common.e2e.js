import { expect, test } from "@playwright/test";

const facultyRecordTableHeaders = [
  'Full Name',
  'Status',
  'Rank',
  'Administrative Position',
];

const facultyRecordDummyRow = [
  'Dela Cruz, Juan',
  'Active',
  'Professor 7',
  'Department Chair',
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
    facultyRecordTable.forEach(async val => {
      const cell = await page.getByText(val, { exact: true })
      await expect(cell).toBeVisible();
    });
  });
});

test.describe('view faculty records as it', async () => {
  test.use({ storageState: 'playwright/.auth/it.json' });

  test('it', async ({ page }) => {
    // No redirection since user is logged-in
    await page.goto('/');
    await expect(page).toHaveURL('/');

    // Check faculty records by checking table headers and a dummy row
    facultyRecordTable.forEach(async val => {
      const cell = await page.getByText(val, { exact: true });
      await expect(cell).toBeVisible();
    });

    // Check faculty record change logs by checking the table header alone
    const changeLogCell = await page.getByText('Change Logs', { exact: true });
    await expect(changeLogCell).toBeVisible();
  });
});
