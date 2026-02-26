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
        },

        // login tests
        {
            name: 'admin-auth',
            testMatch: /admin-auth.setup.e2e.(?:js|ts)/u,
            dependencies: ['invalid-logins'],
        },
        {
            name: 'it-auth',
            testMatch: /it-auth.setup.e2e.(?:js|ts)/u,
            dependencies: ['invalid-logins'],
        },

        // common tests
        {
            name: 'common-tests',
            dependencies: ['admin-auth', 'it-auth', 'invalid-logins'],
            testMatch: /.common.e2e.(?:js|ts)/u,
        },
        {
            name: 'it-specific-tests',
            dependencies: ['it-auth', 'common-tests'], // added common tests as a dependency as this test loves deleting the admin account
            testDir: 'tests/playwright/it-specific',
            testMatch: /.e2e.(?:js|ts)/u,
        },

        // sprint 2 tests
        {
            name: 'search-functions', // searching tests
            dependencies: ['common-tests', 'it-specific-tests'],
            testDir: 'tests/playwright/search-functions',
            testMatch: /.e2e.(?:js|ts)/u,
        },
        {
            name: 'record-view', // individual record view
            dependencies: ['common-tests', 'it-specific-tests', 'search-functions'],
            testDir: 'tests/playwright/record-view',
            testMatch: /.e2e.(?:js|ts)/u,
        },

        // logout tests
        {
            name: 'logout',
            dependencies: [
                'it-auth',
                'admin-auth',
                'common-tests',
                'it-specific-tests',
                'invalid-logins',

                // sprint 2
                'search-functions',
                'record-view',
            ],
            testDir: 'tests/playwright/logout',
            testMatch: /.e2e.(?:js|ts)/u,
        },
    ],
});
