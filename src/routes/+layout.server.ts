import { redirect } from '@sveltejs/kit';

import { getPermissions, getRole } from '$lib/server/db-helpers.js';
import { seedDatabase } from '$lib/server/db/seed-db.js';

export async function load({ locals, url }) {
    if (
        !locals.user &&
        !url.pathname.startsWith('/login') &&
        !url.pathname.startsWith('/api/auth')
    ) {
        throw redirect(307, '/login');
    } else if (locals.user) {
        const userRole = await getRole(locals.user.id);
        const {
            canaddaccount,
            canmodifyaccount,
            canviewchangelogs: canViewChangeLogs,
        } = await getPermissions(userRole);

        const accountColorMap = new Map();
        accountColorMap.set('IT', 'fims-red');
        accountColorMap.set('Admin', 'fims-green');

        await seedDatabase();

        return {
            isLoggedIn: true, // if it's not, then this line shouldn't have been reached
            email: locals.user.email,
            canViewAccounts: canaddaccount || canmodifyaccount,
            isViewingRecord: url.pathname.startsWith('/record'),
            canViewChangeLogs,
            accountColor: accountColorMap.get(userRole),
        };
    }

    return {
        isLoggedIn: false,
        isViewingRecord: false,
        email: '',
        canViewAccounts: false,
        canViewChangeLogs: false,
        accountColor: '',
    };
}
