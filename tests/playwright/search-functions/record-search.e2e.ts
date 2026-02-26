import {expect, test} from "@playwright/test"
import * as consts from '../../test-consts'

test.describe('searching records', async() => {
    test.use({storageState: consts.ITConfig});


    //name of one specific test record is unique enough
    //for these two test
    test('search for incomplete last name', async({page}) => {
        const searchBar = page.getByRole('textbox', {name:'Search', exact:true});
        const searchButton = page.getByRole('button', {name:'Search', exact:true});

        await searchBar.fill('eLa C'); //should test case sensitivity
        await searchButton.click();

        await expect(page.getByText('Doe, Alan')).not.toBeVisible();
        await expect(page.getByText('Dela Cruz, Juan')).toBeVisible();
    });
    test('search for incomplete first name', async({page}) => {
        
    });


    //filter by status
    test('filter by status', async({page}) => {
        const statusFilter = page.getByRole('button', {name:'Status:', exact:true}) 
        
        await statusFilter.click();

        for (let val of consts.expectedStatuses) {
            await page.getByRole('button', {name:val}).click() //enable filter

            for (let check of consts.expectedStatuses) {
                if (check === val) { //expected to find
                    await expect(page.getByText(check).first()).toBeVisible();
                } else { //not expected to find
                    await expect(page.getByText(check).first()).not.toBeVisible();
                }
            }

            await page.getByRole('button', {name:val}).click() //disable filter
        }
    });

    //TODO: filter by rank
    // test still doesn't work as ranks haven't been seeded yet
})