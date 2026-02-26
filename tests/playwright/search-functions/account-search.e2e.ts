import {expect, test} from '@playwright/test';
import * as consts from '../../test-consts';

test.describe('account search functions', async() => {
    //search from the other account as both accounts

    test.describe('account search pt. 1', async () => {
        test.use({storageState: consts.ITConfig});

        test('searching for other test acc', async ({page}) => {
            const searchBar = page.getByRole('textbox', {name:'Search', exact:true});
            const searchButton = page.getByRole('button', {name:'Search', exact:true});

            searchBar.fill('aDm');
            await searchButton.click();

            await expect(page.getByText(consts.AdminAcc)).toBeVisible();
        });
    });

    test.describe('account search pt. 2', async () => {
        test.use({storageState: consts.AdminConfig});

        test('searching for other test acc', async ({page}) => {
            const searchBar = page.getByRole('textbox', {name:'Search', exact:true});
            const searchButton = page.getByRole('button', {name:'Search', exact:true});

            searchBar.fill('it');
            await searchButton.click();

            await expect(page.getByText(consts.ITAcc)).toBeVisible();
        });
    });

    test('invalid search', async({page}) => {
        test.use({storageState: consts.ITConfig});
    })
});