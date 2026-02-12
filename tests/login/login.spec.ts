import { test, expect } from "@playwright/test"

test('successful login', async ({ page }) => {
    page.goto("/login");
    
});
