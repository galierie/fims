import { test, expect } from "@playwright/test"

const FAIL_ROUTE = "/login?/signInEmail"

test('successful login as it', async ({ page }) => {
    await page.goto("/login");

    await expect(page.locator("#email")).toBeVisible()
    await expect(page.locator("#password")).toBeVisible()

    await page.locator("#email").fill("testacc@up.edu.ph")
    await page.locator("#password").fill("password")
    await page.locator("#password").press("Enter")

    await expect(page).not.toHaveURL(FAIL_ROUTE);
    await expect(page.locator(".text-fims-red")).toBeVisible;
});

test('successful login as admin', async ({ page }) => {
    await page.goto("/login");

    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();

    await page.locator("#email").fill("testadmin@up.edu.ph")
    await page.locator("#password").fill("adminpass")
    await page.locator("#password").press("Enter")

    await expect(page).not.toHaveURL(FAIL_ROUTE);
    await expect(page.locator(".text-fims-green")).toBeVisible;
});

test('failed login', async ({page}) => {
    await page.goto("/login");
    await expect(page.locator("#email")).toBeVisible()
    await expect(page.locator("#password")).toBeVisible()

    await page.locator("#email").fill("testacc@up.edu.ph")
    await page.locator("#password").fill("wrongpassword")
    await page.locator("#password").press("Enter")

    await expect(page).toHaveURL(FAIL_ROUTE);

    //change this expect when the warning has an id
    await expect(page.locator("p.px-8")).toHaveText("Invalid email or password")
});

test('attempt to view account as IT (or with account perms)', async ({page}) => {
    await page.goto("/login");

    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();

    await page.locator("#email").fill("testadmin@up.edu.ph")
    await page.locator("#password").fill("adminpass")
    await page.locator("#password").press("Enter")

    await expect(page).not.toHaveURL(FAIL_ROUTE);
    await expect(page.locator(".text-fims-green")).toBeVisible;

    await page.getByText("Accounts").click()
    expect(page.getByText("404")).not.toBeVisible;
})

test('attempt to view account as admin (or without account perm)', async ({page}) => {
    await page.goto("/login");

    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();

    await page.locator("#email").fill("testadmin@up.edu.ph")
    await page.locator("#password").fill("adminpass")
    await page.locator("#password").press("Enter")

    await expect(page).not.toHaveURL(FAIL_ROUTE);
    await expect(page.locator(".text-fims-green")).toBeVisible;

    await page.getByText("Accounts").click()
    expect(page.getByText("404")).toBeVisible;
})