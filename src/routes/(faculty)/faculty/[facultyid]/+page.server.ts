import { error, redirect } from '@sveltejs/kit';
import { getUserRoleAndPermissions } from '$lib/server/queries/db-helpers';

export async function load({ locals, parent }) {
    // Check existing session
    if (typeof locals.user === 'undefined') throw redirect(307, '/login');

    // Check Permissions
    const [roleObj] = await getUserRoleAndPermissions(locals.user.id);
    if (typeof roleObj === 'undefined') throw redirect(307, '/login');

    const { canAddFaculty, canModifyFaculty } = roleObj;
    const canViewFaculty = canAddFaculty || canModifyFaculty;
    if (!canViewFaculty) throw error(403, { message: 'Insufficient permissions.' });

    const { facultyid } = await parent();
    throw redirect(308, `/faculty/${facultyid}/profile`);
}
