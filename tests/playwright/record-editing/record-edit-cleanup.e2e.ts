import {test, expect} from '@playwright/test';
import * as consts from '../../test-consts';
import * as fieldHelp from '../../test-helpers/field-test';

test.describe('reseeding', async () => {
	await consts.seed()
});