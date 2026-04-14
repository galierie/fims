import { redirect } from '@sveltejs/kit';

import { getPermissions, getRole } from '$lib/server/queries/db-helpers';
import { seedDatabase } from '$lib/server/db/seed-db.js';

export async function load({ locals, url }) {
    if (locals.user) {
        const userRole = await getRole(locals.user.id);

        const accountColorMap = new Map();
        accountColorMap.set('IT', 'fims-red');
        accountColorMap.set('Admin', 'fims-green');

        const { canAddAccount, canModifyAccount } = await getPermissions(userRole);
        const canViewAccounts = canAddAccount || canModifyAccount;

        await seedDatabase();

        return {
            isLoggedIn: true, // if it's not, then this line shouldn't have been reached
            canViewAccounts,
            email: locals.user.email,
            accountColor: accountColorMap.get(userRole),
        };
    }
    if (!url.pathname.startsWith('/login') && !url.pathname.startsWith('/api/auth'))
        throw redirect(307, '/login');
    else
        return {
            isLoggedIn: false,
            canViewAccounts: false,
            email: '',
            accountColor: '',
        };
}
