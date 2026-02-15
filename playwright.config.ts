import { defineConfig } from '@playwright/test';

export default defineConfig({
    webServer: {
        command: 'npm run build && npm run preview',
        port: 4173,
    },
    testDir: 'tests/playwright',
    outputDir: 'playwright-results',
    projects: [
        {
            name: 'admin-auth',
            testMatch: /admin-auth.setup.e2e.(?:js|ts)/u,
        },
        {
            name: 'it-auth',
            testMatch: /it-auth.setup.e2e.(?:js|ts)/u,
        },
        {
            name: 'common-tests',
            dependencies: ['admin-auth', 'it-auth'],
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
            dependencies: ['it-auth', 'admin-auth', 'common-tests', 'it-specific-tests'],
            testDir: 'tests/playwright/logout',
            testMatch: /.e2e.(?:js|ts)/u,
        }
    ],
});
