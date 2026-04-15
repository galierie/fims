import { redirect } from '@sveltejs/kit';

import { getUserRoleAndPermissions } from '$lib/server/queries/db-helpers';
import { seedDatabase } from '$lib/server/db/seed-db.js';

export async function load({ locals, url }) {
    if (typeof locals.user !== 'undefined') {
        // Check Permissions
        const [roleObj] = await getUserRoleAndPermissions(locals.user.id);
        if (typeof roleObj === 'undefined') throw redirect(307, '/login');

        const { role, canAddFaculty, canModifyFaculty, canAddAccount, canModifyAccount } = roleObj;
        const canViewFaculty = canAddFaculty || canModifyFaculty;
        const canViewAccounts = canAddAccount || canModifyAccount;
        const canViewNavBar = canViewFaculty && canViewAccounts;

        const accountColorMap = new Map();
        accountColorMap.set('IT', 'fims-red');
        accountColorMap.set('Admin', 'fims-green');

        await seedDatabase();

        return {
            isLoggedIn: true, // if it's not, then this line shouldn't have been reached
            canViewNavBar,
            email: locals.user.email,
            accountColor: accountColorMap.get(role),
        };
    }
    if (!url.pathname.startsWith('/login') && !url.pathname.startsWith('/api/auth'))
        throw redirect(307, '/login');
    else
        return {
            isLoggedIn: false,
            canViewNavBar: false,
            email: '',
            accountColor: '',
        };
}
