import { error } from '@sveltejs/kit';

import { getFacultyName } from '$lib/server/db-helpers';

export async function load({ params }) {
    const { facultyid: facultyidStr } = params;
    const facultyid = parseInt(facultyidStr, 10);

    // Validate parameter
    if (Number.isNaN(facultyid)) throw error(400, { message: 'Invalid record identifier.' });

    const name = await getFacultyName(facultyid);

    // Validate output
    if (name === null) throw error(400, { message: 'No record found.' });

    return { ...name };
}
