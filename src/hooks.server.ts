import type { Handle } from '@sveltejs/kit';
import { svelteKitHandler } from 'better-auth/svelte-kit';

import { auth } from '$lib/server/auth';
import { building } from '$app/environment';

// eslint-disable-next-line func-style -- the `Handle` type hint is needed to unpack the parameters
const handleBetterAuth: Handle = async ({ event, resolve }) => {
    const { request, locals } = event;

    const session = await auth.api.getSession({ headers: request.headers });

    if (session) {
        locals.session = session.session;
        locals.user = session.user;
    }

    return svelteKitHandler({ event, resolve, auth, building });
};

export const handle: Handle = handleBetterAuth;
