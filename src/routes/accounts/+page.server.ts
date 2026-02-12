import { type Actions, fail } from '@sveltejs/kit';
import { APIError } from 'better-auth';

import { assignRole } from '$lib/server/db-helpers';
import { auth } from '$lib/server/auth';

export const actions = {
    async default({ request }) {
        const data = await request.formData();
        const email = data.get('email') as string;
        const password = data.get('password') as string;
        const role = data.get('role') as string;

        // Validate credentials
        if (!email || !email.endsWith('@up.edu.ph')) return fail(400, { error: 'Invalid email.' });

        if (!password) return fail(400, { error: 'Invalid password.' });

        if (!role) return fail(400, { error: 'Invalid role.' });

        // Register as user
        try {
            const response = await auth.api.signUpEmail({
                body: {
                    email,
                    password,
                    name: 'User',
                },
            });

            if (response.user.id === '') return fail(500, { error: 'Failed to make new account.' });

            // Assign role
            await assignRole(response.user.id, role);
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
} satisfies Actions;
