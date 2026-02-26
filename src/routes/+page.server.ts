import { fail } from '@sveltejs/kit';

import { deleteFacultyRecords } from '$lib/server/db-helpers';
import { getFacultyRecordList } from '$lib/server/faculty-records-list-helpers';

export async function load({ url }) {
    // Extract queries

    // Cursor and Direction
    const newCursorStr = url.searchParams.get('cursor');
    const isNextStr = url.searchParams.get('isNext'); // 0 or 1

    // eslint-disable-next-line no-undefined -- can't use null in Drizzle WHERE queries
    const newCursor = newCursorStr ? parseInt(newCursorStr, 10) : undefined;
    const isNext = isNextStr ? parseInt(isNextStr, 10) === 1 : true;

    // Search
    const searchTerm = url.searchParams.get('search');

    // Get faculty record list
    const { facultyRecordList, prevCursor, nextCursor, hasPrev, hasNext } = await getFacultyRecordList(
        searchTerm,
        newCursor,
        isNext,
        !newCursorStr && !isNextStr,
    );

    return {
        facultyRecordList,
        prevCursor,
        nextCursor,
        hasPrev,
        hasNext,
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
