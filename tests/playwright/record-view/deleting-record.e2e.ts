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


test.describe('deleting individual record', async() => {
    test.use({storageState: consts.ITConfig});

    test('cancelled deletion', async({page}) => {
        const recordFile = page.getByRole('button', {name: consts.expectedFacultyName, exact:true});

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
        const recordFile = page.getByRole('button', {name: consts.expectedFacultyName, exact:true});

        await expect(recordFile).toBeVisible();
        await recordFile.click();
  
        const deleteButton = page.getByRole('button', {name: 'Delete Record', exact: true});

        await deleteButton.click();
        await page.getByText('Delete').click()

        await expect(page).toHaveURL('/') // redirected back
        await expect(page.getByText(consts.expectedFacultyName)).not.toBeVisible();
    });
});