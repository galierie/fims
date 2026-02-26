import { error, fail, redirect } from '@sveltejs/kit';

import { deleteFacultyRecords, getFacultyRecord } from '$lib/server/db-helpers';
import { refreshFacultyRecordSearchView } from '$lib/server/faculty-records-list-helpers.js';

export async function load({ params }) {
    const { facultyid: facultyidStr } = params;
    const facultyid = parseInt(facultyidStr, 10);

    // Validate parameter
    if (Number.isNaN(facultyid)) throw error(400, { message: 'Invalid record identifier.' });

    const record = await getFacultyRecord(facultyid);

    // Validate output
    if (record === null) throw error(400, { message: 'Invalid record identifier.' });

    const { lastname, firstname } = record;

    return {
        lastname,
        firstname,
    };
}

export const actions = {
    async delete({ locals, request }) {
        const formData = await request.formData();
        const facultyidStr = formData.get('facultyid') as string;
        const facultyid = parseInt(facultyidStr, 10);

        if (Number.isNaN(facultyid)) return fail(400, { error: 'Invalid record identifier.' });

        const { success } = await deleteFacultyRecords(locals.user.id, [facultyid]);
        await refreshFacultyRecordSearchView();
        if (success) redirect(308, '/');
        return fail(500, { error: 'Failed to delete record.' });
    },
};
