import { error, redirect } from '@sveltejs/kit';

import {
    getAllAdminPositions,
    getAllCourses,
    getAllFacultySemesters,
    getAllOffices,
    getAllResearches,
    getAllSemesterms,
    getFacultyEducationalAttainments,
    getFacultyPromotionHistory,
    getFacultySemestralRecords,
} from '$lib/server/queries/faculty-view';

export async function load({ params }) {
    const { facultyid: facultyidStr, ay: acadYearStr, sem: semNumStr } = params;

    const facultyid = parseInt(facultyidStr, 10);
    const acadYear = parseInt(acadYearStr, 10);
    const semNum = parseInt(semNumStr, 10);

    // Validate parameters
    if (Number.isNaN(facultyid)) throw error(400, { message: 'Invalid record identifier.' });
    if (Number.isNaN(acadYear)) throw error(400, { message: 'Invalid academic year.' });
    if (Number.isNaN(semNum)) throw error(400, { message: 'Invalid semester.' });

    const semestralRecord = await getFacultySemestralRecords(facultyid, acadYear, semNum);

    // Validate output
    if (semestralRecord === null)
        throw redirect(307, `/faculty/${facultyid}/${acadYear}/${semNum}/create`);

    // Get all possible semestral record options
    const existingOpts = await getAllFacultySemesters(facultyid);
    const allSemStrs = getAllSemesterms();

    // Get academic year options
    const acadYearOpts = [
        ...new Set(existingOpts.map(({ acadYear }) => acadYear).filter((elem) => elem !== null)),
    ];
    if (!acadYearOpts.includes(acadYear)) throw error(400, { message: 'Invalid academic year.' });

    // Get input dropdown options and dependency mappings
    const opts: Map<string, Array<string>> = new Map();
    const dependencyMaps: Map<string, Map<string, string>> = new Map();

    const ranks = await getFacultyPromotionHistory(facultyid);
    const educationalAttainments = await getFacultyEducationalAttainments(facultyid);

    opts.set(
        'rankTitles',
        ranks.map(({ rankTitle }) => rankTitle ?? '').filter((rankTitle) => rankTitle !== ''),
    );
    opts.set(
        'degrees',
        educationalAttainments.map(({ degree }) => degree),
    );

    opts.set('adminPositions', await getAllAdminPositions());
    opts.set('offices', await getAllOffices());

    const courses = await getAllCourses();
    opts.set(
        'courseTitles',
        courses.map(({ title }) => title),
    );
    dependencyMaps.set(
        'courseTitlesToCourseUnits',
        new Map(courses.map(({ title, units }) => [title, units.toString()])),
    );

    const researches = await getAllResearches();
    opts.set(
        'researchTitles',
        researches.map(({ title }) => title),
    );
    dependencyMaps.set(
        'researchTitlesToResearchStartDates',
        new Map(researches.map(({ title, startDate }) => [title, startDate])),
    );
    dependencyMaps.set(
        'researchTitlesToResearchEndDates',
        new Map(researches.map(({ title, endDate }) => [title, endDate])),
    );
    dependencyMaps.set(
        'researchTitlesToResearchFunding',
        new Map(researches.map(({ title, funding }) => [title, funding ?? ''])),
    );

    return {
        acadYearOpts,
        allSemStrs,
        existingOpts,
        facultyid,
        semestralRecord,
        opts,
        dependencyMaps,
    };
}
