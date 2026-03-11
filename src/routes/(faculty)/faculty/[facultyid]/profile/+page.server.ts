import { error, fail, redirect } from '@sveltejs/kit';

import { type ChangelogRecordStructure } from '$lib/ui/ChangelogList.svelte';

import { deleteFacultyRecords } from '$lib/server/queries/db-helpers';
import {
    getAllAppointmentStatuses,
    getAllFieldsOfInterest,
    getAllRanks,
    getFacultyProfile,
} from '$lib/server/queries/faculty-view';
import { refreshFacultyRecordSearchView, getFacultyRecordChangelogs } from '$lib/server/queries/faculty-list';

export async function load({ params, parent }) {
    const layoutData = await parent();
    const { facultyid: facultyidStr } = params;
    const facultyid = parseInt(facultyidStr, 10);
    
    let fetchedChangelogs:ChangelogRecordStructure[]|null = null

    // Validate parameter
    if (Number.isNaN(facultyid)) throw error(400, { message: 'Invalid record identifier.' });

    const profile = await getFacultyProfile(facultyid);

    // Validate output
    if (profile === null) throw error(400, { message: 'No record found.' });

    //get changelogs if possible
    if (layoutData.canViewChangeLogs) {
        fetchedChangelogs = await getFacultyRecordChangelogs(facultyid, 3, 0)
        console.log(fetchedChangelogs)
    }

    // Get input dropdown options and dependency mappings
    const opts: Map<string, Array<string>> = new Map();
    const dependencyMaps: Map<string, Map<string, string>> = new Map();

    opts.set('fieldsOfInterest', await getAllFieldsOfInterest());
    opts.set('appointmentStatuses', await getAllAppointmentStatuses());

    const ranks = await getAllRanks();
    opts.set(
        'rankTitles',
        ranks.map(({ rankTitle }) => rankTitle),
    );

    const rankTitlesToSalaryGrades: Map<string, string> = new Map(
        ranks.map(({ rankTitle, salaryGrade }) => [rankTitle, salaryGrade]),
    );
    dependencyMaps.set('rankTitlesToSalaryGrades', rankTitlesToSalaryGrades);

    const rankTitlesToSalaryRates: Map<string, string> = new Map(
        ranks.map(({ rankTitle, salaryRate }) => [rankTitle, salaryRate]),
    );
    dependencyMaps.set('rankTitlesToSalaryRates', rankTitlesToSalaryRates);

    return { profile, opts, dependencyMaps, fetchedChangelogs};
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
