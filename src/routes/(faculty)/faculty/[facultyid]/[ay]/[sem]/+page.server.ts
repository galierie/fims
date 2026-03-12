import { error, fail } from '@sveltejs/kit';

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
import { updateSemestralRecords } from '$lib/server/queries/db-helpers';

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

    // Get all possible semestral record options
    const existingOpts = await getAllFacultySemesters(facultyid);
    const allSemStrs = getAllSemesterms();

    // Get academic year options
    const acadYearOpts = [
        ...new Set(existingOpts.map(({ acadYear }) => acadYear).filter((elem) => elem !== null)),
    ];

    if (!acadYearOpts.includes(acadYear)) {
        acadYearOpts.push(acadYear);
        acadYearOpts.sort((a, b) => a - b); // Keep the years in order
    }

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

export const actions = {
    async update({ request, params }) {
        const formData = await request.formData();

        // Extract URL parameters
        const facultyidStr = params.facultyid;
        const facultyid = parseInt(facultyidStr, 10);
        const acadYearStr = params.ay;
        const acadYear = parseInt(acadYearStr, 10);
        const semNumStr = params.sem;
        const semNum = parseInt(semNumStr, 10);

        if (Number.isNaN(facultyid) || Number.isNaN(acadYear) || Number.isNaN(semNum)) {
            return fail(400, { error: 'Invalid URL parameters.' });
        }

        // Extract fields (Current Rank, Degree, Remarks)
        function getVal(key: string) {
            if (!formData.has(key)) return null;
            const val = formData.get(key) as string;
            return val === '' || val === '-' ? null : val;
        }

        const basicSemestralData = {
            currentRankTitle: getVal('current-rank'),
            currentHighestDegree: getVal('current-highest-educational-attainment'),
            remarks: getVal('remarks'),
        };

        // Helper function to parse dynamic tables
        function parseTable(tableName: string, colNames: string[]) {
            const numOfRowsStr = formData.get(`${tableName}-num-of-rows`) as string;
            const deletedRowsStr = formData.get(`${tableName}-deletion`) as string;

            const numOfRows = parseInt(numOfRowsStr || '0', 10);
            const deletedRows: number[] = JSON.parse(deletedRowsStr || '[]');

            const parsedRecords = {
                create: [] as Record<string, unknown>[],
                update: [] as Record<string, unknown>[],
                delete: [] as number[],
            };

            for (let i = 0; i < numOfRows; i++) {
                const tupleidStr = formData.get(`${tableName}-${i}-tupleid`) as string | null;
                const tupleid = tupleidStr ? parseInt(tupleidStr, 10) : null;

                if (deletedRows.includes(i)) {
                    if (tupleid) parsedRecords.delete.push(tupleid);
                    continue;
                }

                const rowData: Record<string, unknown> = {};
                colNames.forEach((col) => {
                    let val: unknown = formData.get(`${i}[${col}]`);

                    if (val === 'on' || val === 'true') {
                        val = true;
                    } else if (val === 'false' || val === null) {
                        val = false;
                    }

                    if (val === '' || val === '-') val = null;
                    rowData[col] = val;
                });

                if (tupleid) {
                    parsedRecords.update.push({ tupleid, ...rowData });
                } else {
                    const hasData = Object.values(rowData).some(
                        (val) => val !== null && val !== false,
                    );
                    if (hasData) parsedRecords.create.push(rowData);
                }
            }
            return parsedRecords;
        }

        // Parse semestral sections
        const dynamicTables = {
            // Admin
            adminPositions: parseTable('administrative-positions', [
                'administrative-position-title',
                'administrative-position-office',
                'administrative-position-start-date',
                'administrative-position-end-date',
                'administrative-position-load-credit',
            ]),
            committees: parseTable('committee-memberships', [
                'committee-membership-nature',
                'committee-membership-committee',
                'committee-membership-start-date',
                'committee-membership-end-date',
                'committee-membership-load-credit',
            ]),
            adminWorks: parseTable('administrative-works', [
                'administrative-work-nature',
                'administrative-work-committee',
                'administrative-work-start-date',
                'administrative-work-end-date',
                'administrative-work-load-credit',
            ]),

            // Teaching
            courses: parseTable('courses', [
                'course-title',
                'course-units',
                'course-section',
                'course-num-of-students',
                'course-load-credit',
                'course-section-set',
            ]),
            mentees: parseTable('mentees', [
                'mentee-lastname',
                'mentee-firstname',
                'mentee-middlename',
                'mentee-category',
                'mentee-start-date',
                'mentee-end-date',
                'mentee-load-credit',
            ]),

            // Research, extension, study
            research: parseTable('research', [
                'research-title',
                'research-start-date',
                'research-end-date',
                'research-funding',
                'research-load-credit',
                'research-remarks',
            ]),
            extension: parseTable('extension', [
                'extension-nature',
                'extension-agency',
                'extension-start-date',
                'extension-end-date',
                'extension-load-credit',
            ]),
            studyLoad: parseTable('study-load', [
                'study-load-degree',
                'study-load-university',
                'study-load-units',
                'study-load-on-leave-with-pay',
                'study-load-fellowship-recipient',
                'study-load-credit',
            ]),
        };

        // Database update calls
        const { success } = await updateSemestralRecords(
            facultyid,
            acadYear,
            semNum,
            basicSemestralData,
            dynamicTables,
        );

        if (!success) {
            return fail(500, { error: 'Failed to update semestral records.' });
        }

        return { success: true };
    },
};
