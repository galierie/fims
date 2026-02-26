import { type Actions, error, fail } from '@sveltejs/kit';
import { APIError } from 'better-auth';

import { areYouHere, deleteUsersInfo, makeUserInfo } from '$lib/server/db-helpers';
import { auth } from '$lib/server/auth';
import type { FilterColumn, FilterObject } from '$lib/types/filter';
import {
    getAccountList,
    getAllRoles,
    refreshAccountSearchView,
} from '$lib/server/account-list-helpers';
import { userinfo } from '$lib/server/db/schema';

export async function load({ locals, parent, url }) {
    const { canViewAccounts } = await parent();
    if (!canViewAccounts) throw error(404, { message: 'Insufficient permissions.' });

    const userRoles = await getAllRoles();

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
            name: 'Role',
            filter: 'role',
            opts: userRoles,
            selectedOpts: url.searchParams.getAll('role'),
        },
    ];

    const filterMap: FilterColumn[] = [
        {
            obj: filters[0],
            column: userinfo.role,
        },
    ];

    // Search
    const searchTerm = url.searchParams.get('search');

    // Get account list
    const { accountList, prevCursor, nextCursor, hasPrev, hasNext } = await getAccountList(
        locals.user.id,
        searchTerm,
        filterMap,
        newCursor,
        isNext,
        !newCursorStr && !isNextStr,
    );

    return {
        accountList,
        prevCursor,
        nextCursor,
        hasPrev,
        hasNext,
        filters,
        userRoles,
        searchTerm,
    };
}

export const actions = {
    async makeAccount({ locals, request }) {
        const data = await request.formData();
        const email = data.get('email') as string;
        const password = data.get('password') as string;
        const role = data.get('role') as string;

        // Validate credentials
        if (!email || !email.endsWith('@up.edu.ph')) return fail(400, { error: 'Invalid email.' });
        if (await areYouHere(email))
            return fail(400, { error: 'Email is already associated with an account.' });

        if (!password) return fail(400, { error: 'Invalid password.' });

        if (!role) return fail(400, { error: 'Invalid role.' });

        // Register as user
        try {
            const response = await auth.api.createUser({
                body: {
                    email,
                    password,
                    name: 'User',
                    role: role === 'IT' ? 'admin' : 'user',
                },
            });

            if (response.user.id === '') return fail(500, { error: 'Failed to make new account.' });

            // Add user info
            await makeUserInfo(locals.user.id, response.user.id, role);

            // Refresh account search view
            await refreshAccountSearchView();
        } catch (error) {
            return fail(500, {
                error: error instanceof APIError ? error.message : 'Failed to make new account.',
            });
        }

        return {
            success: true,
            message: 'Created account.',
        };
    },

    async deleteAccount({ locals, request }) {
        const data = await request.formData();
        const userid = data.get('userid') as string;

        // Validate input
        if (!userid) return fail(400, { error: 'Failed to delete account.' });

        // Delete user info
        await deleteUsersInfo(locals.user.id, [userid]);

        // Delete!
        const response = await auth.api.removeUser({
            body: {
                userId: userid,
            },
            headers: request.headers,
        });

        // Refresh account search view
        await refreshAccountSearchView();

        return {
            ...response,
            message: response.success ? 'Deleted account.' : 'Failed to delete account.',
        };
    },

    async deleteAccounts({ locals, request }) {
        const formData = await request.formData();
        const useridsStr = formData.get('userids') as string;

        // Validate input
        if (!useridsStr) return fail(400, { error: 'No accounts selected.' });

        try {
            const userids: string[] = JSON.parse(useridsStr);

            // Delete user info
            await deleteUsersInfo(locals.user.id, userids);

            // Delete!
            let success = true;
            userids.forEach(async (userid) => {
                const { success: result } = await auth.api.removeUser({
                    body: {
                        userId: userid,
                    },
                    headers: request.headers,
                });

                success = result;
            });

            // Refresh account search view
            await refreshAccountSearchView();

            return {
                success,
                message: success ? 'Deleted accounts.' : 'Failed to delete accounts.',
            };
        } catch {
            return fail(500, { error: 'Failed to delete accounts.' });
        }
    },
} satisfies Actions;
