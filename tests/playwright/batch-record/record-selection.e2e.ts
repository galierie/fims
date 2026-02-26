import { expect, test } from '@playwright/test';

 

test.describe("batch record deletion", async() => {
    test.use({storageState: 'playwright/.auth/admin.json'})
})