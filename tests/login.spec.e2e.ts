import { test, expect } from "@playwright/test"

test('successful login', async ({ page }) => {
    await page.goto("/login");

    await expect(page.locator("#email")).toBeVisible()
    await expect(page.locator("#password")).toBeVisible()

    await page.locator("#email").fill("testacc@up.edu.ph")
    await page.locator("#password").fill("password")
    await page.locator("#password").press("Enter")

    await expect(page).toHaveURL("/");
});
