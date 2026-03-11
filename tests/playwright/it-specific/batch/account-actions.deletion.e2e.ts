// not sure how to separate this
// so i just made it two files

import {expect, test} from '@playwright/test';
import * as testConsts from '../../../test-consts'
const dummyEmail = process.env.DUMMY_EMAIL!;
const dummyEmail1 = process.env.DUMMY_EMAIL1!;
const dummyEmail2 = process.env.DUMMY_EMAIL2!;
const dummyPw = process.env.DUMMY_PASS!;

test.describe('batch deletion', async() => {
    test.use({storageState: testConsts.ITConfig})
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

        // Check message
        const afterDeleteMessage = await page.getByText('Deleted accounts.');
        await expect(afterDeleteMessage).toBeVisible();

        // The new records should not be visible
        await expect(cell).toBeVisible();
        await expect(cell1).not.toBeVisible();
        await expect(cell2).not.toBeVisible();
        await expect(cell3).not.toBeVisible();
    });
});
