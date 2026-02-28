import {expect, test} from '@playwright/test';
import * as testConsts from '../../../test-consts'
const dummyEmail = process.env.DUMMY_EMAIL!;
const dummyEmail1 = process.env.DUMMY_EMAIL1!;
const dummyEmail2 = process.env.DUMMY_EMAIL2!;
const dummyPw = process.env.DUMMY_PASS!;

test.describe('search functions', () => {
    test.use({storageState: testConsts.ITConfig});
    test.describe.configure({mode: 'parallel'});

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
});