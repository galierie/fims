import dotenv from 'dotenv';
import { expect, test } from '@playwright/test';

import * as consts from '../../test-consts';
dotenv.config({ path: '.env.e2e' });

/*

NOTE:

test cases not yet made for:
auth login (too complex)
accs with invalid roles (that shouldn't be possible i think)

*/

const validAcc = consts.ITAcc;

const emailFail = 'Invalid email.';
const genericFail = 'Invalid email or password'; //for some reason this lacks a period

test.describe('invalid login cases', async () => {
    test('non up email', async ({ page }) => {
        // Goto
        await page.goto('/');
        await expect(page).toHaveURL('/login');
        // Email
        const emailInput = page.getByRole('textbox', { name: 'Email' });
        await expect(emailInput).toBeEmpty();
        await expect(emailInput).toBeEditable();
        await emailInput.fill('email@athersite.com');

        // Password
        const pwInput = await page.getByRole('textbox', { name: 'Password' });
        await expect(pwInput).toBeEmpty();
        await expect(pwInput).toBeEditable();
        await pwInput.fill('password');
        await pwInput.press('Enter');

        //slightly change the order of the expects
        //wait for the warning
        //then check if the page is not the dashboard
        await expect(page.getByText(emailFail, { exact: true })).toBeVisible();
        await expect(page).toHaveURL('/login');
    });

    test('generic fail case', async ({ page }) => {
        // Goto
        await page.goto('/');
        await expect(page).toHaveURL('/login');
        // Email
        const emailInput = page.getByRole('textbox', { name: 'Email' });
        await expect(emailInput).toBeEmpty();
        await expect(emailInput).toBeEditable();
        await emailInput.fill('someacc@up.edu.ph');

        // Password
        const pwInput = await page.getByRole('textbox', { name: 'Password' });
        await expect(pwInput).toBeEmpty();
        await expect(pwInput).toBeEditable();
        await pwInput.fill('password');
        await pwInput.press('Enter');

        //slightly change the order of the expects
        //wait for the warning
        //then check if the page is still the login page
        await expect(page.getByText(genericFail, { exact: true })).toBeVisible();
        await expect(page).toHaveURL('/login');
    });

    test('already existing acc with invalid password', async ({ page }) => {
        // Goto
        await page.goto('/');
        await expect(page).toHaveURL('/login');
        // Email
        const emailInput = page.getByRole('textbox', { name: 'Email' });
        await expect(emailInput).toBeEmpty();
        await expect(emailInput).toBeEditable();
        await emailInput.fill(validAcc);

        // Password
        const pwInput = await page.getByRole('textbox', { name: 'Password' });
        await expect(pwInput).toBeEmpty();
        await expect(pwInput).toBeEditable();
        await pwInput.fill('wrongpassword');
        await pwInput.press('Enter');

        //slightly change the order of the expects
        //wait for the warning
        //then check if the page is still the login page
        await expect(page.getByText(genericFail, { exact: true })).toBeVisible();
        await expect(page).toHaveURL('/login');
    });
});
