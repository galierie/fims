import { deleteFacultyRecord } from '$lib/server/db-helpers';
import { json, error } from '@sveltejs/kit';

// TODO: secure with cookies
export async function POST({request, locals}) {
    if (!locals.user || !locals.session) {
        throw error(401, 'unauthorized');
    }

    const data = await request.json();
    if (!data) throw error(403, 'malformed data');
    if (!data.deleted) throw error(403, 'malformed data');
    await deleteFacultyRecord(data.deleted);
    return json({success: true});;
}