import { error, fail, redirect } from '@sveltejs/kit';

import type { ChangelogRecordStructure } from '$lib/ui/ChangelogList.svelte';
import { deleteFacultyRecords, getUserPermissions, updateFacultyProfileRecords } from '$lib/server/queries/db-helpers';
import { getAllAppointmentStatuses, getAllFieldsOfInterest, getAllRanks, getFacultyProfile } from '$lib/server/queries/faculty-view';
import { getFacultyRecordChangelogs, refreshFacultyRecordSearchView } from '$lib/server/queries/faculty-list';

export async function load({ params, locals }) {
    const { facultyid: facultyidStr } = params;
    const facultyid = parseInt(facultyidStr, 10);

    const permissions = await getUserPermissions(locals.user.id);
    const canViewChangelogs = permissions?.canViewChangelogs ?? false;

    let fetchedChangelogs: ChangelogRecordStructure[] | null = null;

    // Validate parameter
    if (Number.isNaN(facultyid)) throw error(400, { message: 'Invalid record identifier.' });

    const profile = await getFacultyProfile(facultyid);

    // Validate output
    if (profile === null) throw error(400, { message: 'No record found.' });

    //get changelogs if possible
    if (canViewChangelogs) {
        fetchedChangelogs = await getFacultyRecordChangelogs(facultyid, 3, 0);
    }

    // Get input dropdown options and dependency mappings
    const opts: Map<string, Array<string>> = new Map();
    const dependencyMaps: Map<string, Map<string, string>> = new Map();

    opts.set('fieldsOfInterest', await getAllFieldsOfInterest());
    opts.set('appointmentStatuses', await getAllAppointmentStatuses());

    const ranks = await getAllRanks();
    opts.set(
        'rankTitles',
        ranks.map(({ title }) => title),
    );

    const rankTitlesToSalaryGrades: Map<string, string> = new Map(
        ranks.map(({ title, salaryGrade }) => [title, salaryGrade]),
    );
    dependencyMaps.set('rankTitlesToSalaryGrades', rankTitlesToSalaryGrades);

    const rankTitlesToSalaryRates: Map<string, string> = new Map(
        ranks.map(({ title, salaryRate }) => [title, salaryRate]),
    );
    dependencyMaps.set('rankTitlesToSalaryRates', rankTitlesToSalaryRates);

    return { profile, opts, dependencyMaps, fetchedChangelogs, canViewChangelogs };
}

export const actions = {
    async delete({ locals, request }) {
        const permissions = await getUserPermissions(locals.user.id);
        if (!permissions?.canModifyFaculty)
            return fail(403, { error: 'Insufficient permissions.' });

        const formData = await request.formData();
        const facultyidStr = formData.get('facultyid') as string;
        const facultyid = parseInt(facultyidStr, 10);

        if (Number.isNaN(facultyid)) return fail(400, { error: 'Invalid record identifier.' });

        const { success } = await deleteFacultyRecords(locals.user.id, [facultyid]);
        await refreshFacultyRecordSearchView();
        if (success) redirect(308, '/');
        return fail(500, { error: 'Failed to delete record.' });
    },

    async update({ locals, request, params }) {
        const permissions = await getUserPermissions(locals.user.id);
        if (!permissions?.canModifyFaculty)
            return fail(403, { error: 'Insufficient permissions.' });

        const formData = await request.formData();
        const facultyidStr = params.facultyid;
        const facultyid = parseInt(facultyidStr, 10);

        if (Number.isNaN(facultyid)) return fail(400, { error: 'Invalid record identifier.' });

        // Extract fields
        const getVal = (key: string) => {
            if (!formData.has(key)) return undefined;

            const val = formData.get(key) as string;

            if (val === '-') return null;
            if (val === '') {
                if (key.includes('date')) return null;
                return '';
            }
            return val;
        };

        const getDateVal = (key: string) => {
            const val = getVal(key);
            return val ? new Date(val as string) : new Date();
        };
        const mapBiologicalSex = (val: string | null | undefined) => {
            if (val === 'Male') return 'M';
            if (val === 'Female') return 'F';
            if (val === 'Intersex') return 'I';
            if (val === 'Unknown') return 'U';
            return val;
        };

        const basicProfile = {
            lastName: getVal('last-name'),
            firstName: getVal('first-name'),
            middleName: getVal('middle-name'),
            suffix: getVal('suffix') || null,
            birthDate: getDateVal('birth-date'),
            maidenName: getVal('maiden-name') || null,
            biologicalSex: mapBiologicalSex(getVal('biological-sex')),
            status: getVal('status') || null,
            dateOfOriginalAppointment: getDateVal('date-of-original-appointment'),
            remarks: getVal('remarks') || null,
            philhealth: getVal('philhealth') || '',
            pagibig: getVal('pagibig') || '',
            psiItem: getVal('psi-item') || '',
            tin: getVal('tin') || '',
            gsis: getVal('gsis') || '',
            employeeNumber: getVal('employee-number') || '',
        };

        // Helper function to parse dynamic table
        const parseTable = (tableName: string, colNames: string[]) => {
            const numOfRowsStr = formData.get(`${tableName}-num-of-rows`) as string;
            const deletedRowsStr = formData.get(`${tableName}-deletion`) as string;

            const numOfRows = parseInt(numOfRowsStr || '0', 10);
            const deletedRows: number[] = JSON.parse(deletedRowsStr || '[]');

            const parsedRecords = {
                create: [] as Record<string, any>[],
                update: [] as Record<string, any>[],
                delete: [] as number[],
            };

            for (let i = 0; i < numOfRows; i++) {
                const tupleidStr = formData.get(`${tableName}-${i}-tupleid`) as string | null;
                const tupleid = tupleidStr ? parseInt(tupleidStr, 10) : null;

                if (deletedRows.includes(i)) {
                    if (tupleid) parsedRecords.delete.push(tupleid);
                    continue;
                }

                const rowData: Record<string, any> = {};
                colNames.forEach((col) => {
                    let val = formData.get(`${i}[${col}]`);
                    if (val === '' || val === '-' || val === null) val = null;
                    rowData[col] = val;
                });

                if (tupleid) {
                    parsedRecords.update.push({ tupleid, ...rowData });
                } else {
                    const hasData = Object.values(rowData).some((val) => val !== null);
                    if (hasData) parsedRecords.create.push(rowData);
                }
            }
            return parsedRecords;
        };

        // Extract dynamic tables
        const dynamicTables = {
            emails: parseTable('emails', ['emails']),
            contactNumbers: parseTable('contact-numbers', ['contact-numbers']),
            homeAddresses: parseTable('home-addresses', ['home-addresses']),
            educationalAttainments: parseTable('educational-attainments', [
                'educational-attainment-degree',
                'educational-attainment-institution',
                'educational-attainment-gradyear',
            ]),
            fieldsOfInterest: parseTable('fields-of-interest', ['fields-of-interest']),
            promotionHistory: parseTable('promotion-history', [
                'promotion-history-rank',
                'promotion-history-appointment-status',
                'promotion-history-date',
            ]),
        };

        // Execute database update
        const { success } = await updateFacultyProfileRecords(
            facultyid,
            basicProfile,
            dynamicTables,
        );

        if (!success) return fail(500, { error: 'Failed to update faculty record.' });

        await refreshFacultyRecordSearchView();

        return { success: true };
    },
};
