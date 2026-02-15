import dotenv from 'dotenv';
import { expect, test } from '@playwright/test';
dotenv.config({ path: '.env.e2e' });

/*

NOTE:

test cases not yet made for:
auth login
accs with invalid roles (that shouldn't be possible i think)

*/

const validAcc = process.env.IT_EMAIL!;

const emailFail = 'Invalid email.';
const emptyPassFail = 'Empty password.';
const genericFail = 'Invalid email or password'; //for some reason this lacks a period

test.describe('invalid login cases', () => {
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

        // Await fail route and expect appropriate fail message
        await expect(page).toHaveURL('/login?/signInEmail');
        await expect(page.getByText(emailFail, { exact: true })).toBeVisible();
    });
    test('empty password', async ({ page }) => {
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
        // Note the lack of fill()
        await pwInput.press('Enter');

        // Await fail route and expect appropriate fail message
        await expect(page).toHaveURL('/login?/signInEmail');
        await expect(page.getByText(emptyPassFail, { exact: true })).toBeVisible();
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

        // Await fail route and expect appropriate fail message
        await expect(page).toHaveURL('/login?/signInEmail');
        await expect(page.getByText(genericFail, { exact: true })).toBeVisible();
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

        // Await fail route and expect appropriate fail message
        await expect(page).toHaveURL('/login?/signInEmail');
        await expect(page.getByText(genericFail, { exact: true })).toBeVisible();
    });
});
