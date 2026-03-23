import { json, type RequestHandler } from '@sveltejs/kit';
import * as XLSX from 'xlsx';
// Use relative path to avoid the $lib alias issue while debugging
import { 
    getFacultyLoadingReport, 
    getSubjectsReport, 
    getFacultySETReport 
} from '../../../lib/server/queries/reports';

export const GET: RequestHandler = async ({ url }) => {
    const type = url.searchParams.get('type');
    const ay = parseInt(url.searchParams.get('ay') ?? '2026');
    const sem = parseInt(url.searchParams.get('sem') ?? '2');

    try {
        let data: any[] = [];
        let sheetName = "Report";

        if (type === 'loading') {
            data = await getFacultyLoadingReport(ay, sem);
            sheetName = "Faculty Loading";
        } else if (type === 'subjects') {
            data = await getSubjectsReport(ay, sem);
            sheetName = "Subjects Taught";
        } else if (type === 'set') {
            data = await getFacultySETReport(ay, sem);
            sheetName = "SET Averages";
        } else {
            return json({ error: 'Invalid report type' }, { status: 400 });
        }

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        return new Response(buf, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${type}_report_${ay}_S${sem}.xlsx"`
            }
        });
    } catch (e) {
        console.error('Export error:', e);
        return json({ error: 'Failed to generate Excel file' }, { status: 500 });
    }
};