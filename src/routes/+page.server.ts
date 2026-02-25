import { fail } from '@sveltejs/kit';

import { deleteFacultyRecords, getFacultyRecordList } from '$lib/server/db-helpers';

export async function load({ url }) {
    // Extract 'search' from the URL (e.g., localhost:5173/?search=Zach)
    const searchTerm = url.searchParams.get('search') || '';

    // Pass the term to your helper
    const facultyRecordList = await getFacultyRecordList(searchTerm);

    return {
        facultyRecordList,
        searchTerm, // We send this back to the UI
    };
}
export const actions = {
    async delete({ request }) {
        const formData = await request.formData();
        const idsString = formData.get('ids') as string;

        if (!idsString) return fail(400, { message: 'No IDs provided.' });

        try {
            const ids = JSON.parse(idsString);
            await deleteFacultyRecords(ids);
            return { success: true };
        } catch {
            return fail(500, { message: 'Failed to delete records.' });
        }
    },
};
