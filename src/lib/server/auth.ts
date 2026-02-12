import { admin } from 'better-auth/plugins';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';

import { db } from '$lib/server/db';
import { env } from '$env/dynamic/private';
import { getRequestEvent } from '$app/server';

export const auth = betterAuth({
    baseURL: env.ORIGIN,
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, { provider: 'pg' }),
    emailAndPassword: { enabled: true },
    socialProviders: {
        google: {
            prompt: 'select_account',
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            disableSignUp: true,
        },
    },
    user: {
        modelName: 'appuser',
    },
    plugins: [admin(), sveltekitCookies(getRequestEvent)], // make sure this is the last plugin in the array
});
