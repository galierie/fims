import { expect, test as setup } from "@playwright/test";

// NOTE: Don't simulate Google OAuth na. Hard to mock third-party UIs.

const authFile = 'playwright/.auth/admin.json';

setup('authenticate admin', async ({ page }) => {
  // Redirect to /login since no logged-in user yet
  await page.goto('/');
  await expect(page).toHaveURL('/login');

  // Log-in

  // Email
  const emailInput = page.getByRole('textbox', { name: 'Email' });
  await expect(emailInput).toBeEmpty();
  await expect(emailInput).toBeEditable();
  await emailInput.fill('admin@up.edu.ph');

  // Password
  const pwInput = await page.getByRole('textbox', { name: 'Password' });
  await expect(pwInput).toBeEmpty();
  await expect(pwInput).toBeEditable();
  await pwInput.fill('password');
  await pwInput.press('Enter');

  // Redirected to main page
  await expect(page).toHaveURL('');

  // Will redirect to main page since logged-in user
  await page.goto('/login');
  await expect(page).toHaveURL('/');

  // Save auth state
  await page.context().storageState({ path: authFile });
});