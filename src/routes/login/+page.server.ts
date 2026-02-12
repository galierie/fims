import { APIError } from 'better-auth';
import { fail, redirect } from '@sveltejs/kit';

import { auth } from '$lib/server/auth';

import type { Actions } from './$types';

const validProviders = ['google'];

export function load({ locals }) {
    if (locals.user)
        // then there's a logged in user
        throw redirect(303, '/');

    return {};
}

export const actions = {
    async signInEmail({ request }) {
        const data = await request.formData();
        const email = data.get('email') as string;
        const password = data.get('password') as string;
        const callbackURL = '/';

        // Validate credentials
        if (!email || !email.endsWith('@up.edu.ph')) return fail(400, { error: 'Invalid email.' });

        if (!password) return fail(400, { error: 'Empty password.' });

        // Log-in with credentials
        let responseUrl: string | null = null;
        try {
            const response = await auth.api.signInEmail({
                body: {
                    email,
                    password,
                    callbackURL,
                },
            });

            if (response.url) responseUrl = response.url;
        } catch (error) {
            return fail(500, {
                error: error instanceof APIError ? error.message : 'Auth failed.',
            });
        }

        if (responseUrl) throw redirect(303, '/');
    },

    async signInSocial({ request }) {
        const formData = await request.formData();
        const provider = formData.get('provider') as string;
        const callbackURL = '/';

        // Validate input
        if (!provider || !validProviders.includes(provider))
            return fail(400, { error: 'Invalid auth provider.' });

        // Trigger auth
        const response = await auth.api.signInSocial({
            body: {
                provider: provider as string,
                callbackURL,
            },
        });

        if (response.url) throw redirect(303, response.url);

        return fail(500, { error: 'Third-party auth failed' });
    },
} satisfies Actions;
