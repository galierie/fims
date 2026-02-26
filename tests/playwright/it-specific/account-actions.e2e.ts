import { expect, test } from '@playwright/test';

test.use({ storageState: 'playwright/.auth/it.json' });

// NOTE: Account type is 'Admin'

const dummyEmail = process.env.DUMMY_EMAIL!;
const dummyPw = process.env.DUMMY_PASS!;

const dummyEmail1 = process.env.DUMMY_EMAIL1!;
const dummyEmail2 = process.env.DUMMY_EMAIL2!;

test.describe('add account', () => {
    test.describe('unsuccessful', () => {
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

        // The new email should be visible
        const cell = page.getByText(dummyEmail);
        await expect(cell).toBeVisible();
    });
});

test.describe('delete account', () => {
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
        await page.getByRole('button', { name: 'Delete', exact: true }).last().click();

        // The new email should no longer be visible
        const cell = page.getByText(dummyEmail);
        await expect(cell).not.toBeVisible();
    });
});

test.describe('batch delete accounts', () => {
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

        // The new email should be visible
        const cell = page.getByText(dummyEmail2);
        await expect(cell).toBeVisible();
    });

    test('search for a dummy account', async ({ page }) => {
        await page.goto('/accounts');
        await expect(page).toHaveURL('/accounts');

        const searchBar = page.getByRole('textbox', { name: 'Search', exact: true });
        const searchButton = page.getByRole('button', { name: 'Search', exact: true });

        await expect(searchBar).toBeVisible();
        await expect(searchButton).toBeVisible();

        // Search for the dummy
        await searchBar.fill(dummyEmail);
        await searchButton.click();

        // Expect that only the searched dummy is visible
        await expect(page.getByText(process.env.ADMIN_EMAIL!)).toBeVisible();
        await expect(page.getByText(dummyEmail)).toBeVisible();
        await expect(page.getByText(dummyEmail1)).toBeVisible();
        await expect(page.getByText(dummyEmail2)).toBeVisible();
    });

    test('no accounts searched', async ({ page }) => {
        await page.goto('/accounts');
        await expect(page).toHaveURL('/accounts');

        const searchBar = page.getByRole('textbox', { name: 'Search', exact: true });
        const searchButton = page.getByRole('button', { name: 'Search', exact: true });

        await expect(searchBar).toBeVisible();
        await expect(searchButton).toBeVisible();

        // Ensure no accounts will be searched
        await searchBar.fill('random nonsense');
        await searchButton.click();

        // Expect that no accounts are visible
        await expect(page.getByText(process.env.ADMIN_EMAIL!)).toBeVisible();
        await expect(page.getByText(dummyEmail)).toBeVisible();
        await expect(page.getByText(dummyEmail1)).toBeVisible();
        await expect(page.getByText(dummyEmail2)).toBeVisible();
    });

    test('filter', async ({ page }) => {
        // No redirection since user is logged-in
        page.goto('/accounts');
        await expect(page).toHaveURL('/accounts');

        // Expect all dummies are visible
        const adminCell = page.getByText(process.env.ADMIN_EMAIL!);
        await expect(adminCell).toBeVisible();

        const cell = page.getByText(dummyEmail);
        await expect(cell).toBeVisible();

        const cell1 = page.getByText(dummyEmail1);
        await expect(cell1).toBeVisible();

        const cell2 = page.getByText(dummyEmail2);
        await expect(cell2).toBeVisible();

        // Select role filter
        await page.getByRole('button', { name: 'Role' }).first().click();
        await page.getByRole('button', { name: 'IT' }).first().click();
        await page.getByRole('button', { name: 'Role' }).first().click();

        // Expect all dummies except for admin are visible
        await expect(adminCell).not.toBeVisible();
        await expect(cell).toBeVisible();
        await expect(cell1).toBeVisible();
        await expect(cell2).toBeVisible();

        // Unselect role filter
        await page.getByRole('button', { name: 'Role' }).first().click();
        await page.getByRole('button', { name: 'IT' }).nth(1).click();
        await page.getByRole('button', { name: 'Role' }).first().click();

        // Expect all dummies are visible
        await expect(adminCell).toBeVisible();
        await expect(cell).toBeVisible();
        await expect(cell1).toBeVisible();
        await expect(cell2).toBeVisible();
    });

    test('check selection', async ({ page }) => {
        // No redirection since user is logged-in
        page.goto('/accounts');
        await expect(page).toHaveURL('/accounts');

        // Select an account
        const checkbox1 = await page.getByRole('checkbox').first();
        await expect(checkbox1).not.toBeChecked();
        await checkbox1.check();
        await expect(checkbox1).toBeChecked();

        // See if the buttons are showing
        const selectAllBtn = await page.getByRole('button', { name: 'Select All', exact: true });
        await expect(selectAllBtn).toBeVisible();

        const deselectSelectionBtn = await page.getByRole('button', {
            name: 'Deselect Selection',
            exact: true,
        });
        await expect(deselectSelectionBtn).toBeVisible();

        const deleteRecordsBtn = await page.getByRole('button', {
            name: 'Delete Account',
            exact: true,
        });
        await expect(deleteRecordsBtn).toBeVisible();

        // Select All
        await selectAllBtn.click();

        const checkbox2 = await page.getByRole('checkbox').nth(1);
        await expect(checkbox2).toBeChecked();

        const checkbox3 = await page.getByRole('checkbox').nth(2);
        await expect(checkbox3).toBeChecked();

        const checkbox4 = await page.getByRole('checkbox').nth(3);
        await expect(checkbox4).toBeChecked();

        // Unselect one checkbox
        await checkbox1.click();
        await expect(checkbox1).not.toBeChecked();

        // Deselect Selection
        await deselectSelectionBtn.click();
        await expect(checkbox1).not.toBeChecked();
        await expect(checkbox2).not.toBeChecked();
        await expect(checkbox3).not.toBeChecked();
        await expect(checkbox4).not.toBeChecked();

        await expect(selectAllBtn).not.toBeVisible();
        await expect(deselectSelectionBtn).not.toBeVisible();
        await expect(deleteRecordsBtn).not.toBeVisible();
    });

    test('cancelled deletion', async ({ page }) => {
        // No redirection since user is logged-in
        page.goto('/accounts');
        await expect(page).toHaveURL('/accounts');

        // Select Accounts
        const checkbox1 = await page.getByRole('checkbox').first();
        await expect(checkbox1).not.toBeChecked();
        await checkbox1.check();
        await expect(checkbox1).toBeChecked();

        const selectAllBtn = await page.getByRole('button', { name: 'Select All', exact: true });
        await expect(selectAllBtn).toBeVisible();
        await selectAllBtn.click();

        const checkbox2 = await page.getByRole('checkbox').nth(1);
        await expect(checkbox2).toBeChecked();

        const checkbox3 = await page.getByRole('checkbox').nth(2);
        await expect(checkbox3).toBeChecked();

        const checkbox4 = await page.getByRole('checkbox').nth(3);
        await expect(checkbox4).toBeChecked();

        await checkbox1.click();
        await expect(checkbox1).not.toBeChecked();

        // Delete Accounts
        const deleteRecordsBtn = await page.getByRole('button', {
            name: 'Delete Accounts',
            exact: true,
        });
        expect(deleteRecordsBtn).toBeVisible();
        await deleteRecordsBtn.click();

        // Don't confirm
        await page.getByRole('button', { name: 'Cancel', exact: true }).click();

        // The new records should still be visible
        const cell = page.getByText(process.env.ADMIN_EMAIL!);
        await expect(cell).toBeVisible();

        const cell1 = page.getByText(dummyEmail);
        await expect(cell1).toBeVisible();

        const cell2 = page.getByText(dummyEmail1);
        await expect(cell2).toBeVisible();

        const cell3 = page.getByText(dummyEmail2);
        await expect(cell3).toBeVisible();

        // Deselect Selection
        const deselectSelectionBtn = await page.getByRole('button', {
            name: 'Deselect Selection',
            exact: true,
        });
        await expect(deselectSelectionBtn).toBeVisible();

        await deselectSelectionBtn.click();
        await expect(checkbox1).not.toBeChecked();
        await expect(checkbox2).not.toBeChecked();
        await expect(checkbox3).not.toBeChecked();
        await expect(checkbox4).not.toBeChecked();

        await expect(selectAllBtn).not.toBeVisible();
        await expect(deselectSelectionBtn).not.toBeVisible();
        await expect(deleteRecordsBtn).not.toBeVisible();
    });

    test('deleted', async ({ page }) => {
        // No redirection since user is logged-in
        page.goto('/accounts');
        await expect(page).toHaveURL('/accounts');

        // Select Accounts
        const checkbox1 = await page.getByRole('checkbox').first();
        await expect(checkbox1).not.toBeChecked();
        await checkbox1.check();
        await expect(checkbox1).toBeChecked();

        const selectAllBtn = await page.getByRole('button', { name: 'Select All', exact: true });
        await expect(selectAllBtn).toBeVisible();
        await selectAllBtn.click();

        const checkbox2 = await page.getByRole('checkbox').nth(1);
        await expect(checkbox2).toBeChecked();

        const checkbox3 = await page.getByRole('checkbox').nth(2);
        await expect(checkbox3).toBeChecked();

        const checkbox4 = await page.getByRole('checkbox').nth(3);
        await expect(checkbox4).toBeChecked();

        await checkbox1.click();
        await expect(checkbox1).not.toBeChecked();

        const cell = page.getByText(process.env.ADMIN_EMAIL!);
        const cell1 = page.getByText(dummyEmail);
        const cell2 = page.getByText(dummyEmail1);
        const cell3 = page.getByText(dummyEmail2);

        // Delete Accounts
        const deleteRecordsBtn = await page.getByRole('button', {
            name: 'Delete Accounts',
            exact: true,
        });
        await expect(deleteRecordsBtn).toBeVisible();
        await deleteRecordsBtn.click();

        // Confirm
        await page.getByRole('button', { name: 'Delete', exact: true }).last().click();

        // The new records should not be visible
        await expect(cell).toBeVisible();
        await expect(cell1).not.toBeVisible();
        await expect(cell2).not.toBeVisible();
        await expect(cell3).not.toBeVisible();
    });
});
