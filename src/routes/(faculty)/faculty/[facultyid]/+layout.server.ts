import { error, redirect } from '@sveltejs/kit';

import { getUserRoleAndPermissions } from '$lib/server/queries/db-helpers.js';
import { getAllFacultyAcademicSemesters, getFacultyName } from '$lib/server/queries/faculty-view';

export async function load({ locals, params }) {
    // Check existing session
    if (typeof locals.user === 'undefined') throw redirect(307, '/login');

    // Check Permissions
    const [roleObj] = await getUserRoleAndPermissions(locals.user.id);
    if (typeof roleObj === 'undefined') throw redirect(307, '/login');

    const { canAddFaculty, canModifyFaculty } = roleObj;
    const canViewFaculty = canAddFaculty || canModifyFaculty;
    if (!canViewFaculty) throw error(403, { message: 'Insufficient permissions.' });

    const { facultyid: facultyidStr } = params;
    const facultyid = parseInt(facultyidStr, 10);

    // Validate parameter
    if (Number.isNaN(facultyid)) throw error(400, { message: 'Invalid record identifier.' });

    const name = await getFacultyName(facultyid);

    // Validate output
    if (name === null) throw error(400, { message: 'No record found.' });

    const semesters = await getAllFacultyAcademicSemesters(facultyid);

    // default to 0 for new faculty (they will be sent to /create anyway)
    let latestAcadYear = 0;
    let latestSemNum = 0;

    if (semesters.length > 0) {
        // Sort: highest year first, then highest semester first
        semesters.sort((a, b) => {
            const yearA = a.acadYear ?? 0;
            const yearB = b.acadYear ?? 0;
            if (yearB !== yearA) return yearB - yearA;

            const semA = a.semNum ?? 0;
            const semB = b.semNum ?? 0;
            return semB - semA;
        });

        // get latest record
        latestAcadYear = semesters[0].acadYear ?? 0;
        latestSemNum = semesters[0].semNum ?? 0;
    }

    return {
        facultyid,
        ...name,
        latestAcadYear,
        latestSemNum,
        hasSemestralRecords: semesters.length > 0,
    };
}
