import { expect, test } from '@playwright/test';

import * as consts from '../../test-consts';

test.describe('account search functions', async () => {
    //search from the other account as both accounts

    await test.describe('account search pt. 1', async () => {
        test.use({ storageState: consts.ITConfig });

        await test('searching for other test acc', async ({ page }) => {
            await page.goto('/accounts');
            await expect(page).toHaveURL('/accounts');

            const searchBar = page.getByRole('textbox', { name: 'Search', exact: true });
            const searchButton = page.getByRole('button', { name: 'Search', exact: true });

            await expect(searchBar).toBeVisible();
            await expect(searchButton).toBeVisible();

            await searchBar.fill('aDm');
            await searchButton.click();

            await expect(page.getByText(consts.AdminAcc)).toBeVisible();
        });

        await test('invalid search pt. 1', async ({ page }) => {
            await page.goto('/accounts');
            await expect(page).toHaveURL('/accounts');

            const searchBar = page.getByRole('textbox', { name: 'Search', exact: true });
            const searchButton = page.getByRole('button', { name: 'Search', exact: true });

            await expect(searchBar).toBeVisible();
            await expect(searchButton).toBeVisible();

            await searchBar.fill('random nonsense');
            await searchButton.click();

            await expect(page.getByText(consts.AdminAcc)).not.toBeVisible();
        });
    });

    await test.describe('account search pt. 2', async () => {
        test.use({ storageState: consts.AdminConfig });

        await test('searching for other test acc', async ({ page }) => {
            await page.goto('/accounts');
            await expect(page).toHaveURL('/accounts');

            const searchBar = page.getByRole('textbox', { name: 'Search', exact: true });
            const searchButton = page.getByRole('button', { name: 'Search', exact: true });

            await expect(searchBar).toBeVisible();
            await expect(searchButton).toBeVisible();

            await searchBar.fill('it');
            await searchButton.click();

            await expect(page.getByText(consts.ITAcc)).toBeVisible();
        });

        await test('invalid search pt. 2', async ({ page }) => {
            await page.goto('/accounts');
            await expect(page).toHaveURL('/accounts');

            const searchBar = page.getByRole('textbox', { name: 'Search', exact: true });
            const searchButton = page.getByRole('button', { name: 'Search', exact: true });

            await expect(searchBar).toBeVisible();
            await expect(searchButton).toBeVisible();

            await searchBar.fill('random nonsense');
            await searchButton.click();

            await expect(page.getByText(consts.ITAcc)).not.toBeVisible();
        });
    });
});
