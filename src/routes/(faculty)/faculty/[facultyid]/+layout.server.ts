import { error } from '@sveltejs/kit';

import { getFacultyName, getAllFacultySemesters } from '$lib/server/queries/faculty-view';

export async function load({ params }) {
    const { facultyid: facultyidStr } = params;
    const facultyid = parseInt(facultyidStr, 10);

    // Validate parameter
    if (Number.isNaN(facultyid)) throw error(400, { message: 'Invalid record identifier.' });

    const name = await getFacultyName(facultyid);

    // Validate output
    if (name === null) throw error(400, { message: 'No record found.' });

    const semesters = await getAllFacultySemesters(facultyid);

    // Fallback: Actual current Academic Year and Semester
    const now = new Date();
    const currentMonth = now.getMonth(); // 0 is Jan, 11 is Dec
    const currentYear = now.getFullYear();

    // Month 0-6, 2nd sem so minus 1 to the currentYear
    let latestAcadYear = currentMonth < 7 ? currentYear - 1 : currentYear;

    // Guess current semester based on the month
    let latestSemNum = 1; // Default to 1st Sem (Aug-Dec)
    if (currentMonth >= 0 && currentMonth <= 4)
        latestSemNum = 2; // 2nd Sem (Jan-May)
    else if (currentMonth === 5 || currentMonth === 6) latestSemNum = 3; // Midyear (Jun-Jul)

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

        latestAcadYear = semesters[0].acadYear ?? latestAcadYear;
        latestSemNum = semesters[0].semNum ?? latestSemNum;
    }

    return {
        facultyid,
        ...name,
        latestAcadYear,
        latestSemNum,
    };
}
