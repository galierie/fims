import {expect, test} from '@playwright/test';
import * as testConsts from '../../../test-consts';
const dummyEmail = process.env.DUMMY_EMAIL!;
const dummyEmail1 = process.env.DUMMY_EMAIL1!;
const dummyEmail2 = process.env.DUMMY_EMAIL2!;
const dummyPw = process.env.DUMMY_PASS!;


test.describe('batch creation of accounts', () => {
    test.use({storageState: testConsts.ITConfig});
    test.describe.configure({mode:'parallel'});

    test('make zeroth account', async ({ page }) => {
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

    test('make first account', async ({ page }) => {
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
        await emailInput.fill(dummyEmail1);

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
        const cell = page.getByText(dummyEmail1);
        await expect(cell).toBeVisible();
    });

    test('make second account', async ({ page }) => {
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
        await emailInput.fill(dummyEmail2);

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
        const cell = page.getByText(dummyEmail2);
        await expect(cell).toBeVisible();
    });
});