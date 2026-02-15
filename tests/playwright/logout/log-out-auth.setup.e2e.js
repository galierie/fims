import { expect, test } from "@playwright/test";

test.describe('log-out as admin', async () => {
  test.use({ storageState: 'playwright/.auth/admin.json' });

  test('admin', async ({ page }) => {
    // No redirection since user is logged-in
    await page.goto('/');
    await expect(page).toHaveURL('/');

    // Log-out
    (await page.getByRole('button', { name: 'Log-out' })).click();

    // Redirect to /login since user logged-out
    await page.goto('/');
    await expect(page).toHaveURL('/login');
  });
});

test.describe('log-out as it', async () => {
  test.use({ storageState: 'playwright/.auth/it.json' });

  test('it', async ({ page }) => {
    // No redirection since user is logged-in
    await page.goto('/');
    await expect(page).toHaveURL('/');

    // Log-out
    (await page.getByRole('button', { name: 'Log-out' })).click();

    // Redirect to /login since user logged-out
    await page.goto('/');
    await expect(page).toHaveURL('/login');
  });
});
