import { expect, test } from '@playwright/test';

import * as consts from '../../test-consts';

test.describe('searching records', async () => {
    test.use({ storageState: consts.ITConfig });

    //name of one specific test record is unique enough
    //for these two test
    await test('search for incomplete last name', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveURL('/');

        const searchBar = page.getByRole('textbox', { name: 'Search', exact: true });
        const searchButton = page.getByRole('button', { name: 'Search', exact: true });

        await expect(searchBar).toBeVisible();
        await expect(searchButton).toBeVisible();

        await searchBar.fill('eLa C'); //should test case sensitivity
        await searchButton.click();

        await expect(page.getByText('Doe, Alan')).not.toBeVisible();
        await expect(page.getByText('Dela Cruz, Juan')).toBeVisible();
    });

    await test('search for incomplete first name', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveURL('/');

        const searchBar = page.getByRole('textbox', { name: 'Search', exact: true });
        const searchButton = page.getByRole('button', { name: 'Search', exact: true });

        await expect(searchBar).toBeVisible();
        await expect(searchButton).toBeVisible();

        await searchBar.fill('uAn'); //should test case sensitivity
        await searchButton.click();

        await expect(page.getByText('Doe, Alan')).not.toBeVisible();
        await expect(page.getByText('Dela Cruz, Juan')).toBeVisible();
    });
});
