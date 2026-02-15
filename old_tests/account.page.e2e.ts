import { expect, test } from "@playwright/test"

const TEST_ACC_EMAIL = "testacc@up.edu.ph"; //must have an it acocunt that has acocunt editing/viewing permissions
const TEST_ACC_PASS = "password";

const NON_IT_TEST_EMAIL = "testadmin@up.edu.ph";
const NON_IT_TEST_PASS = "adminpass"

const NEW_TEST_EMAIL = "newemail@up.edu.ph";
const NEW_TEST_PASSWORD = "newpass";

const FAIL_ROUTE = "/login?/signInEmail"

let newTestID;

// note:
// if possible, please assign ids to svelte pages
// as changing the text of buttons rn will make these
// tests fail

test("viewing accounts as IT", async ({page}) => {
    await page.goto("/login");

    await page.locator("#email").fill(TEST_ACC_EMAIL);
    await page.locator("#password").fill(TEST_ACC_PASS);
    await page.locator("#password").press("Enter")

    await page.getByText("Accounts").click()

    //not sure but i can't find a specific id for the account div, so i'm basing it off the first col name
    //this locator locates the parents twice up
    //failure should be caused by timeout as it can't find it
    await expect(page.getByText("Select").locator("..").locator("..")).not.toBeEmpty();
    await expect(page.getByText("testadmin@up.edu.ph")).toBeVisible(); //should check the other account
})

// note:
// as of now, you HAVE to delete the newly created account
// defined in NEW_TEST_EMAIL
// every attempt at getting db to do it results in some error

test("adding accounts as IT", async ({page}) => {
    try {
        //account creation
        await page.goto("/login");

        await page.locator("#email").fill(TEST_ACC_EMAIL);
        await page.locator("#password").fill(TEST_ACC_PASS);
        await page.locator("#password").press("Enter");

        await page.getByText("Accounts").click();

        await page.getByText("+ Add Account").click();

        await page.locator("#new-acc-email").fill(NEW_TEST_EMAIL);
        await page.locator("#new-acc-password").fill(NEW_TEST_PASSWORD);
        await page.locator("#new-acc-role").selectOption("IT");
        await page.getByText("+ Save Account").click();
        await page.locator("#save-confirm").click();
        await expect(page.getByText(NEW_TEST_EMAIL)).toBeVisible();

        //attempt login
        await page.getByText("Log-out").click();
        await page.waitForURL("/login");
        
        await page.locator("#email").fill(NEW_TEST_EMAIL);
        await page.locator("#password").fill(NEW_TEST_PASSWORD);
        await page.locator("#password").press("Enter");

        await expect(page).not.toHaveURL(FAIL_ROUTE);
    } finally {
    }
});

test("deleting accounts as IT", async ({page}) => {

})


test("attempt to do anything account related as non-IT", async ({page}) => {
    await page.goto("/login");

    await page.locator("#email").fill(NON_IT_TEST_EMAIL);
    await page.locator("#password").fill(NON_IT_TEST_PASS);
    await page.locator("#password").press("Enter");

    await page.getByText("Accounts").click();

    await expect(page.getByText("404")).toBeVisible();
});