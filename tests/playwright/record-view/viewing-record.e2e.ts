import {expect, test} from '@playwright/test';
import * as consts from '../../test-consts';

test.describe('viewing individual records', async() => {
    test.use({storageState: consts.ITConfig});

    test('viewing expected record', async({page}) => {
        page.goto('/');

        const recordEntry = page.getByRole('button', {name:consts.expectedFacultyName, exact:true});
        await expect(page.getByText(consts.expectedFacultyName)).toBeVisible();
        await recordEntry.click();
        
        await expect(page).toHaveURL(/faculty/); //in faculty route
        await expect(page.getByText(consts.expectedFacultyName)).toBeVisible(); //correct record is shown

        const backButton = page.getByRole('link', {name: 'Back to List of Faculty Records', exact:true});
        await backButton.click()

        await expect(page).toHaveURL('/');
        await expect(page.getByText(consts.expectedFacultyName)).toBeVisible();
    });
});