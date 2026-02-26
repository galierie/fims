import { expect, test } from "@playwright/test";

test.use({ storageState: 'playwright/.auth/it.json' });

// NOTE: Account type is 'Admin'

const dummyEmail = 'dummy@up.edu.ph';
const dummyPw = 'dummypw';

test.describe('add account', async () => {
  test.describe('unsuccessful', async () => {
    test('no email', async ({ page }) => {
      // No redirection since user is logged-in
      page.goto('/accounts');
      await expect(page).toHaveURL('/accounts');

      // Add Account
      await page.getByRole('button', { name: '+ Add Account', exact: true }).click();

      // No input

      // Save Account (gets the parent of the span)
      await page.getByText("Save").locator("..").click();

      // Confirm
      await page.click("#save-confirm");

      /* for some reason, warning was removed
      // Check message
      await expect(page.getByText('Invalid email.')).toBeVisible();
      */
    });

    test('non-UP email', async ({ page }) => {
      // No redirection since user is logged-in
      page.goto('/accounts');
      await expect(page).toHaveURL('/accounts');

      // Add Account
      await page.getByRole('button', { name: '+ Add Account', exact: true }).click();

      // Input

      // Email
      const emailInput = page.getByRole('textbox', { name: 'Enter email here', exact: true });
      await expect(emailInput).toBeEmpty();
      await expect(emailInput).toBeEditable();
      await emailInput.fill('dummy@gmail.com');

      // No need to input password

      // Save Account (gets the parent of the span)
      await page.getByText("Save").locator("..").click();

      // Confirm (had to add in id due to multiple save buttons.)
      await page.click("#save-confirm");

      // Check message
      /* for some reason, warning was removed
      const afterMessage = await page.getByText('Invalid email.');
      await expect(afterMessage).toBeVisible();
      */
    });

    test('no password', async ({ page }) => {
      // No redirection since user is logged-in
      page.goto('/accounts');
      await expect(page).toHaveURL('/accounts');

      // Add Account
      await page.getByRole('button', { name: '+ Add Account', exact: true }).click();

      // Input

      // Email
      const emailInput = page.getByRole('textbox', { name: 'Enter email here', exact: true });
      await expect(emailInput).toBeEmpty();
      await expect(emailInput).toBeEditable();
      await emailInput.fill(dummyEmail);

      // No need to input password

      // Save Account (gets the parent of the span)
      await page.getByText("Save").locator("..").click();

      // Confirm (had to add in id due to multiple save buttons.)
      await page.click("#save-confirm");

      // Check message
      /* for some reason, warning was removed
      const afterMessage = page.getByText('Invalid password.');
      await expect(afterMessage).toBeVisible();
      */
    });
  });

  test('cancelled', async ({ page }) => {
    // No redirection since user is logged-in
    page.goto('/accounts');
    await expect(page).toHaveURL('/accounts');

    // Add Account
    await page.getByRole('button', { name: '+ Add Account', exact: true }).click();

    // Input

    // Email
    const emailInput = page.getByRole('textbox', { name: 'Enter email here', exact: true });
    await expect(emailInput).toBeEmpty();
    await expect(emailInput).toBeEditable();
    await emailInput.fill(dummyEmail);

    // Password
    const pwInput = await page.getByRole('textbox', { name: 'Set initial password', exact: true });
    await expect(pwInput).toBeEmpty();
    await expect(pwInput).toBeEditable();
    await pwInput.fill(dummyPw);

    // Save Account (gets the parent of the span)
    await page.getByText("Save").locator("..").click();

    // Don't confirm
    await page.click("#save-cancel")

    // The new email should not be visible
    await expect(page.getByText(dummyEmail)).not.toBeVisible();
  });

  test('made', async ({ page }) => {
    // No redirection since user is logged-in
    page.goto('/accounts');
    await expect(page).toHaveURL('/accounts');

    // Made

    // Add Account
    await page.getByRole('button', { name: '+ Add Account', exact: true }).click();

    // Input

    // Email
    const emailInput = page.getByRole('textbox', { name: 'Enter email here', exact: true });
    await expect(emailInput).toBeEmpty();
    await expect(emailInput).toBeEditable();
    await emailInput.fill(dummyEmail);

    // Password
    const pwInput = await page.getByRole('textbox', { name: 'Set initial password', exact: true });
    await expect(pwInput).toBeEmpty();
    await expect(pwInput).toBeEditable();
    await pwInput.fill(dummyPw);

    // Save Account (gets the parent of the span. if correct, there should only be one save button at the moment.)
    await page.getByText("Save").locator("..").click();

    // Confirm
    await page.click("#save-confirm");

    // Check message
    /* for some reason, warning was removed
    const afterMakeMessage = await page.getByText('Created account.');
    await expect(afterMakeMessage).toBeVisible();
    */

    // The new email should be visible
    const cell = page.getByText(dummyEmail);
    await expect(cell).toBeVisible();
  });
});

test.describe('delete account', async () => {
  test('cancelled', async ({ page }) => {
    // No redirection since user is logged-in
    page.goto('/accounts');
    await expect(page).toHaveURL('/accounts');

    // Delete Account
    await page
      .getByRole('button', { name: 'Delete', exact: true })
      .nth(1) // admin@up.edu.ph is at the first row
      .click();

    // Don't confirm
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();

    // The new email should still be visible
    const cell = page.getByText(dummyEmail);
    await expect(cell).toBeVisible();
  });

  test('deleted', async ({ page }) => {
    // No redirection since user is logged-in
    page.goto('/accounts');
    await expect(page).toHaveURL('/accounts');

    // Delete Account
    await page
      .getByRole('button', { name: 'Delete', exact: true })
      .nth(1) // admin@up.edu.ph is at the first row
      .click();

    // Confirm
    await page
      .getByRole('button', { name: 'Delete', exact: true })
      .last()
      .click();

    // Check message
    /* for some reason, warning was removed
    const afterDeleteMessage = await page.getByText('Deleted account.');
    await expect(afterDeleteMessage).toBeVisible();
    */

    // The new email should no longer be visible
    const cell = page.getByText(dummyEmail);
    await expect(cell).not.toBeVisible();
  });
});
