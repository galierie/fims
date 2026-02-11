import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { auth } from '$lib/server/auth';

export async function load({ locals }) {
    if (locals.user) {
        // then there's a logged in user
        throw redirect(303, '/');
    }

    return {};
};

export const actions = {
    default: async ({ request }) => {
        const data = await request.formData();
        const email = data.get('email') as string;
        const password = data.get('password') as string;
        const callbackURL = '/';

        // Validate credentials
        if (!email || !email.endsWith('@up.edu.ph')) {
            return fail(400, { error: 'Invalid email.' });
        }

        if (!password) {
            return fail(400, { error: 'Empty password.' });
        }

        // Log-in with credentials
        let responseUrl: string | undefined = undefined;
        try {
            const response = await auth.api.signInEmail({
                body: {
                    email,
                    password,
                    callbackURL
                },
            });

            responseUrl = response.url;
        } catch (error) {
            return fail(500, { error: 'Auth failed.' });
        }

        if (responseUrl) {
            throw redirect(303, '/');
        }
    },
} satisfies Actions;
