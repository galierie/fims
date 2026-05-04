import { getUserRoleAndPermissions, logChange } from '$lib/server/queries/db-helpers';
import { type Actions, fail, redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth.js';
import { APIError } from 'better-auth';

export async function load({ locals }) {
    // Check existing session
    if (typeof locals.user === 'undefined') throw redirect(307, '/login');

    // Log action
    await logChange(locals.user.id, null, 'Action: Attempt to change password.');

    return { userId: locals.user.id }
}

export const actions: Actions = {
    async changePassword({ locals, request }) {
        // Check existing session
        if (typeof locals.user === 'undefined') throw redirect(307, '/login');

        // Log action
        await logChange(locals.user.id, null, 'Action: Change Password.');

        // Check Permissions
        const [roleObj] = await getUserRoleAndPermissions(locals.user.id);
        if (typeof roleObj === 'undefined') throw redirect(307, '/login');

        const { canModifyAccount } = roleObj;
        const formData = await request.formData();

        const userId = formData.get('userId') as string;
        if (typeof userId === 'undefined') return fail(403, 'No such account');
        if (!userId) return fail(403, 'No such account');

        if (!canModifyAccount && userId !== locals.user.id) return fail(403, { error: 'Insufficient permissions.' });

        const newPass = formData.get('newpass') as string;
        if (typeof newPass === 'undefined') return fail(403, 'Must input a password');
        if (!newPass) return fail(403, 'Must input a password');
        if (newPass.length === 0) return fail(403, 'Nust input a password');

        try {
            const response = await auth.api.setUserPassword({
                body: {
                    userId,
                    newPassword: newPass,
                },
                headers: request.headers,
            });

            if (!response.status) {
                return fail(400, 'Failed to change account password');
            }
        } catch (error) {
            console.log(error);
            return fail(500, {
                error:
                    error instanceof APIError
                        ? error.message
                        : 'Failed to change account password. (Unknown/Internal error)',
            });
        }
        return redirect(303, '/accounts');
    },
};
