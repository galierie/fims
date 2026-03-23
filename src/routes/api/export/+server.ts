import { json, type RequestHandler } from '@sveltejs/kit';
import * as XLSX from 'xlsx';
import { 
    getFacultyLoadingReport, 
    getSubjectsByFacultyReport, 
    getFacultyBySubjectReport,
    getFacultySETReport 
} from '../../../lib/server/queries/reports';

export const GET: RequestHandler = async ({ url, locals }) => {
    // 1. SECURITY FIX: Check if user is authenticated via Better Auth
    if (!locals.user) {
        return json({ error: 'Unauthorized. Please log in to export.' }, { status: 401 });
    }

    // 2. Extract and Validate Parameters
    const type = url.searchParams.get('type');
    const ay = parseInt(url.searchParams.get('ay') ?? '2026');
    const sem = parseInt(url.searchParams.get('sem') ?? '2');

    try {
        let data: any[] = [];
        let sheetName = "Report";

        // 3. Selection Logic
        if (type === 'loading') {
            data = await getFacultyLoadingReport(ay, sem);
            sheetName = "Faculty Loading";
        } else if (type === 'subjects') {
            data = await getSubjectsByFacultyReport(ay, sem);
            sheetName = "Subjects by Faculty";
        } else if (type === 'faculty-by-sub') {
            data = await getFacultyBySubjectReport(ay, sem);
            sheetName = "Faculty by Subject";
        } else if (type === 'set') {
            data = await getFacultySETReport(ay, sem);
            sheetName = "SET Averages";
        } else {
            return json({ error: 'Invalid report type requested.' }, { status: 400 });
        }

        // 4. DATA VALIDATION: Don't serve an empty file
        if (!data || data.length === 0) {
            return json({ 
                error: `No data found for Academic Year ${ay} Semester ${sem}.` 
            }, { status: 404 });
        }

        // 5. Excel Generation
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        
        // Using 'buffer' type for SvelteKit Response
        const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        return new Response(buf, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${type}_${ay}_S${sem}.xlsx"`
            }
        });

    } catch (e) {
        console.error('Export critical failure:', e);
        return json({ error: 'Internal Server Error during export generation.' }, { status: 500 });
    }
};