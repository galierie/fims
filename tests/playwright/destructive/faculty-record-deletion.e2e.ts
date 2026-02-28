import {expect, test} from '@playwright/test';
import * as testConsts from '../../test-consts';

//reset
test('re-seed 1', testConsts.seed);

test.describe('batch delete faculty records as it', () => {
    test.use({ storageState: 'playwright/.auth/it.json' }); 
    test.describe.configure({mode: 'serial'});

    test('cancelled viewed record deletion', async ({ page }) => {
        await page.goto('/');
        const recordFile = page.getByText('Mandario, Maricris').locator('..');

        await expect(recordFile).toBeVisible();
        await recordFile.click();

        const deleteButton = page.getByRole('button', { name: 'Delete Record', exact: true });

        await deleteButton.click();
        await page.getByText('Cancel').click();

        await expect(page).toHaveURL(/faculty/u); //still in record view
        await expect(page.getByText('Mandario, Maricris')).toBeVisible();

        const backButton = page.getByRole('link', {
            name: 'Back to List of Faculty Records',
            exact: true,
        });
        await backButton.click();

        await expect(page).toHaveURL('/');
        await expect(page.getByText('Mandario, Maricris')).toBeVisible();
    });

    test('confirmed viewed record deletion', async ({ page }) => {
        await page.goto('/');
        const recordFile = page.getByText('Mandario, Maricris').locator('..');

        await expect(recordFile).toBeVisible();
        await recordFile.click();

        const deleteButton = page.getByRole('button', { name: 'Delete Record', exact: true });
        await deleteButton.click();

        const deleteConfirm = page.getByRole('button', { name: 'Delete', exact: true });
        await expect(deleteConfirm).toBeVisible();
        await deleteConfirm.click();

        await expect(page).toHaveURL('/'); // redirected back
        await expect(page.getByText('Mandario, Maricris')).not.toBeVisible();
    });


    test('cancelled deletion', async ({ page }) => {
        // No redirection since user is logged-in
        page.goto('/');
        await expect(page).toHaveURL('/');

        // Select Faculty Records
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

        // Delete Faculty Records
        const deleteRecordsBtn = await page.getByRole('button', {
            name: 'Delete Records',
            exact: true,
        });
        await expect(deleteRecordsBtn).toBeVisible();
        await deleteRecordsBtn.click();

        // Don't confirm
        await page.getByRole('button', { name: 'Cancel', exact: true }).click();

        // The new records should still be visible
        const cell = page.getByText('Galinato, Eriene');
        await expect(cell).toBeVisible();

        const cell1 = page.getByText('Camingao, Ericsson Jake');
        await expect(cell1).toBeVisible();

        const cell2 = page.getByText('Dela Cruz, Gabrielle Zach');
        await expect(cell2).toBeVisible();

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

        await expect(selectAllBtn).not.toBeVisible();
        await expect(deselectSelectionBtn).not.toBeVisible();
        await expect(deleteRecordsBtn).not.toBeVisible();
    });

    test('deleted', async ({ page }) => {
        // No redirection since user is logged-in
        page.goto('/');
        await expect(page).toHaveURL('/');

        // Select Faculty Records
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

        const cell = page.getByText('Galinato, Eriene');
        const cell1 = page.getByText('Camingao, Ericsson Jake');
        const cell2 = page.getByText('Dela Cruz, Gabrielle Zach');

        // Delete Faculty Records
        const deleteRecordsBtn = await page.getByRole('button', {
            name: 'Delete Records',
            exact: true,
        });
        await expect(deleteRecordsBtn).toBeVisible();
        await deleteRecordsBtn.click();

        // Confirm
        await page.getByRole('button', { name: 'Delete', exact: true }).last().click();

        // Check message
        const afterDeleteMessage = await page.getByText('Deleted records.');
        await expect(afterDeleteMessage).toBeVisible();

        // The new records should still be visible
        await expect(cell).not.toBeVisible();
        await expect(cell1).not.toBeVisible();
        await expect(cell2).not.toBeVisible();
    });

});

