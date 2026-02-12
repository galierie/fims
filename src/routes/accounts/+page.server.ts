import { type Actions, error, fail } from '@sveltejs/kit';
import { APIError } from 'better-auth';

import { areYouHere, getAccountList, getRole, makeUser } from '$lib/server/db-helpers';
import { auth } from '$lib/server/auth';

export async function load({ locals }) {
    const userRole = await getRole(locals.user.id);
    if (userRole !== 'IT') throw error(404, { message: 'Insufficient permissions.' });

    const accountList = await getAccountList(locals.user.id);
    // const accountList = [
    //     {
    //         userid: 'sdjvghkadsfhvb',
    //         email: 'it@up.edu.ph',
    //         role: 'IT',
    //         logTimestamp: '',
    //         logOperation: 'Made account.',
    //         logMaker: '',
    //     },
    // ];

    return { accountList };
}

export const actions = {
    async makeAccount({ locals, request }) {
        const data = await request.formData();
        const email = data.get('email') as string;
        const password = data.get('password') as string;
        const role = data.get('role') as string;

        // Validate credentials
        if (!email || !email.endsWith('@up.edu.ph')) return fail(400, { error: 'Invalid email.' });
        if (await areYouHere(email))
            return fail(400, { error: 'Email is already associated with an account.' });

        if (!password) return fail(400, { error: 'Invalid password.' });

        if (!role) return fail(400, { error: 'Invalid role.' });

        // Register as user
        try {
            const response = await auth.api.createUser({
                body: {
                    email,
                    password,
                    name: 'User',
                    role: role === 'IT' ? 'admin' : 'user',
                },
            });

            if (response.user.id === '') return fail(500, { error: 'Failed to make new account.' });

            // Add user info
            await makeUser(locals.user.id, response.user.id, role);
        } catch (error) {
            return fail(500, {
                error: error instanceof APIError ? error.message : 'Failed to make new account.',
            });
        }

        return {
            success: true,
            message: 'Created account.',
        };
    },

    async deleteAccount({ request }) {
        const data = await request.formData();
        const userid = data.get('userid') as string;

        // Validate input
        if (!userid) return fail(400, { error: 'Failed to delete account.' });

        // Delete!
        const response = await auth.api.removeUser({
            body: {
                userId: userid,
            },
            headers: request.headers,
        });

        return {
            ...response,
            message: response.success ? 'Deleted account.' : 'Failed to delete account.',
        };
    },
} satisfies Actions;
