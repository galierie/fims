import {test, expect} from '@playwright/test';
import * as consts from '../../test-consts';

test('seeding', async () => {
	await consts.seed();
})