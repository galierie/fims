import dotenv from 'dotenv';
import { defineConfig } from '@playwright/test';
dotenv.config({ path: '.env.e2e' }); //change this to desired .env file

export default defineConfig({
    webServer: {
        command: 'npm run build && npm run preview',
        port: 4173,
    },
    testDir: 'tests/playwright',
    outputDir: 'playwright-results',
    projects: [
        // invalid login tests
        {
            name: 'invalid-logins',
            testMatch: /.e2e.(?:js|ts)/u,
            testDir: 'tests/playwright/invalid-login',
            fullyParallel: true,
        },
        // login tests
        {
            name: 'admin-auth',
            testMatch: /admin-auth.setup.e2e.(?:js|ts)/u,
            dependencies: ['invalid-logins'],
            fullyParallel: true,
        },
        {
            name: 'it-auth',
            testMatch: /it-auth.setup.e2e.(?:js|ts)/u,
            dependencies: ['invalid-logins'],
            fullyParallel: true,
        },

        // common tests
        {
            name: 'common-tests',
            dependencies: ['admin-auth', 'it-auth', 'invalid-logins'],
            testMatch: /.common.e2e.(?:js|ts)/u,
            fullyParallel: false,
        },
        // common destructive tests, as they can't be easily parallelized due to deletions and stuff
        {
            name: 'common-destructive-tests',
            dependencies: ['common-tests'],
            testDir: 'tests/playwright/destructive',
            testMatch: /.e2e.(?:js|ts)/u,
        },

        // i am not exacly sure how to parallelize them without some race condition ocurring
        // so i just made them two separate files and used test.describe to specifically say which ones
        // are parallel
        {
            name: 'it-specific-tests-indiv',
            dependencies: ['common-tests', 'common-destructive-tests', 'it-auth'],
            testDir: 'tests/playwright/it-specific/indiv',
            testMatch: /.e2e.(?:js|ts)/u,
        },
        {
            name: 'it-specific-tests-batch-creation',
            dependencies: ['it-specific-tests-indiv', 'it-auth'],
            testDir: 'tests/playwright/it-specific/batch',
            testMatch: /.creation.e2e.(?:js|ts)/u,
            fullyParallel: true,
        },
        {
            name: 'it-specific-tests-batch-search',
            dependencies: ['it-specific-tests-batch-creation', 'it-auth'],
            testDir: 'tests/playwright/it-specific/batch',
            testMatch: /.search.e2e.(?:js|ts)/u,
            fullyParallel: true
        },
        {
            name: 'it-specific-tests-batch-deletion',
            dependencies: ['it-specific-tests-batch-search', 'it-auth'],
            testDir: 'tests/playwright/it-specific/batch',
            testMatch: /.deletion.e2e.(?:js|ts)/u,
            fullyParallel: false, //cancellation test inside; cancel first then delete
        },
 
        {
            name: 'it-specific-tests-generic',
            dependencies: ['it-auth'],
            testDir: 'tests/playwright/it-specific/generic',
            testMatch: /.e2e.(?:js|ts)/u,
            fullyParallel: true,
        },

        // logout tests
        {
            name: 'logout',
            dependencies: [
                'it-specific-tests-indiv',
                'it-specific-tests-batch-creation',
                'it-specific-tests-batch-search',
                'it-specific-tests-batch-deletion',
                'it-specific-tests-generic',
                'common-tests',
                'common-destructive-tests',
                'invalid-logins',
            ],
            testDir: 'tests/playwright/logout',
            testMatch: /.e2e.(?:js|ts)/u,
            fullyParallel: true,
        },
    ],
    timeout: 60_000,
    expect: {
        timeout: 10_000,
    },
});
