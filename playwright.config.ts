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
        {
            name: 'invalid-logins',
            testMatch: /.e2e.(?:js|ts)/u,
            testDir: 'tests/playwright/invalid-login',
        },
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
        {
            name: 'common-tests',
            dependencies: ['admin-auth', 'it-auth', 'invalid-logins'],
            testMatch: /.common.e2e.(?:js|ts)/u,
        },
        {
            name: 'it-specific-tests',
            dependencies: ['it-auth'],
            testDir: 'tests/playwright/it-specific',
            testMatch: /.e2e.(?:js|ts)/u,
        },
        {
            name: 'logout',
            dependencies: [
                'it-auth',
                'admin-auth',
                'common-tests',
                'it-specific-tests',
                'invalid-logins',
            ],
            testDir: 'tests/playwright/logout',
            testMatch: /.e2e.(?:js|ts)/u,
        },
    ],
});
