import { defineConfig } from '@playwright/test';

export default defineConfig({
    webServer: {
        command: 'pnpm preview',
        port: 4173,
        reuseExistingServer: true,
    },
    testDir: 'tests/playwright',
    outputDir: 'playwright-results',
    use: {
        baseURL: 'http://localhost:4173',
    },
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
    ],
});
