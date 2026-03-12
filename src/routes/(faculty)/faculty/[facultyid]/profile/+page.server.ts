import { error, fail, redirect } from '@sveltejs/kit';

import { deleteFacultyRecords, updateFacultyProfileRecords } from '$lib/server/queries/db-helpers';
import {
    getAllAppointmentStatuses,
    getAllFieldsOfInterest,
    getAllRanks,
    getFacultyProfile,
} from '$lib/server/queries/faculty-view';
import { refreshFacultyRecordSearchView } from '$lib/server/queries/faculty-list';

export async function load({ params }) {
    const { facultyid: facultyidStr } = params;
    const facultyid = parseInt(facultyidStr, 10);

    // Validate parameter
    if (Number.isNaN(facultyid)) throw error(400, { message: 'Invalid record identifier.' });

    const profile = await getFacultyProfile(facultyid);

    // Validate output
    if (profile === null) throw error(400, { message: 'No record found.' });

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

    return { profile, opts, dependencyMaps };
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

    async update({ locals, request, params }) {
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

        const basicProfile = {
            lastname: getVal('last-name'),
            firstname: getVal('first-name'),
            middlename: getVal('middle-name'),
            suffix: getVal('suffix'),
            birthdate: getVal('birth-date'),
            maidenname: getVal('maiden-name'),
            status: getVal('status'),
            dateoforiginalappointment: getVal('date-of-original-appointment'),
            remarks: getVal('remarks'),
            philhealth: getVal('philhealth'),
            pagibig: getVal('pagibig'),
            psiitem: getVal('psi-item'),
            tin: getVal('tin'),
            gsis: getVal('gsis'),
            employeenumber: getVal('employee-number'),
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
