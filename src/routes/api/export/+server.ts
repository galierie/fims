import { json } from '@sveltejs/kit';
import ExcelJS from '@protobi/exceljs';
import { getFacultyLoadingWorksheet } from '$lib/utils/report/faculty-loading';
import { getSubjectsByFacultyWorksheet } from '$lib/utils/report/subjects-by-faculty.js';

export async function GET({ url, locals }) {
    if (!locals.user) {
        return json({ error: 'Unauthorized. Please log in to export.' }, { status: 401 });
    }

    // Extract and Validate Parameters
    const typesStr = url.searchParams.get('types');
    if (typesStr === null) return json({ error: 'No report type specified' }, { status: 401 });
    const types = typesStr.split(',');

    const facultyIdsStr = url.searchParams.get('facultyIds');
    if (facultyIdsStr === null) return json({ error: 'No faculty member specified' }, { status: 401 });
    const facultyIds = facultyIdsStr.split(',').map(idStr => (parseInt(idStr, 10)));

    const fromAyStr = url.searchParams.get('fromAy');
    if (fromAyStr === null) return json({ error: 'No starting academic year specified' }, { status: 401 });
    const fromAy = parseInt(fromAyStr, 10);

    const fromSemStr = url.searchParams.get('fromSem');
    if (fromSemStr === null) return json({ error: 'No starting semester specified' }, { status: 401 });
    const fromSem = parseInt(fromSemStr, 10);

    const toAy = parseInt(url.searchParams.get('toAy') ?? fromAyStr, 10);
    const toSem = parseInt(url.searchParams.get('toSem') ?? fromSemStr, 10);

    // Get worksheets
    try {
        const sheets = await Promise.all(
            types.map(type => {
                switch (type) {
                    case 'loading':
                        return getFacultyLoadingWorksheet(facultyIds, fromAy);
                    case 'subjects-by-faculty':
                        return getSubjectsByFacultyWorksheet(facultyIds, fromAy, fromSem);
                }
            })
        );

        const workbook = new ExcelJS.Workbook();
        sheets.forEach(sheet => {
            if (typeof sheet === 'undefined') return;

            const { sheetName, model } = sheet;
            const clone = workbook.addWorksheet(sheetName);
            clone.model = model;
        });

        const buf = await workbook.xlsx.writeBuffer();

        return new Response(buf, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${types.join('-')}-${fromAy}-S${fromSem}.xlsx"`
            }
        });
    } catch (e) {
        console.error('Export critical failure:', e);
        return json({ error: 'Internal Server Error during export generation.' }, { status: 500 });
    }
};