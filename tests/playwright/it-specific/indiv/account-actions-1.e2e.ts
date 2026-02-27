import { expect, test } from '@playwright/test';
import * as testConsts from '../../../test-consts';

test.use({ storageState: 'playwright/.auth/it.json' });

// NOTE: Account type is 'Admin'

const dummyEmail = process.env.DUMMY_EMAIL!;
const dummyPw = process.env.DUMMY_PASS!;

const dummyEmail1 = process.env.DUMMY_EMAIL1!;
const dummyEmail2 = process.env.DUMMY_EMAIL2!;

test.describe('unsuccessful adding of accounts', () => {
    test.use({storageState: testConsts.ITConfig});
    test.describe.configure({mode:'parallel'});

    test('no email', async ({ page }) => {
        // No redirection since user is logged-in
        page.goto('/accounts');
        await expect(page).toHaveURL('/accounts');

        // Add Account
        await page.getByRole('button', { name: '+ Add Account', exact: true }).click();

        // No input

        // Save Account
        await page.getByRole('button', { name: 'Save', exact: true }).click();

        // Confirm
        await page.getByRole('button', { name: 'Save', exact: true }).last().click();

        // Check message
        await expect(page.getByText('Invalid email.')).toBeVisible();
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

        // Save Account
        await page.getByRole('button', { name: 'Save', exact: true }).click();

        // Confirm
        await page.getByRole('button', { name: 'Save', exact: true }).last().click();

        // Check message
        const afterMessage = await page.getByText('Invalid email.');
        await expect(afterMessage).toBeVisible();
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
        const pwInput = await page.getByRole('textbox', {
            name: 'Set initial password',
            exact: true,
        });
        await expect(pwInput).toBeEmpty();
        await expect(pwInput).toBeEditable();
        await pwInput.fill(dummyPw);

        // Save Account
        await page.getByRole('button', { name: 'Save', exact: true }).click();

        // Don't confirm
        await page.getByRole('button', { name: 'Cancel', exact: true }).click();

        // The new email should not be visible
        await expect(page.getByText(dummyEmail)).not.toBeVisible();
    });
});

test.describe('add account', () => {
    test.use({storageState: testConsts.ITConfig});
    test.describe('unsuccessful', () => {
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
        const pwInput = await page.getByRole('textbox', {
            name: 'Set initial password',
            exact: true,
        });
        await expect(pwInput).toBeEmpty();
        await expect(pwInput).toBeEditable();
        await pwInput.fill(dummyPw);

        // Save Account
        await page.getByRole('button', { name: 'Save', exact: true }).click();

        // Confirm
        await page.getByRole('button', { name: 'Save', exact: true }).last().click();

        // Check message
        const afterMakeMessage = await page.getByText('Created account.');
        await expect(afterMakeMessage).toBeVisible();

        // The new email should be visible
        const cell = page.getByText(dummyEmail);
        await expect(cell).toBeVisible();
    });
});

test.describe('delete account', () => {
    test.use({storageState: testConsts.ITConfig});
    test('cancelled', async ({ page }) => {
        // No redirection since user is logged-in
        page.goto('/accounts');
        await expect(page).toHaveURL('/accounts');

        // Delete Account
        await page
            .getByRole('button', { name: 'Delete', exact: true })
            .nth(0) // admin@up.edu.ph is at the first row
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
        /*
        await page
            .getByRole('button', { name: 'Delete', exact: true })
            .nth(0) // admin@up.edu.ph is at the first row
            .click();
        */
        const correctRow = page.getByTestId('account-row').filter({hasText: dummyEmail});
        await correctRow.getByRole('button', { name: 'Delete', exact: true }).first().click() //apparently it returns both first and

        // Confirm
        // keeps on failing, so i just made use of the fact there's only one cancel button during this state
        await page.getByRole('button', { name: 'Cancel', exact: true })
            .locator('..')
            .getByRole('button', {name: 'Delete'}).click();

        // Check message
        const afterDeleteMessage = await page.getByText('Deleted account.');
        await expect(afterDeleteMessage).toBeVisible();

        // The new email should no longer be visible
        const cell = page.getByText(dummyEmail);
        await expect(cell).not.toBeVisible();
    });
});