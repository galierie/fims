import { json } from '@sveltejs/kit';

import { auth } from '$lib/server/auth';
import { logChange } from '$lib/server/queries/db-helpers.js';

export async function POST({ locals, request }) {
    // Log action
    if (typeof locals.user !== 'undefined')
        await logChange(locals.user.id, null, 'Action: Log-out');

    const response = await auth.api.signOut({
        headers: request.headers,
    });

    return json(response);
}
