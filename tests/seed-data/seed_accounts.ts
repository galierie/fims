// copy paste into server scripts then remove

import '../../src/lib/server/auth';
import { auth } from '../../src/lib/server/auth';

await auth.api.signUpEmail({
    body: {
        email: 'admin@up.edu.ph',
        password: 'password',
        name: 'Admin',
    },
});
await auth.api.signUpEmail({
    body: {
        email: 'it@up.edu.ph',
        password: 'password',
        name: 'IT',
    },
});
