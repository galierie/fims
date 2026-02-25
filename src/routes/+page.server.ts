import { fail } from '@sveltejs/kit';

import { deleteFacultyRecords, getFacultyRecordList } from '$lib/server/db-helpers';

export async function load() {
    const facultyRecordList = await getFacultyRecordList();
    return { facultyRecordList };
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
