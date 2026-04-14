import ExcelJS from '@protobi/exceljs';
import { json, type RequestEvent } from '@sveltejs/kit';

import { getFacultyBySubjectWorksheet } from '$lib/utils/report/faculty-by-subject';
import { getFacultyLoadingWorksheet } from '$lib/utils/report/faculty-loading';
import { getFacultyProfileWorksheet } from '$lib/utils/report/faculty-profile';
import { getFacultyServiceRecordWorksheet } from '$lib/utils/report/faculty-service-record';
import { getFacultySETAverageWorksheet } from '$lib/utils/report/faculty-set-average';
import { getSubjectsByFacultyWorksheet } from '$lib/utils/report/subjects-by-faculty';

export async function GET({ url, locals }: RequestEvent) {
    if (!locals.user)
        return json({ error: 'Unauthorized. Please log in to export.' }, { status: 401 });

    // Extract and Validate Parameters
    const typesStr = url.searchParams.get('types');
    if (!typesStr) return json({ error: 'No report type specified' }, { status: 400 });
    const types = typesStr.split(',');

    const facultyIdsStr = url.searchParams.get('facultyIds');
    if (!facultyIdsStr) return json({ error: 'No faculty member specified' }, { status: 400 });
    const facultyIds = facultyIdsStr.split(',').map((idStr: string) => parseInt(idStr, 10));

    const isOnlyProfile = types.length === 1 && types[0] === 'profile';

    const rawFromAy = parseInt(url.searchParams.get('fromAy') || '0', 10);
    const rawFromSem = parseInt(url.searchParams.get('fromSem') || '0', 10);
    const rawToAy = parseInt(url.searchParams.get('toAy') ?? `${rawFromAy}`, 10);
    const rawToSem = parseInt(url.searchParams.get('toSem') ?? `${rawFromSem}`, 10);

    if (
        !isOnlyProfile &&
        (isNaN(rawFromAy) || isNaN(rawFromSem) || rawFromAy === 0 || rawFromSem === 0)
    )
        return json({ error: 'Invalid academic year/semester range' }, { status: 400 });

    // If ever the AY/sem are backwards (also added new feature for these in UI)
    let fromAy = rawFromAy;
    let fromSem = rawFromSem;
    let toAy = rawToAy;
    let toSem = rawToSem;
    if (!isOnlyProfile && (fromAy > toAy || (fromAy === toAy && fromSem > toSem))) {
        fromAy = rawToAy;
        fromSem = rawToSem;
        toAy = rawFromAy;
        toSem = rawFromSem;
    }

    const periods = [];
    if (isOnlyProfile) {
        periods.push({ ay: 0, sem: 0 });
    } else {
        let currAy = fromAy;
        let currSem = fromSem;
        while (currAy < toAy || (currAy === toAy && currSem <= toSem)) {
            periods.push({ ay: currAy, sem: currSem });
            currSem++;
            if (currSem > 3) {
                currSem = 1;
                currAy++;
            }
        }
    }

    // Fetch the requested reports for ALL periods
    try {
        const sheetPromises = [];

        // Isolate unique years for yearly reports (for Faculty Loading)
        const uniqueYears = Array.from(new Set(periods.map((p) => p.ay)));

        for (const type of types)
            if (type === 'profile')
                sheetPromises.push(
                    getFacultyProfileWorksheet(facultyIds).then((sheet) => {
                        if (sheet) sheet.sheetName = 'Faculty Profile';
                        return sheet;
                    }),
                );
            else if (type === 'service-record')
                // Service record queries by individual faculty ID over the whole date range
                for (const id of facultyIds)
                    sheetPromises.push(
                        getFacultyServiceRecordWorksheet(id, fromAy, fromSem, toAy, toSem).then(
                            (sheet) => {
                                return sheet;
                            },
                        ),
                    );
            else if (type === 'loading')
                for (const { ay, sem } of periods)
                    sheetPromises.push(
                        getFacultyLoadingWorksheet(facultyIds, ay, sem).then((sheet) => {
                            // Convert 2023 to 23 to save tab space
                            const shortAy = ay.toString().slice(-2);
                            const shortNextAy = (ay + 1).toString().slice(-2);
                            if (sheet) sheet.sheetName = `Loading AY${shortAy}-${shortNextAy} S${sem}`;
                            return sheet;
                        }),
                    );
            else if (type === 'set-avg')
                for (const ay of uniqueYears)
                    sheetPromises.push(
                        getFacultySETAverageWorksheet(facultyIds, ay).then((sheet) => {
                            const shortAy = ay.toString().slice(-2);
                            const shortNextAy = (ay + 1).toString().slice(-2);
                            if (sheet) sheet.sheetName = `SET Avg AY${shortAy}-${shortNextAy}`;
                            return sheet;
                        }),
                    );
            else if (type === 'subjects-by-faculty')
                for (const { ay, sem } of periods)
                    sheetPromises.push(
                        getSubjectsByFacultyWorksheet(facultyIds, ay, sem).then((sheet) => {
                            const shortAy = ay.toString().slice(-2);
                            const shortNextAy = (ay + 1).toString().slice(-2);
                            if (sheet) sheet.sheetName = `Subj by Fac AY${shortAy}-${shortNextAy} S${sem}`;
                            return sheet;
                        }),
                    );
            else if (type === 'faculty-by-subject')
                sheetPromises.push(
                    getFacultyBySubjectWorksheet().then((sheet) => {
                        if (sheet) sheet.sheetName = `By Subject, Faculty Taught`;
                        return sheet;
                    }),
                );
            else console.warn(`Report type '${type}' is not yet fully implemented.`);

        const sheets = await Promise.all(sheetPromises);

        // Compile everything into a single Excel Workbook
        const workbook = new ExcelJS.Workbook();
        let addedSheets = 0;

        sheets.forEach((sheet) => {
            if (!sheet) return;
            const { sheetName, model } = sheet;

            let finalSheetName = sheetName;
            let counter = 1;
            while (workbook.getWorksheet(finalSheetName)) {
                finalSheetName = `${sheetName} (${counter})`;
                counter++;
            }

            const clone = workbook.addWorksheet(finalSheetName);
            clone.model = model;
            clone.name = finalSheetName;
            addedSheets++;
        });

        if (addedSheets === 0) workbook.addWorksheet('No Data Generated');

        const buf = await workbook.xlsx.writeBuffer();

        const customFileName = url.searchParams.get('fileName');
        const finalName = customFileName
            ? `${customFileName}.xlsx`
            : isOnlyProfile
              ? 'Faculty_Profile.xlsx'
              : `Export-AY${fromAy}-S${fromSem}-to-AY${toAy}-S${toSem}.xlsx`;

        return new Response(buf, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${finalName}"`,
            },
        });
    } catch (e) {
        console.error('Export critical failure:', e);
        return json({ error: 'Internal Server Error during export generation.' }, { status: 500 });
    }
}
