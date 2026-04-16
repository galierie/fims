import { defineConfig } from '@playwright/test';

export default defineConfig({
    webServer: {
        command: 'pnpm build && pnpm preview',
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
            name: 'preamble',
            dependencies: ['admin-auth', 'it-auth', 'invalid-logins'],
            testDir: 'tests/playwright/preamble',
            testMatch: /.e2e.(?:js|ts)/u,
            fullyParallel: false,
        },
        {
            name: 'common-tests',
            dependencies: ['preamble'],
            testMatch: /.common.e2e.(?:js|ts)/u,
            fullyParallel: true,
        },

        // record editing tests
        //preamble
        {
            name: 'record-edits-preamble',
            dependencies: ['it-auth', 'admin-auth', 'common-tests'],
            testDir: 'tests/playwright/record-editing',
            testMatch: /.preamble.e2e.(?:js|ts)/u,
            fullyParallel: true,
        },

        //actual
        {
            name: 'record-edits',
            dependencies: ['record-edits-preamble'],
            testDir: 'tests/playwright/record-editing',
            testMatch: /.main.e2e.(?:js|ts)/u,
            fullyParallel: false,
        },

        //export tests
        //preamble
        {
            name: 'export-reports-preamble',
            dependencies: ['record-edits'],
            testDir: 'tests/playwright/export-reports',
            testMatch: /.preamble.e2e.(?:js|ts)/u,
            fullyParallel: true,
        },

        //main
        {
            name: 'export-reports-main',
            dependencies: ['export-reports-preamble'],
            testDir: 'tests/playwright/export-reports',
            testMatch: /.main.e2e.(?:js|ts)/u,
            fullyParallel: false, //downloading file
        },
        {
            name: 'export-reports-cleanup',
            dependencies: ['export-reports-main'],
            testDir: 'tests/playwright/export-reports',
            testMatch: /.cleanup.e2e.(?:js|ts)/u,
            fullyParallel: false, //downloading file
        },

        // common destructive tests, as they can't be easily parallelized due to deletions and stuff
        {
            name: 'common-destructive-tests',
            dependencies: ['export-reports-cleanup'],
            testDir: 'tests/playwright/destructive',
            testMatch: /.e2e.(?:js|ts)/u,
        },

        // it-specifc (account handling) tests

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
            fullyParallel: true,
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
            dependencies: ['it-auth', 'preamble'],
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
                'record-edits',
                'export-reports-main',
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
