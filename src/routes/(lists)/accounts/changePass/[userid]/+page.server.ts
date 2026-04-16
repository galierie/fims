import { getUserRoleAndPermissions } from '$lib/server/queries/db-helpers';
import { type Actions, error, fail, redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth.js';
import { APIError } from 'better-auth';

export const actions:Actions = {
    async changePassword({locals, request}) {
        const formData = await request.formData();

        const userid = formData.get('userid') as string;
        const newPass = formData.get('newpass') as string;

        if (typeof userid === 'undefined') return fail(403, 'No such account');
        if (!userid) return fail(403, 'No such account');
        if (typeof newPass === 'undefined') return fail(403, 'Must input a password');
        if (!newPass) return fail(403, 'Must input a password');

        if (newPass.length === 0) return fail(403, 'Nust input a password');

        //permissions check
        const [roleObj] = await getUserRoleAndPermissions(locals.user.id)
        if (typeof roleObj === 'undefined') return fail(403, 'Insufficient Permissions');
        
        if (!roleObj.canModifyAccount) return fail(403, 'Insufficient Permissions')
        
        try {
            const response = await auth.api.setUserPassword({
                body: {
                    userId: userid,
                    newPassword: newPass,
                },
                headers: request.headers
            })

            if (!response.status) {
                return fail(400, 'Failed to change account password')
            }
        } catch(error) {
            console.log(error);
            return fail(500, {
                error: error instanceof APIError ? error.message : 'Failed to change account password. (Unknown/Internal error)',
            });
        }
		return redirect(303, '/accounts');
    },
}