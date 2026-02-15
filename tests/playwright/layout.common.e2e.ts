import { expect, test } from '@playwright/test';

// NOTE: Log-out button will be checked in some other test
// TODO: Add first footer section

const itEmail = process.env.IT_EMAIL!;
const adminEmail = process.env.ADMIN_EMAIL!;

test.describe('check header and footer as admin', () => {
    test.use({ storageState: 'playwright/.auth/admin.json' });

    test('check header as admin', async ({ page }) => {
        // No redirection since user is logged-in
        page.goto('/');
        await expect(page).toHaveURL('/');

        // Get header
        const header = page.locator('header').first();

        // Check its elements

        const websiteTitle = await header.getByText('Faculty Information Management System');
        await expect(websiteTitle).toBeVisible();

        const loggedInEmail = await header.getByText(adminEmail);
        await expect(loggedInEmail).toBeVisible();
    });

    test('check footer as admin', async ({ page }) => {
        // No redirection since user is logged-in
        page.goto('/');
        await expect(page).toHaveURL('/');

        // Get footer
        const footer = page.locator('footer').first();

        // Check its elements

        const linksHeading = await footer.getByRole('heading', { name: 'Links' });
        await expect(linksHeading).toBeVisible();

        const contactsHeading = await footer.getByRole('heading', { name: 'Contacts' });
        await expect(contactsHeading).toBeVisible();
    });
});

test.describe('check header and footer as it', () => {
    test.use({ storageState: 'playwright/.auth/it.json' });

    test('check header as it', async ({ page }) => {
        // No redirection since user is logged-in
        page.goto('/');
        await expect(page).toHaveURL('/');

        // Get header
        const header = page.locator('header').first();

        // Check its elements

        const websiteTitle = await header.getByText('Faculty Information Management System');
        await expect(websiteTitle).toBeVisible();

        const loggedInEmail = await header.getByText(itEmail);
        await expect(loggedInEmail).toBeVisible();
    });

    test('check footer as it', async ({ page }) => {
        // No redirection since user is logged-in
        page.goto('/');
        await expect(page).toHaveURL('/');

        // Get footer
        const footer = page.locator('footer').first();

        // Check its elements

        const linksHeading = await footer.getByRole('heading', { name: 'Links' });
        await expect(linksHeading).toBeVisible();

        const contactsHeading = await footer.getByRole('heading', { name: 'Contacts' });
        await expect(contactsHeading).toBeVisible();
    });
});
