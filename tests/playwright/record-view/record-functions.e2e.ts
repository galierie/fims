import {expect, test} from '@playwright/test';
import * as consts from '../../test-consts';

// seed in case of deleted records
test.beforeAll(async() => {
    await consts.seed();
});

//seed back the deleted record(s)
test.afterAll(async() => {
    await consts.seed();
});

test.describe('viewing individual records', async() => {
    test.use({storageState: consts.ITConfig});

    test('viewing expected record', async({page}) => {
        await page.goto('/');

        const recordEntry = page.getByText(consts.expectedFacultyName).locator('..');
        await expect(recordEntry).toBeVisible()
        await recordEntry.click();
        
        await expect(page).toHaveURL(/faculty/); //in faculty route
        await expect(page.getByText(consts.expectedFacultyName)).toBeVisible(); //correct record is shown

        const backButton = page.getByRole('link', {name: 'Back to List of Faculty Records', exact:true});
        await backButton.click()

        await expect(page).toHaveURL('/');
        await expect(page.getByText(consts.expectedFacultyName)).toBeVisible();
    });

    test('cancelled deletion', async({page}) => {
        await page.goto('/');
        const recordFile = page.getByText(consts.expectedFacultyName).locator('..');

        await expect(recordFile).toBeVisible();
        await recordFile.click();
  
        const deleteButton = page.getByRole('button', {name: 'Delete Record', exact: true});

        await deleteButton.click();
        await page.getByText('Cancel').click()

        await expect(page).toHaveURL(/faculty/) //still in record view
        await expect(page.getByText(consts.expectedFacultyName)).toBeVisible();

        const backButton = page.getByRole('link', {name: 'Back to List of Faculty Records', exact:true});
        await backButton.click()

        await expect(page).toHaveURL('/');
        await expect(page.getByText(consts.expectedFacultyName)).toBeVisible();
    });

    test('confirmed deletion', async({page}) => {
        await page.goto('/');
        const recordFile = page.getByText(consts.expectedFacultyName).locator('..');

        await expect(recordFile).toBeVisible();
        await recordFile.click();
  
        const deleteButton = page.getByRole('button', {name: 'Delete Record', exact: true});
        await deleteButton.click();

        const deleteConfirm = page.getByRole('button', {name: 'Delete', exact:true});
        await expect(deleteConfirm).toBeVisible();
        await deleteConfirm.click();

        await expect(page).toHaveURL('/') // redirected back
        await expect(page.getByText(consts.expectedFacultyName)).not.toBeVisible();
    });
});