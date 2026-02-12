// src/routes/dashboard/+page.server.ts
import { db } from '$lib/server/db/index';
import { faculty } from '$lib/server/db/schema';

export async function load() {
    // Task 4: Fetch faculty list from DB
    try {
        const facultyList = await db.select().from(faculty);
        return {
            facultyList,
        };
    } catch (e) {
        console.error('DB Fetch Error:', e);
        return { facultyList: [], error: 'Database connection failed.' };
    }
}
