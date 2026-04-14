import { expect, test } from '@playwright/test';

import * as consts from '../../test-consts';
import * as fieldHelp from '../../test-helpers/field-test';

test('reseeding', async () => {
    console.log('call seed');
    await consts.seed();
});
