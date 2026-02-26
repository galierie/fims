import {expect, test} from "@playwright/test"
import * as consts from '../../test-consts'

test.describe('searching records', async() => {
    test.use({storageState: consts.ITConfig});


    //name of one specific test record is unique enough
    //for these two test
    test('search for incomplete last name', async({page}) => {
        await page.goto('/');
        await expect(page).toHaveURL('/');

        const searchBar = page.getByRole('textbox', {name:'Search', exact:true});
        const searchButton = page.getByRole('button', {name:'Search', exact:true});

        await expect(searchBar).toBeVisible()
        await expect(searchButton).toBeVisible()

        await searchBar.fill('eLa C'); //should test case sensitivity
        await searchButton.click();

        await expect(page.getByText('Doe, Alan')).not.toBeVisible();
        await expect(page.getByText('Dela Cruz, Juan')).toBeVisible();
    });
    test('search for incomplete first name', async({page}) => {
        await page.goto('/');
        await expect(page).toHaveURL('/');

        const searchBar = page.getByRole('textbox', {name:'Search', exact:true});
        const searchButton = page.getByRole('button', {name:'Search', exact:true});

        await expect(searchBar).toBeVisible()
        await expect(searchButton).toBeVisible()

        await searchBar.fill('uAn'); //should test case sensitivity
        await searchButton.click();

        await expect(page.getByText('Doe, Alan')).not.toBeVisible();
        await expect(page.getByText('Dela Cruz, Juan')).toBeVisible();
        
    });


    /*
    //filter by status
    test('filter by status', async({page}) => {
        await page.goto('/');
        await expect(page).toHaveURL('/');

        const statusFilter = page.getByRole('button', {name:'Status: All', exact:true}) 
    
        await expect(statusFilter).toBeVisible();
        await statusFilter.click();

        for (let val of consts.expectedStatuses) {
            await page.getByRole('button', {name:val}).click() //enable filter
            console.log(`filtering by ${val}`);

            for (let check of consts.expectedStatuses) {
                console.log(`checking by ${check}`);
                if (check === val) { //expected to find
                    expect((await page.getByText(check).all()).length === 1).toBeFalsy(); //both dropdown and faculty record
                } else { //not expected to find
                    expect((await page.getByText(check).all()).length === 1).toBeTruthy(); //only dropdown
                }
            }

            await page.getByRole('button', {name:val}).click() //disable filter
        }
    });

    */

    //TODO: filter by rank
    // test still doesn't work as facultyrank hasn't been seeded yet
    // but if implemented, acts exactly the same as filter by status
})