//reset
test('re-seed 2', testConsts.seed);

test.describe('batch delete faculty records as admin', () => {
    test.use({ storageState: 'playwright/.auth/admin.json' }); 
    test.describe.configure({mode: 'serial'});

    test('cancelled viewed record deletion', async ({ page }) => {
        await page.goto('/');
        const recordFile = page.getByText('Mandario, Maricris').locator('..');

        await expect(recordFile).toBeVisible();
        await recordFile.click();

        const deleteButton = page.getByRole('button', { name: 'Delete Record', exact: true });

        await deleteButton.click();
        await page.getByText('Cancel').click();

        await expect(page).toHaveURL(/faculty/u); //still in record view
        await expect(page.getByText('Mandario, Maricris')).toBeVisible();

        const backButton = page.getByRole('link', {
            name: 'Back to List of Faculty Records',
            exact: true,
        });
        await backButton.click();

        await expect(page).toHaveURL('/');
        await expect(page.getByText('Mandario, Maricris')).toBeVisible();
    });

    test('confirmed viewed record deletion', async ({ page }) => {
        await page.goto('/');
        const recordFile = page.getByText('Mandario, Maricris').locator('..');

        await expect(recordFile).toBeVisible();
        await recordFile.click();

        const deleteButton = page.getByRole('button', { name: 'Delete Record', exact: true });
        await deleteButton.click();

        const deleteConfirm = page.getByRole('button', { name: 'Delete', exact: true });
        await expect(deleteConfirm).toBeVisible();
        await deleteConfirm.click();

        await expect(page).toHaveURL('/'); // redirected back
        await expect(page.getByText('Mandario, Maricris')).not.toBeVisible();
    });

    test('cancelled deletion', async ({ page }) => {
        // No redirection since user is logged-in
        page.goto('/');
        await expect(page).toHaveURL('/');

        // Select Faculty Records
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

        // Delete Faculty Records
        const deleteRecordsBtn = await page.getByRole('button', {
            name: 'Delete Records',
            exact: true,
        });
        await expect(deleteRecordsBtn).toBeVisible();
        await deleteRecordsBtn.click();

        // Don't confirm
        await page.getByRole('button', { name: 'Cancel', exact: true }).click();

        // The new records should still be visible
        const cell = page.getByText('Galinato, Eriene');
        await expect(cell).toBeVisible();

        const cell1 = page.getByText('Camingao, Ericsson Jake');
        await expect(cell1).toBeVisible();

        const cell2 = page.getByText('Dela Cruz, Gabrielle Zach');
        await expect(cell2).toBeVisible();

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

        await expect(selectAllBtn).not.toBeVisible();
        await expect(deselectSelectionBtn).not.toBeVisible();
        await expect(deleteRecordsBtn).not.toBeVisible();
    });

    test('deleted', async ({ page }) => {
        // No redirection since user is logged-in
        page.goto('/');
        await expect(page).toHaveURL('/');

        // Select Faculty Records
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

        const cell = page.getByText('Galinato, Eriene');
        const cell1 = page.getByText('Camingao, Ericsson Jake');
        const cell2 = page.getByText('Dela Cruz, Gabrielle Zach');

        // Delete Faculty Records
        const deleteRecordsBtn = await page.getByRole('button', {
            name: 'Delete Records',
            exact: true,
        });
        await expect(deleteRecordsBtn).toBeVisible();
        await deleteRecordsBtn.click();

        // Confirm
        await page.getByRole('button', { name: 'Delete', exact: true }).last().click();

        // Check message
        const afterDeleteMessage = await page.getByText('Deleted records.');
        await expect(afterDeleteMessage).toBeVisible();

        // The new records should still be visible
        await expect(cell).not.toBeVisible();
        await expect(cell1).not.toBeVisible();
        await expect(cell2).not.toBeVisible();
    });
});
