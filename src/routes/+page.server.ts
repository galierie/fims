import { fail } from '@sveltejs/kit';

import { deleteFacultyRecords } from '$lib/server/db-helpers';
import { getFacultyRecordList } from '$lib/server/faculty-records-list-helpers';

export async function load({ url }) {
    // Extract queries

    // Search
    const searchTerm = url.searchParams.get('search');

    // Pass the term to your helper
    const facultyRecordList = await getFacultyRecordList(searchTerm);

    return {
        facultyRecordList,
        searchTerm, // We send this back to the UI
    };
}
export const actions = {
    async delete({ locals, request }) {
        const formData = await request.formData();
        const idsString = formData.get('ids') as string;

        if (!idsString) return fail(400, { error: 'No IDs provided.' });

        try {
            const ids = JSON.parse(idsString);
            const response = await deleteFacultyRecords(locals.user.id, ids);
            return {
                ...response,
                message: response.success ? 'Deleted records.' : 'Failed to delete records.',
            };
        } catch {
            return fail(500, { error: 'Failed to delete records.' });
        }
    },
};
