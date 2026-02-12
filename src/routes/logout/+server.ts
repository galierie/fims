import { json } from '@sveltejs/kit';

import { auth } from '$lib/server/auth';

export async function POST({ request }) {
    const response = await auth.api.signOut({
        headers: request.headers,
    });

    return json(response);
}
