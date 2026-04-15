import { error, fail, redirect } from '@sveltejs/kit';

import { adminPosition, faculty, rank } from '$lib/server/db/schema';
import { deleteFacultyRecords, getUserRoleAndPermissions } from '$lib/server/queries/db-helpers';
import type { FilterColumn, FilterObject } from '$lib/types/filter';
import {
    getAllAdminPositions,
    getAllRankTitles,
    getAllStatuses,
    getFacultyRecordList,
    refreshFacultyRecordSearchView,
} from '$lib/server/queries/faculty-list';

export async function load({ url, locals }) {
    // Check existing session
    if (typeof locals.user === 'undefined') throw redirect(307, '/login');

    // Check Permissions
    const [roleObj] = await getUserRoleAndPermissions(locals.user.id);
    if (typeof roleObj === 'undefined') throw redirect(307, '/login');

    const { canAddFaculty, canModifyFaculty, canViewChangelogs } = roleObj;
    const canViewFaculty = canAddFaculty || canModifyFaculty;
    if (!canViewFaculty) throw error(403, { message: 'Insufficient permissions.' });

    // Extract queries

    // Cursor and Direction
    const newCursorStr = url.searchParams.get('cursor');
    const isNextStr = url.searchParams.get('isNext'); // 0 or 1

    // eslint-disable-next-line no-undefined -- can't use null in Drizzle WHERE queries
    const newCursor = newCursorStr ? parseInt(newCursorStr, 10) : undefined;
    const isNext = isNextStr ? parseInt(isNextStr, 10) === 1 : true;

    // Filter

    const filters: FilterObject[] = [
        {
            name: 'Status',
            filter: 'status',
            opts: await getAllStatuses(),
            selectedOpts: url.searchParams.getAll('status'),
        },
        {
            name: 'Rank',
            filter: 'rank',
            opts: await getAllRankTitles(),
            selectedOpts: url.searchParams.getAll('rank'),
        },
        {
            name: 'Administrative Position',
            filter: 'adminposition',
            opts: await getAllAdminPositions(),
            selectedOpts: url.searchParams.getAll('adminposition'),
        },
    ];

    const filterMap: FilterColumn[] = [
        {
            obj: filters[0],
            column: faculty.status,
        },
        {
            obj: filters[1],
            column: rank.title,
        },
        {
            obj: filters[2],
            column: adminPosition.title,
        },
    ];

    // Search
    const searchTerm = url.searchParams.get('search');

    // Get faculty record list
    const { facultyRecordList, prevCursor, nextCursor, hasPrev, hasNext } =
        await getFacultyRecordList(
            searchTerm,
            filterMap,
            newCursor,
            isNext,
            !newCursorStr && !isNextStr,
        );

    return {
        facultyRecordList,
        prevCursor,
        nextCursor,
        hasPrev,
        hasNext,
        filters,
        searchTerm, // We send this back to the UI
        canViewChangelogs, // Added here
    };
}
export const actions = {
    async delete({ locals, request }) {
        // Check existing session
        if (typeof locals.user === 'undefined') throw redirect(307, '/login');

        // Check Permissions
        const [roleObj] = await getUserRoleAndPermissions(locals.user.id);
        if (typeof roleObj === 'undefined') throw redirect(307, '/login');

        const { canModifyFaculty } = roleObj;
        if (!canModifyFaculty) return fail(403, { error: 'Insufficient permissions.' });

        const formData = await request.formData();
        const idsString = formData.get('ids') as string;

        if (!idsString) return fail(400, { error: 'No IDs provided.' });

        try {
            const ids = JSON.parse(idsString);
            const response = await deleteFacultyRecords(locals.user.id, ids);
            await refreshFacultyRecordSearchView();
            return {
                ...response,
                message: response.success ? 'Deleted records.' : 'Failed to delete records.',
            };
        } catch {
            return fail(500, { error: 'Failed to delete records.' });
        }
    },
};
