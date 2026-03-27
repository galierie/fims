import { test, expect } from '@playwright/test';
import * as consts from '../../test-consts';

test('seeding', async () => {
    console.log('call seed, preamble');
    await consts.seed();
});
