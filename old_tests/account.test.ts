import { expect, test, beforeAll, vi, afterAll } from "vitest"
import * as AccountDAO from "../src/lib/server/accountDAO"
import { db } from "$lib/server/db"
import { appuser } from "$lib/server/db/auth.schema"
import { createAuthClient } from "better-auth/svelte"
import { adminClient } from "better-auth/client/plugins"
import { withNeonTestBranch } from "./backend/test-setup"

withNeonTestBranch();

const TEST_ACC_EMAIL = "__vitest@up.edu.ph"
const AUTH_CLIENT = await createAuthClient({
    plugins: [
        adminClient()
    ]
})

let testID:string

beforeAll(async () => {
    // check if there is already an existing vitest account
    let testAccID:string|null = null

    let accList = await db
    .select({
        id: appuser.id,
        email: appuser.email
    }).from(appuser)

    if (accList.length > 0) {
        let fetchedAcc = accList.find((e) => {e.email ==  TEST_ACC_EMAIL});
        if (fetchedAcc) {
           testAccID = fetchedAcc.id 
        }
    }
 
    if (testAccID) {
        // delete current test account before moving on
        await AUTH_CLIENT.admin.removeUser({userId: testAccID});
    }

    //create test account in order
    let testUser = await AUTH_CLIENT.admin.createUser({
        email: TEST_ACC_EMAIL,
        password: "password",
        name: "Vitest Acc",
    });
    testID = testUser.data!.user.id
})

afterAll(async () => {
    await AUTH_CLIENT.admin.removeUser({userId: testID})
})

//very weak test case atm
test("account listing", async () => {
    let accounts = await AccountDAO.listAll()
    expect(accounts.length).toBeGreaterThan(0)
    expect(accounts.find((elem) => {elem.accountId == testID})).not.toBe([]); //find test account
});

test("account creation and deletion", async () => {
});
