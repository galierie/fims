import { expect, test } from "@playwright/test";

// NOTE: Can't see which one is selected

test.use({ storageState: 'playwright/.auth/it.json' });

test('check navigation bar', async ({ page }) => {
  // No redirection since user is logged-in
  page.goto('/');
  await expect(page).toHaveURL('/');

  // Get navigation bar
  const navBar = page.locator('nav').first();

  // Check navigation

  // Account List
  await navBar.getByRole('link', { name: 'Accounts' }).click();
  await expect(page).toHaveURL('/accounts');

  // Faculty Record List
  await navBar.getByRole('link', { name: 'Faculty Records' }).click();
  await expect(page).toHaveURL('/');
});