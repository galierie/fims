import { logChange } from '$lib/server/queries/db-helpers';
import { type Actions, fail, redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { assertAllRequiredFormInputs } from '$lib/utils/assert';

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

        const formData = await request.formData();
        const requiredFormInputs = [
            formData.get('userId') as string | null,
            formData.get('currentPassword') as string | null,
            formData.get('newPassword') as string | null,
        ];

        let success = false;

        try {
            assertAllRequiredFormInputs(requiredFormInputs);
            const [userId, currentPassword, newPassword] = requiredFormInputs;

            // No empty strings as new password
            if (newPassword.length === 0)
                return fail(400, { error: 'Invalid new password.' });

            // Ensure that only users can set their own password
            if (userId !== locals.user.id)
                return fail(403, { error: 'Insufficient permissions.' });

            // Change password
            await auth.api.changePassword({
                body: {
                    newPassword,
                    currentPassword,
                    revokeOtherSessions: true,
                },
                headers: request.headers,
            });

            success = true;
        } catch (error) {
            return fail(500, {
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to change account password. (Unknown/Internal error)',
            });
        }

        if (success)
            return redirect(303, '/');
        else
            return fail(500, { error: 'Failed to change account password. (Unknown/Internal error)' });
    },
};
